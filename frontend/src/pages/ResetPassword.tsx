import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginLayout from '../components/auth/LoginLayout';
import FormField from '../components/auth/FormField';
import ActionButton from '../components/auth/ActionButton';
import { useToast } from '../contexts/ToastContext';
import { resetPasswordWithToken } from '../services/authService';
import loginImage from '../assets/images/auth/Rectangle 114.png';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const query = useQuery();
  const token = query.get('token') || '';
  const userType = (query.get('userType') === 'seller') ? 'seller' : 'buyer';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; general?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const isStrong = (p: string) =>
    p.length >= 8 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p);

  // Check if form is valid (for button disable state)
  const isFormValid = () => {
    if (!token) return false;
    return isStrong(password) && password === confirm && confirm.length > 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrors({});
    if (!token) {
      setErrors({ general: 'Invalid or missing token' });
      setSubmitting(false);
      return;
    }
    if (!isStrong(password)) {
      setErrors({ password: 'Password must be 8+ chars with upper, lower, number, and special char' });
      setSubmitting(false);
      return;
    }
    if (password !== confirm) {
      setErrors({ confirm: 'Passwords do not match' });
      setSubmitting(false);
      return;
    }
    try {
      await resetPasswordWithToken({ token, newPassword: password, confirmPassword: confirm });
      showToast({ type: 'success', title: 'Password reset successfully' });
      navigate(`/login?userType=${userType}`);
    } catch (err: any) {
      const data = err?.response?.data || {};
      const msg = data?.error || err?.message || 'Reset failed';
      const field = data?.fieldErrors || {};
      setErrors({
        password: field.newPassword,
        confirm: field.confirmPassword,
        general: (!field.newPassword && !field.confirmPassword) ? msg : undefined,
      });
      showToast({ type: 'error', title: 'Reset failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LoginLayout imageSrc={loginImage} imageAlt="Reset Password">
      <div className="max-w-[352px] md:max-w-[600px] mx-auto">
        <h1 className="text-[20px] md:text-[40px] font-semibold text-black mb-4 md:mb-6">Reset password</h1>
        {errors.general && <div className="text-red-500 text-[12px] md:text-[16px] mb-2">{errors.general}</div>}
        <form onSubmit={onSubmit} className="space-y-5 md:space-y-6">
          {/* Password Field with Real-time Validation */}
          <div>
            <FormField
              type="password"
              name="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined, general: undefined })); }}
              placeholder="New password"
              required
              error="" // Don't show error message - use real-time validation instead
            />
            {password && (
              <div className="mt-2 text-[10px] text-[#8D98AA]">
                <div className="font-medium mb-1">Password requirements:</div>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li className={password.length >= 8 ? 'text-[#2ECC71]' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(password) ? 'text-[#2ECC71]' : ''}>
                    One uppercase letter (A-Z)
                  </li>
                  <li className={/[a-z]/.test(password) ? 'text-[#2ECC71]' : ''}>
                    One lowercase letter (a-z)
                  </li>
                  <li className={/\d/.test(password) ? 'text-[#2ECC71]' : ''}>
                    One number (0-9)
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(password) ? 'text-[#2ECC71]' : ''}>
                    One special character (!@#$%^&*...)
                  </li>
                </ul>
              </div>
            )}
            {password && isStrong(password) && (
              <div className="text-[#2ECC71] text-[10px] mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Password looks good
              </div>
            )}
          </div>

          {/* Confirm Password Field with Real-time Matching */}
          <div>
            <FormField
              type="password"
              name="confirm"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: undefined, general: undefined })); }}
              placeholder="Confirm password"
              required
              error="" // Don't show error message - use real-time validation instead
            />
            {confirm && (
              <div className="mt-1">
                {confirm === password && password.length > 0 ? (
                  <div className="text-[#2ECC71] text-[10px] flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Passwords match
                  </div>
                ) : (
                  <div className="text-red-500 text-[10px] flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Passwords do not match
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mb-6 flex justify-center md:block">
            <ActionButton
              type="submit"
              text={submitting ? 'Resetting…' : 'Reset password'}
              className={`w-[352px] md:w-full h-[29px] md:h-[48px] rounded-[45px] text-[15px] md:text-[25px] transition-colors ${
                isFormValid() && !submitting
                  ? 'bg-[#2ECC71] text-white hover:bg-[#27AE60] cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
              }`}
              disabled={!isFormValid() || submitting}
            />
          </div>
        </form>
      </div>
    </LoginLayout>
  );
};

export default ResetPassword;


