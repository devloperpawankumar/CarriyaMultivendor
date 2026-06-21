import React, { useState, useEffect, useRef } from 'react';
import {
  getPersonalInfo,
  updatePersonalInfo,
  type PersonalInfo,
} from '../../../services/sellerSettingsService';
import { useToast } from '../../../contexts/ToastContext';
import { validatePassword } from '../../../utils/validation';

const inputClass =
  'w-full max-w-[594px] h-[42px] rounded-[10px] border border-[#C5C5C5] shadow-[2px_3px_4px_rgba(46,204,113,0.05)] px-3 text-[13px] text-[#000000] bg-white outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20 transition-colors';

const BusinessDocuments: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const loadingRef = useRef(false); // Prevent duplicate calls

  // Load personal info on mount (with duplicate prevention)
  useEffect(() => {
    if (loadingRef.current) return; // Already loading
    loadingRef.current = true;
    loadPersonalInfo().finally(() => {
      loadingRef.current = false;
    });
  }, []);

  // Validate name in real-time with better spacing handling
  useEffect(() => {
    const trimmedName = name.trim();
    if (trimmedName) {
      // Check if there's a space in the name
      const hasSpace = trimmedName.includes(' ');
      const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0);
      
      if (!hasSpace) {
        // No space detected - guide user to add last name
        setNameError('Please add a space and your last name (e.g., "John Smith")');
      } else if (nameParts.length < 2) {
        // Space exists but only one part (likely extra spaces)
        setNameError('Please enter both first name and last name separated by a space');
      } else if (nameParts.length > 2) {
        // Multiple parts - this is fine (middle names, etc.)
        // Validate first and last parts
        if (nameParts[0].length < 2) {
          setNameError('First name must be at least 2 characters');
        } else if (nameParts[nameParts.length - 1].length < 2) {
          setNameError('Last name must be at least 2 characters');
        } else {
          setNameError(null);
        }
      } else if (nameParts[0].length < 2) {
        setNameError('First name must be at least 2 characters');
      } else if (nameParts[1].length < 2) {
        setNameError('Last name must be at least 2 characters');
      } else {
        setNameError(null);
      }
    } else {
      setNameError(null);
    }
  }, [name]);

  // Track changes (email is disabled, so don't track it)
  useEffect(() => {
    if (personalInfo) {
      const hasNameChange = name !== `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
      const hasStoreNameChange = storeName !== personalInfo.storeName;
      const hasPasswordChange = currentPassword.length > 0 || newPassword.length > 0;
      setHasChanges(hasNameChange || hasStoreNameChange || hasPasswordChange);
    }
  }, [name, storeName, currentPassword, newPassword, personalInfo]);

  const loadPersonalInfo = async () => {
    try {
      setLoading(true);
      const data = await getPersonalInfo();
      setPersonalInfo(data);
      setName(`${data.firstName} ${data.lastName}`.trim());
      setEmail(data.email);
      setStoreName(data.storeName);
    } catch (error: any) {
      console.error('Failed to load personal info:', error);
      showToast({
        type: 'error',
        title: 'Failed to load information',
        message: error?.response?.data?.error || error?.message || 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges && !currentPassword && !newPassword) {
      showToast({
        type: 'info',
        title: 'No changes',
        message: 'No changes to save',
      });
      return;
    }

    // Validate name if changed (with better spacing handling)
    if (name.trim() && name !== `${personalInfo?.firstName} ${personalInfo?.lastName}`.trim()) {
      const trimmedName = name.trim();
      const hasSpace = trimmedName.includes(' ');
      const nameParts = trimmedName.split(/\s+/).filter(part => part.length > 0);
      
      if (!hasSpace) {
        showToast({
          type: 'error',
          title: 'Last name required',
          message: 'Please add a space and your last name (e.g., "John Smith")',
        });
        return;
      }
      
      if (nameParts.length < 2) {
        showToast({
          type: 'error',
          title: 'Name required',
          message: 'Please enter both first name and last name separated by a space',
        });
        return;
      }
      
      if (nameParts[0].length < 2) {
        showToast({
          type: 'error',
          title: 'Invalid first name',
          message: 'First name must be at least 2 characters',
        });
        return;
      }
      
      if (nameParts[nameParts.length - 1].length < 2) {
        showToast({
          type: 'error',
          title: 'Invalid last name',
          message: 'Last name must be at least 2 characters',
        });
        return;
      }
    }

    // Validate password if provided
    if (currentPassword || newPassword) {
      if (!currentPassword) {
        showToast({
          type: 'error',
          title: 'Password required',
          message: 'Please enter your current password',
        });
        return;
      }

      if (!newPassword) {
        showToast({
          type: 'error',
          title: 'New password required',
          message: 'Please enter a new password',
        });
        return;
      }

      // Validate new password strength
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        showToast({
          type: 'error',
          title: 'Invalid password',
          message: passwordValidation.message,
        });
        return;
      }
    }

    try {
      setSaving(true);

      // Parse name into firstName and lastName
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const updatePayload: any = {};

      if (firstName && firstName !== personalInfo?.firstName) {
        updatePayload.firstName = firstName;
      }
      if (lastName !== personalInfo?.lastName) {
        updatePayload.lastName = lastName;
      }
      // Email is disabled, don't include it in update
      if (storeName !== personalInfo?.storeName) {
        updatePayload.storeName = storeName;
      }
      if (currentPassword && newPassword) {
        updatePayload.currentPassword = currentPassword;
        updatePayload.newPassword = newPassword;
      }

      const updated = await updatePersonalInfo(updatePayload);
      setPersonalInfo(updated);
      setName(`${updated.firstName} ${updated.lastName}`.trim());
      setEmail(updated.email);
      setStoreName(updated.storeName);
      setCurrentPassword('');
      setNewPassword('');
      setHasChanges(false);

      showToast({
        type: 'success',
        title: 'Information updated',
        message: 'Your personal information has been updated successfully',
      });
    } catch (error: any) {
      console.error('Failed to update personal info:', error);
      const errorData = error?.response?.data;
      const fieldErrors = errorData?.fieldErrors || {};
      
      // Handle specific field errors with exact messages
      if (fieldErrors.currentPassword) {
        showToast({
          type: 'error',
          title: 'Current password error',
          message: fieldErrors.currentPassword,
        });
        return;
      }

      if (fieldErrors.newPassword) {
        showToast({
          type: 'error',
          title: 'New password error',
          message: fieldErrors.newPassword,
        });
        return;
      }

      if (fieldErrors.firstName) {
        showToast({
          type: 'error',
          title: 'First name error',
          message: fieldErrors.firstName,
        });
        return;
      }

      if (fieldErrors.lastName) {
        showToast({
          type: 'error',
          title: 'Last name error',
          message: fieldErrors.lastName,
        });
        return;
      }

      if (fieldErrors.storeName) {
        showToast({
          type: 'error',
          title: 'Store name error',
          message: fieldErrors.storeName,
        });
        return;
      }

      // If there are multiple field errors, show all of them
      const fieldErrorKeys = Object.keys(fieldErrors);
      if (fieldErrorKeys.length > 0) {
        const errorMessages = fieldErrorKeys.map(key => `${key}: ${fieldErrors[key]}`).join(', ');
        showToast({
          type: 'error',
          title: 'Validation errors',
          message: errorMessages,
        });
        return;
      }

      // Fallback to general error message
      const errorMessage = errorData?.error || error?.message || 'Please try again later';
      
      showToast({
        type: 'error',
        title: 'Failed to update information',
        message: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (personalInfo) {
      setName(`${personalInfo.firstName} ${personalInfo.lastName}`.trim());
      setEmail(personalInfo.email);
      setStoreName(personalInfo.storeName);
      setCurrentPassword('');
      setNewPassword('');
      setHasChanges(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#4C535F] text-[14px]">Loading information...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 md:space-y-6 md:px-6">
      {/* Edit Name */}
      <div>
        <div className="text-[#4C535F] text-[12px] mb-2">Edit Name</div>
        <input
          className={inputClass + (nameError ? ' border-red-500 focus:border-red-500 focus:ring-red-500/20' : '')}
          value={name}
          onChange={(e) => {
            let value = e.target.value;
            // Auto-format: ensure single space between words (remove extra spaces)
            value = value.replace(/\s+/g, ' ');
            setName(value);
          }}
          placeholder="First Name Last Name"
          onBlur={(e) => {
            // Auto-trim on blur to clean up extra spaces
            const trimmed = e.target.value.trim().replace(/\s+/g, ' ');
            if (trimmed !== name) {
              setName(trimmed);
            }
          }}
        />
        {nameError && (
          <div className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {nameError}
          </div>
        )}
        {!nameError && name.trim() && (
          <div className="text-[#2ECC71] text-[10px] mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Name looks good
          </div>
        )}
        {!name && (
          <div className="text-[#8D98AA] text-[10px] mt-1">
            Enter both first name and last name separated by a space (e.g., "John Smith")
          </div>
        )}
      </div>

      {/* Your Email */}
      <div>
        <div className="text-[#4C535F] text-[12px] mb-2">Your Email</div>
        <input
          type="email"
          className={inputClass + ' opacity-60 cursor-not-allowed'}
          value={email}
          disabled
          placeholder="Enter Email"
          title="Email cannot be changed"
        />
        <div className="text-[#8D98AA] text-[10px] mt-1">Email cannot be changed</div>
      </div>

      {/* Change Password */}
      <div>
        <div className="text-[#4C535F] text-[12px] mb-2">Change Password</div>
        <div className="space-y-4">
          <input
            type="password"
            className={inputClass + ' placeholder-[#B8B1B1]'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter Current password"
          />
          <div>
          <input
            type="password"
            className={inputClass + ' placeholder-[#B8B1B1]'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter New password"
          />
            {newPassword && (
              <div className="mt-2 text-[10px] text-[#8D98AA]">
                <div className="font-medium mb-1">Password requirements:</div>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li className={newPassword.length >= 8 ? 'text-[#2ECC71]' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? 'text-[#2ECC71]' : ''}>
                    One uppercase letter (A-Z)
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? 'text-[#2ECC71]' : ''}>
                    One lowercase letter (a-z)
                  </li>
                  <li className={/\d/.test(newPassword) ? 'text-[#2ECC71]' : ''}>
                    One number (0-9)
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-[#2ECC71]' : ''}>
                    One special character (!@#$%^&*...)
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Store Name */}
      <div>
        <div className="text-[#4C535F] text-[12px] mb-2">Edit Store Name</div>
        <input
          className={inputClass}
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Current name"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center md:gap-16 gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges || !!nameError}
          className={`bg-[#2ECC71] text-white rounded-lg px-5 h-[49px] text-[14px] font-bold transition-all ${
            saving || !hasChanges || !!nameError
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#27AE60] active:scale-95'
          }`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={handleReset}
          disabled={saving || (!hasChanges && !nameError)}
          className={`text-[#4C535F] text-[14px] font-medium transition-colors ${
            saving || (!hasChanges && !nameError)
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:text-[#2ECC71]'
          }`}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default BusinessDocuments;
