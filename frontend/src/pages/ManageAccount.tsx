import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import {
  getBuyerAccount,
  updateBuyerAccount,
  changeBuyerPassword,
  type BuyerAccountInfo,
} from '../services/buyerAccountService';
import {
  getBuyerAddresses,
  createBuyerAddress,
  updateBuyerAddress,
  deleteBuyerAddress,
  setDefaultAddress,
  type BuyerAddress,
  type CreateAddressPayload,
} from '../services/buyerAddressService';
import { validatePassword } from '../utils/validation';
import locations from '../data/locations';

type TabType = 'personal' | 'password' | 'addresses';

const ManageAccount: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Personal Info State
  const [accountInfo, setAccountInfo] = useState<BuyerAccountInfo | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasPersonalChanges, setHasPersonalChanges] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Address State
  const [addresses, setAddresses] = useState<BuyerAddress[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<CreateAddressPayload>({
    label: '',
    fullName: '',
    contactNumber: '',
    streetAddress: '',
    locality: '',
    province: '',
    city: '',
    area: '',
    addressNotes: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!user || user.role !== 'buyer') {
      navigate('/');
      return;
    }
    loadAccountData();
  }, [user, navigate]);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadPersonalInfo(), loadAddresses()]);
    } catch (error: any) {
      console.error('Failed to load account data:', error);
      showToast({
        type: 'error',
        title: 'Failed to load account information',
        message: error?.response?.data?.error || 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalInfo = async () => {
    try {
      const data = await getBuyerAccount();
      setAccountInfo(data);
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
    } catch (error: any) {
      console.error('Failed to load personal info:', error);
      throw error;
    }
  };

  const loadAddresses = async () => {
    try {
      const data = await getBuyerAddresses();
      setAddresses(data);
    } catch (error: any) {
      console.error('Failed to load addresses:', error);
      // Don't throw - addresses might not exist yet
    }
  };

  // Track personal info changes (email and phone are not editable, so exclude them)
  useEffect(() => {
    if (accountInfo) {
      const hasChanges =
        firstName !== accountInfo.firstName ||
        lastName !== accountInfo.lastName;
      setHasPersonalChanges(hasChanges);
    }
  }, [firstName, lastName, accountInfo]);

  const handleSavePersonalInfo = async () => {
    if (!hasPersonalChanges) {
      showToast({
        type: 'info',
        title: 'No changes',
        message: 'No changes to save',
      });
      return;
    }

    // Validation
    if (!firstName.trim() || firstName.trim().length < 2) {
      showToast({
        type: 'error',
        title: 'Invalid first name',
        message: 'First name must be at least 2 characters',
      });
      return;
    }

    if (!lastName.trim() || lastName.trim().length < 2) {
      showToast({
        type: 'error',
        title: 'Invalid last name',
        message: 'Last name must be at least 2 characters',
      });
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast({
        type: 'error',
        title: 'Invalid email',
        message: 'Please enter a valid email address',
      });
      return;
    }

    try {
      setSaving(true);
      // Don't send email and phone as they are not editable
      const updated = await updateBuyerAccount({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        // email and phone are not editable - don't send them
      });

      setAccountInfo(updated);
      setHasPersonalChanges(false);

      // Refresh user data in auth context
      await refreshUser();

      showToast({
        type: 'success',
        title: 'Information updated',
        message: 'Your personal information has been updated successfully',
      });
    } catch (error: any) {
      const errors = error?.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        showToast({
          type: 'error',
          title: 'Update failed',
          message: Array.isArray(firstError) ? firstError[0] : String(firstError),
        });
      } else {
        showToast({
          type: 'error',
          title: 'Update failed',
          message: error?.response?.data?.error || 'Failed to update information. Please try again.',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast({
        type: 'error',
        title: 'All fields required',
        message: 'Please fill in all password fields',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({
        type: 'error',
        title: 'Passwords do not match',
        message: 'New password and confirm password must match',
      });
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      showToast({
        type: 'error',
        title: 'Invalid password',
        message: passwordValidation.message,
      });
      return;
    }

    try {
      setSaving(true);
      await changeBuyerPassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      showToast({
        type: 'success',
        title: 'Password changed',
        message: 'Your password has been changed successfully',
      });
    } catch (error: any) {
      // Check for fieldErrors first (validation errors)
      const fieldErrors = error?.response?.data?.fieldErrors;
      if (fieldErrors) {
        // Get the first field error message
        const firstFieldError = Object.values(fieldErrors)[0];
        const errorMessage = Array.isArray(firstFieldError) ? firstFieldError[0] : String(firstFieldError);
        showToast({
          type: 'error',
          title: 'Password change failed',
          message: errorMessage,
        });
      } else {
        // Check for errors object (alternative format)
        const errors = error?.response?.data?.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          showToast({
            type: 'error',
            title: 'Password change failed',
            message: Array.isArray(firstError) ? firstError[0] : String(firstError),
          });
        } else {
          // Fallback to error message
          showToast({
            type: 'error',
            title: 'Password change failed',
            message: error?.response?.data?.error || 'Failed to change password. Please try again.',
          });
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = (address: BuyerAddress) => {
    setEditingAddressId(address.addressId);
    setAddressForm({
      label: address.label || '',
      fullName: address.fullName,
      contactNumber: address.contactNumber,
      streetAddress: address.streetAddress,
      locality: address.locality,
      province: address.province,
      city: address.city,
      area: address.area,
      addressNotes: address.addressNotes,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: '',
      fullName: '',
      contactNumber: '',
      streetAddress: '',
      locality: '',
      province: '',
      city: '',
      area: '',
      addressNotes: '',
      isDefault: false,
    });
    setShowAddressForm(true);
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm({
      label: '',
      fullName: '',
      contactNumber: '',
      streetAddress: '',
      locality: '',
      province: '',
      city: '',
      area: '',
      addressNotes: '',
      isDefault: false,
    });
  };

  const handleSaveAddress = async () => {
    // Validation
    if (!addressForm.fullName.trim()) {
      showToast({
        type: 'error',
        title: 'Full name required',
        message: 'Please enter your full name',
      });
      return;
    }

    if (!addressForm.contactNumber.trim()) {
      showToast({
        type: 'error',
        title: 'Contact number required',
        message: 'Please enter your contact number',
      });
      return;
    }

    if (!addressForm.streetAddress.trim()) {
      showToast({
        type: 'error',
        title: 'Street address required',
        message: 'Please enter your street address',
      });
      return;
    }

    if (!addressForm.locality.trim()) {
      showToast({
        type: 'error',
        title: 'Locality required',
        message: 'Please enter your locality',
      });
      return;
    }

    if (!addressForm.province.trim()) {
      showToast({
        type: 'error',
        title: 'Province required',
        message: 'Please enter your province',
      });
      return;
    }

    if (!addressForm.city.trim()) {
      showToast({
        type: 'error',
        title: 'City required',
        message: 'Please enter your city',
      });
      return;
    }

    if (!addressForm.area.trim()) {
      showToast({
        type: 'error',
        title: 'Area required',
        message: 'Please enter your area',
      });
      return;
    }

    try {
      setSaving(true);
      if (editingAddressId) {
        // Update existing address
        await updateBuyerAddress(editingAddressId, addressForm);
        showToast({
          type: 'success',
          title: 'Address updated',
          message: 'Your address has been updated successfully',
        });
      } else {
        // Create new address
        await createBuyerAddress(addressForm);
        showToast({
          type: 'success',
          title: 'Address added',
          message: 'Your address has been added successfully',
        });
      }
      await loadAddresses();
      handleCancelAddressForm();
    } catch (error: any) {
      const errors = error?.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0];
        showToast({
          type: 'error',
          title: 'Save failed',
          message: Array.isArray(firstError) ? firstError[0] : String(firstError),
        });
      } else {
        showToast({
          type: 'error',
          title: 'Save failed',
          message: error?.response?.data?.error || 'Failed to save address. Please try again.',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setSaving(true);
      await deleteBuyerAddress(addressId);
      showToast({
        type: 'success',
        title: 'Address deleted',
        message: 'Your address has been deleted successfully',
      });
      await loadAddresses();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Delete failed',
        message: error?.response?.data?.error || 'Failed to delete address. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      setSaving(true);
      await setDefaultAddress(addressId);
      showToast({
        type: 'success',
        title: 'Default address updated',
        message: 'Your default address has been updated',
      });
      await loadAddresses();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Update failed',
        message: error?.response?.data?.error || 'Failed to set default address. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full h-[42px] rounded-[10px] border border-[#C5C5C5] shadow-[2px_3px_4px_rgba(46,204,113,0.05)] px-3 text-[13px] text-[#000000] bg-white outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20 transition-colors';

  const textareaClass =
    'w-full min-h-[100px] rounded-[10px] border border-[#C5C5C5] shadow-[2px_3px_4px_rgba(46,204,113,0.05)] px-3 py-2 text-[13px] text-[#000000] bg-white outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20 transition-colors resize-y';

  const selectClass =
    'w-full h-[42px] rounded-[10px] border border-[#C5C5C5] shadow-[2px_3px_4px_rgba(46,204,113,0.05)] px-3 pr-8 text-[13px] bg-white outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20 transition-colors appearance-none cursor-pointer';

  // Get select color class for placeholder styling
  const getSelectColorClass = (currentValue: string) =>
    currentValue ? 'text-[#000000]' : 'text-[#B8B1B1]';

  // Location lists based on selections
  const provinceList = Object.keys(locations);
  const cityList = addressForm.province ? Object.keys(locations[addressForm.province] || {}) : [];
  const areaList = addressForm.province && addressForm.city ? (locations[addressForm.province]?.[addressForm.city] || []) : [];

  // Handle address form field changes with cascading dropdown logic
  const handleAddressFieldChange = (field: keyof CreateAddressPayload, value: string) => {
    setAddressForm(prev => {
      const next = { ...prev, [field]: value };
      // Clear dependent fields when parent changes
      if (field === 'province') {
        next.city = '';
        next.area = '';
      } else if (field === 'city') {
        next.area = '';
      }
      return next;
    });
  };

  if (loading) {
    return (
      <>
        <Header variant="full" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading account information...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header variant="full" />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Your Account</h1>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'personal'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'password'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Change Password
              </button>
              {/* Addresses tab - Hidden but code preserved for future use */}
              {/* <button
                onClick={() => setActiveTab('addresses')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'addresses'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Addresses
              </button> */}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={inputClass}
                            placeholder="Enter first name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={inputClass}
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          disabled
                          className={`${inputClass} bg-gray-100 cursor-not-allowed opacity-75`}
                          placeholder="Enter email address"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Email cannot be changed. Contact support if you need to update your email.
                        </p>
                        {accountInfo && email && accountInfo.isEmailVerified === true && (
                          <p className="mt-1 text-xs text-green-600">
                            ✓ Email verified
                          </p>
                        )}
                        {accountInfo && email && (accountInfo.isEmailVerified === false || accountInfo.isEmailVerified === undefined) && (
                          <p className="mt-1 text-xs text-yellow-600">
                            Email verification pending. Please check your inbox to verify your email.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          disabled
                          className={`${inputClass} bg-gray-100 cursor-not-allowed opacity-75`}
                          placeholder="Enter phone number"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Phone number cannot be changed. Contact support if you need to update your phone number.
                        </p>
                        {accountInfo && phone && accountInfo.isPhoneVerified === true && (
                          <p className="mt-1 text-xs text-green-600">
                            ✓ Phone verified
                          </p>
                        )}
                        {accountInfo && phone && (accountInfo.isPhoneVerified === false || accountInfo.isPhoneVerified === undefined) && (
                          <p className="mt-1 text-xs text-yellow-600">
                            Phone verification pending. Please verify your phone number.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSavePersonalInfo}
                      disabled={!hasPersonalChanges || saving}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        hasPersonalChanges && !saving
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={inputClass}
                          placeholder="Enter current password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={inputClass}
                          placeholder="Enter new password"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Password must be 8+ characters with uppercase, lowercase, number, and special character
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={inputClass}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={handleChangePassword}
                      disabled={!currentPassword || !newPassword || !confirmPassword || saving}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        currentPassword && newPassword && confirmPassword && !saving
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              )}

              {/* Addresses Tab - Hidden but code preserved for future use */}
              {false && activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
                    <button
                      onClick={handleAddAddress}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      + Add New Address
                    </button>
                  </div>

                  {/* Address Form (Add/Edit) */}
                  {showAddressForm && (
                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {editingAddressId ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Label (Optional)
                          </label>
                          <input
                            type="text"
                            value={addressForm.label}
                            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                            className={inputClass}
                            placeholder="e.g., Home, Work, Office"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            className={inputClass}
                            placeholder="Enter full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={addressForm.contactNumber}
                            onChange={(e) => setAddressForm({ ...addressForm, contactNumber: e.target.value })}
                            className={inputClass}
                            placeholder="Enter contact number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.streetAddress}
                            onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                            className={inputClass}
                            placeholder="Enter street address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Locality <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.locality}
                            onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                            className={inputClass}
                            placeholder="Colony / Suburb / Locality / Landmark"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Province <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={addressForm.province}
                              onChange={(e) => handleAddressFieldChange('province', e.target.value)}
                              className={`${selectClass} ${getSelectColorClass(addressForm.province)}`}
                            >
                              <option value="" disabled>
                                Select Province
                              </option>
                              {provinceList.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9l6 6 6-6" stroke="#B8B1B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={addressForm.city}
                              onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                              disabled={!addressForm.province}
                              className={`${selectClass} ${getSelectColorClass(addressForm.city)} ${!addressForm.province ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
                            >
                              <option value="" disabled>
                                Select City
                              </option>
                              {cityList.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9l6 6 6-6" stroke="#B8B1B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Area <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={addressForm.area}
                              onChange={(e) => handleAddressFieldChange('area', e.target.value)}
                              disabled={!addressForm.province || !addressForm.city}
                              className={`${selectClass} ${getSelectColorClass(addressForm.area)} ${!addressForm.province || !addressForm.city ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
                            >
                              <option value="" disabled>
                                Select Area
                              </option>
                              {areaList.map((a) => (
                                <option key={a} value={a}>
                                  {a}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9l6 6 6-6" stroke="#B8B1B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Notes <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={addressForm.addressNotes}
                            onChange={(e) => setAddressForm({ ...addressForm, addressNotes: e.target.value })}
                            className={textareaClass}
                            placeholder="Full address description"
                            rows={3}
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                            Set as default address
                          </label>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            onClick={handleCancelAddressForm}
                            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveAddress}
                            disabled={saving}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              saving
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {saving ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Addresses List */}
                  {addresses.length === 0 && !showAddressForm ? (
                    <div className="text-center py-12 border border-gray-200 rounded-lg">
                      <p className="text-gray-500 mb-4">No addresses saved yet</p>
                      <button
                        onClick={handleAddAddress}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.addressId}
                          className={`border rounded-lg p-4 ${
                            address.isDefault ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {address.label && (
                                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                                    {address.label}
                                  </span>
                                )}
                                {address.isDefault && (
                                  <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-gray-900 mb-1">{address.fullName}</p>
                              <p className="text-sm text-gray-600 mb-1">{address.contactNumber}</p>
                              <p className="text-sm text-gray-600 mb-1">
                                {address.streetAddress}, {address.locality}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.province}, {address.area}
                              </p>
                              {address.addressNotes && (
                                <p className="text-sm text-gray-500 mt-2">{address.addressNotes}</p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              {!address.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultAddress(address.addressId)}
                                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                  disabled={saving}
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                onClick={() => handleEditAddress(address)}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                disabled={saving}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.addressId)}
                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                disabled={saving}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageAccount;

