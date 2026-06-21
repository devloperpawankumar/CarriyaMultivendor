import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginLayout from '../components/auth/LoginLayout';
import FormField from '../components/auth/FormField';
import ActionButton from '../components/auth/ActionButton';
import { useToast } from '../contexts/ToastContext';
import { requestPasswordResetEmail } from '../services/authService';
import loginImage from '../assets/images/auth/Rectangle 114.png';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const userType = (params.get('userType') === 'seller') ? 'seller' : 'buyer';
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(undefined);
    try {
      await requestPasswordResetEmail(email.trim().toLowerCase(), userType as 'buyer' | 'seller');
      showToast({ type: 'success', title: 'If registered, a reset link was sent' });
      navigate(`/login?userType=${userType}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Request failed';
      setError(msg);
      showToast({ type: 'error', title: 'Request failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LoginLayout imageSrc={loginImage} imageAlt="Forgot Password">
      <div className="max-w-[352px] md:max-w-[600px] mx-auto">
        <h1 className="text-[20px] md:text-[40px] font-semibold text-black mb-4 md:mb-6">Forgot password</h1>
        {error && <div className="text-red-500 text-[12px] md:text-[16px] mb-2">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-5 md:space-y-6">
          <FormField
            type="email"
            name="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(undefined); }}
            placeholder="Enter Email"
            required
          />
          <div className="mb-6 flex justify-center md:block">
            <ActionButton
              type="submit"
              text={submitting ? 'Sending…' : 'Send reset link'}
              className="w-[352px] md:w-full h-[29px] md:h-[48px] bg-[#2ECC71] text-white rounded-[45px] text-[15px] md:text-[25px] hover:bg-[#27AE60]"
              disabled={submitting}
            />
          </div>
        </form>
      </div>
    </LoginLayout>
  );
};

export default ForgotPassword;


