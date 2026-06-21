import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import ActionButton from '../components/auth/ActionButton';
import bankVerificationImage from '../assets/images/auth/Rectangle 114 (3).png';
import uploadImage from '../assets/images/auth/Upload.png';
import { uploadSingleImageAPI, submitBank, getOnboardingStatus } from '../services/onboardingService';
import { useToast } from '../contexts/ToastContext';

interface BankVerificationFormData {
  accountName: string;
  accountNumber: string;
  ibanNumber: string;
  bankName: string;
  branchCode: string;
  bankDocument: File | null;
}

const BankVerification: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string>('');
  const [documentPublicId, setDocumentPublicId] = useState<string>('');
  const [formData, setFormData] = useState<BankVerificationFormData>({
    accountName: '',
    accountNumber: '',
    ibanNumber: '',
    bankName: '',
    branchCode: '',
    bankDocument: null,
  });
  const [accountNameError, setAccountNameError] = useState('');
  const [accountNumberError, setAccountNumberError] = useState('');
  const [ibanError, setIbanError] = useState('');
  const [bankNameError, setBankNameError] = useState('');
  const [branchCodeError, setBranchCodeError] = useState('');

  // Validation functions
  const validateAccountName = (name: string): boolean => {
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && /^[a-zA-Z\s]+$/.test(trimmedName);
  };

  const validateAccountNumber = (accountNumber: string): boolean => {
    const cleanNumber = accountNumber.replace(/\D/g, '');
    return cleanNumber.length >= 8 && cleanNumber.length <= 16 && /^\d+$/.test(cleanNumber);
  };

  const validatePakistanIban = (iban: string): boolean => {
    // Pakistan IBAN format: PK + 2 check digits + 4 bank code + 16 account number = 24 characters
    // Format: PK + KK + BBBB + AAAAAAAAAAAAAAAA
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    return /^PK[A-Z0-9]{22}$/.test(cleanIban);
  };

  const validateBankName = (bankName: string): boolean => {
    const trimmedName = bankName.trim();
    return trimmedName.length >= 2 && /^[a-zA-Z\s&.-]+$/.test(trimmedName);
  };

  const validateBranchCode = (branchCode: string): boolean => {
    const trimmedCode = branchCode.trim();
    return trimmedCode.length === 4 && /^\d{4}$/.test(trimmedCode);
  };

  // Prevent duplicate flow if already completed
  React.useEffect(() => {
    (async () => {
      try {
        const userId = localStorage.getItem('onboardingUserId') || '';
        if (!userId) return;
        const status = await getOnboardingStatus(userId);
        const data: any = (status as any)?.data || status;
        if (data?.status === 'completed') { navigate('/seller/dashboard'); return; }
        const steps = data?.steps || {};
        if (!steps.otpVerified || !steps.basicInfo) { navigate('/whatsapp-otp-verification'); return; }
        if (!steps.emailVerified) { navigate('/email-verification-page'); return; }
        if (!steps.address) { navigate('/seller-address-setup'); return; }
        if (!steps.idVerification) { navigate('/business-setup'); return; }
      } catch {}
    })();
  }, [navigate]);

  const handleInputChange = (field: keyof BankVerificationFormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Real-time validation for each field
    if (field === 'accountName' && typeof value === 'string') {
      if (value.trim() && !validateAccountName(value)) {
        setAccountNameError('Account name must contain only letters and spaces, at least 2 characters');
      } else {
        setAccountNameError('');
      }
    }

    if (field === 'accountNumber' && typeof value === 'string') {
      // Only allow digits
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [field]: numericValue,
      }));

      if (numericValue.length > 0 && !validateAccountNumber(numericValue)) {
        if (numericValue.length < 8) {
          setAccountNumberError('Account number must be at least 8 digits');
        } else if (numericValue.length > 16) {
          setAccountNumberError('Account number must not exceed 16 digits');
        } else {
          setAccountNumberError('Please enter a valid account number');
        }
      } else {
        setAccountNumberError('');
      }
    }

    if (field === 'ibanNumber' && typeof value === 'string') {
      // Convert to uppercase and remove spaces for validation
      // Allow letters and numbers, convert to uppercase
      const cleanIban = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      setFormData(prev => ({
        ...prev,
        [field]: cleanIban,
      }));

      if (cleanIban.length > 0 && !validatePakistanIban(cleanIban)) {
        if (cleanIban.length < 24) {
          setIbanError('IBAN Number must be 24 characters ');
        } else {
          setIbanError('Please enter a valid IBAN Number');
        }
      } else {
        setIbanError('');
      }
    }

    if (field === 'bankName' && typeof value === 'string') {
      if (value.trim() && !validateBankName(value)) {
        setBankNameError('Bank name must contain only letters and spaces');
      } else {
        setBankNameError('');
      }
    }

    if (field === 'branchCode' && typeof value === 'string') {
      // Only allow digits and limit to 4 characters
      const numericValue = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({
        ...prev,
        [field]: numericValue,
      }));

      if (numericValue.length > 0 && !validateBranchCode(numericValue)) {
        if (numericValue.length < 4) {
          setBranchCodeError('Branch code must be exactly 4 digits');
        } else {
          setBranchCodeError('Please enter a valid branch code');
        }
      } else {
        setBranchCodeError('');
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    handleInputChange('bankDocument', file);
    try {
      setUploadingDoc(true);
      const { url, publicId } = await uploadSingleImageAPI(file);
      setDocumentPreviewUrl(url);
      setDocumentPublicId(publicId || '');
    } catch (e) {
      console.error('Bank doc upload failed:', e);
    } finally {
      setUploadingDoc(false);
    }
  };

  const isFormValid = React.useMemo(() => {
    return (
      validateAccountName(formData.accountName) &&
      validateAccountNumber(formData.accountNumber) &&
      validatePakistanIban(formData.ibanNumber) &&
      validateBankName(formData.bankName) &&
      validateBranchCode(formData.branchCode) &&
      !!documentPreviewUrl &&
      !uploadingDoc &&
      !accountNameError &&
      !accountNumberError &&
      !ibanError &&
      !bankNameError &&
      !branchCodeError
    );
  }, [formData.accountName, formData.accountNumber, formData.ibanNumber, formData.bankName, formData.branchCode, documentPreviewUrl, uploadingDoc, accountNameError, accountNumberError, ibanError, bankNameError, branchCodeError]);

  // Mobile/Desktop: unified submit action (no form event required)
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const userId = (() => { try { return localStorage.getItem('onboardingUserId') || ''; } catch { return ''; } })();
      if (!userId) throw new Error('Missing userId for onboarding');
      await submitBank({
        userId,
        accountHolderName: formData.accountName,
        accountNumber: formData.accountNumber,
        ibanNumber: formData.ibanNumber,
        bankName: formData.bankName,
        branchCode: formData.branchCode,
        bankDocumentUrl: documentPreviewUrl,
      });
      
      // Navigate to the seller dashboard
      navigate('/seller/dashboard');
    } catch (error: any) {
      console.error('Error submitting bank verification:', error);
      const fieldErrors = error?.response?.data?.fieldErrors || {};
      if (fieldErrors.accountNumber) {
        showToast({
          type: 'error',
          title: 'Bank account already used',
          message: fieldErrors.accountNumber,
        });
      } else if (fieldErrors.ibanNumber) {
        showToast({
          type: 'error',
          title: 'IBAN already used',
          message: fieldErrors.ibanNumber,
        });
      } else {
        showToast({
          type: 'error',
          title: 'Bank verification failed',
          message: error?.response?.data?.error || error?.message || 'Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignupLayout
      imageSrc={bankVerificationImage}
      imageAlt="Bank Verification"
      imageHeight="tall"
    >
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
      <div className="max-w-[352px] md:max-w-[600px] mx-auto lg:mx-0">
        {/* Mobile: compact heading; Desktop: larger heading */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-[20px] md:text-[40px] font-semibold text-black mb-1 md:mb-2">
            Complete you Business Setup
          </h1>
        </div>

        {/* Mobile: smaller section heading; Desktop: larger */}
        <div className="mb-4 md:mb-8">
          <h2 className="text-[20px] md:text-[30px] font-medium text-black mb-1 md:mb-2">
            Verify Bank Information
          </h2>
        </div>

        {/* Mobile inputs: 38px height, 10px radius; Desktop: 67px, 15px radius */}
        <div className="mb-4 md:mb-[27px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Account Name"
              value={formData.accountName}
              onChange={(e) => handleInputChange('accountName', e.target.value)}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[23px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder:text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
            />
            {accountNameError && (
              <p className="text-red-500 text-xs mt-1 ml-1">{accountNameError}</p>
            )}
          </div>
        </div>

        <div className="mb-4 md:mb-[27px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Bank Account Number"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              maxLength={16}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[23px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder:text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
            />
            {accountNumberError && (
              <p className="text-red-500 text-xs mt-1 ml-1">{accountNumberError}</p>
            )}
          </div>
        </div>

        <div className="mb-4 md:mb-[27px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Bank IBAN Number"
              value={formData.ibanNumber}
              onChange={(e) => handleInputChange('ibanNumber', e.target.value)}
              maxLength={24}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[23px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder:text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
            />
            {ibanError && (
              <p className="text-red-500 text-xs mt-1 ml-1">{ibanError}</p>
            )}
          </div>
        </div>

        <div className="mb-4 md:mb-[27px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Bank Name"
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[23px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder:text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
            />
            {bankNameError && (
              <p className="text-red-500 text-xs mt-1 ml-1">{bankNameError}</p>
            )}
          </div>
        </div>

        <div className="mb-4 md:mb-[27px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Branch Code"
              value={formData.branchCode}
              onChange={(e) => handleInputChange('branchCode', e.target.value)}
              maxLength={4}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[23px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder:text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
            />
            {branchCodeError && (
              <p className="text-red-500 text-xs mt-1 ml-1">{branchCodeError}</p>
            )}
          </div>
        </div>

        {/* Mobile: LEFT aligned upload box with ≈127x105; Desktop: original align/size */}
        <div className="mb-4 md:mb-[27px]">
          <h3 className="text-[15px] md:text-[30px] font-medium text-black mb-2 md:mb-4">
            Bank Information Document – First Page
          </h3>
          <div className="relative flex justify-start md:justify-end py-2 md:py-3">
            <div className="w-[150px] h-[120px] md:w-[269px] md:h-[221px] border-2 md:border border-[#B8B1B1] rounded-[30px] md:rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-[#2ECC71] transition-colors relative overflow-hidden">
              <div className="w-[90px] h-[80px] md:w-[153px] mt-2 md:h-[137px] border border-[#2ECC71] rounded-[30px] md:rounded-[25px] flex items-center justify-center mb-2 md:mb-4 bg-white">
                {documentPreviewUrl ? (
                  <img src={documentPreviewUrl} alt="Bank Document" className="w-full h-full object-cover rounded-[25px]" />
                ) : (
                  <div className="w-[70px] h-[72px] md:w-[120px] md:h-[124px] flex items-center justify-center">
                    <img src={uploadImage} alt="Upload" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
              <p className="text-[10px] md:text-[20px] text-[#B8B1B1] font-normal">
                {uploadingDoc ? 'Uploading... Please wait' : 'Drag or Click to upload'}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Mobile: hug-width centered button; Desktop: larger fixed button */}
        <div className="mb-10 md:mb-20 flex justify-start md:block">
          <ActionButton
            type="button"
            text="Continue Next"
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid}
            className="h-[38px] md:h-[67px] px-6 md:px-0 bg-[#2ECC71] text-white text-[16px] md:text-[30px] font-medium md:font-bold rounded-[10px] md:rounded-[15px] w-auto md:w-[234px]"
          />
        </div>
      </div>
    </SignupLayout>
  );
};

export default BankVerification;
