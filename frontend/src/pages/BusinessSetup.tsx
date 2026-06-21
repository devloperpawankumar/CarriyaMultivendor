import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import ActionButton from '../components/auth/ActionButton';
import businessSetupImage from '../assets/images/auth/Rectangle 114 (3).png';
import uploadImage from '../assets/images/auth/Upload.png';
import { uploadIdImagesAPI, uploadSingleImageAPI, submitBusiness, getOnboardingStatus } from '../services/onboardingService';
import { useToast } from '../contexts/ToastContext';
interface BusinessSetupFormData {
  nameOnId: string;
  idCardNumber: string;
  frontIdImage: File | null;
  backIdImage: File | null;
}

const BusinessSetup: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [frontPreviewUrl, setFrontPreviewUrl] = useState<string>('');
  const [backPreviewUrl, setBackPreviewUrl] = useState<string>('');
  const [frontPublicId, setFrontPublicId] = useState<string>('');
  const [backPublicId, setBackPublicId] = useState<string>('');
  const [formData, setFormData] = useState<BusinessSetupFormData>({
    nameOnId: '',
    idCardNumber: '',
    frontIdImage: null,
    backIdImage: null,
  });
  const [nameError, setNameError] = useState('');
  const [idCardError, setIdCardError] = useState('');

  // Pakistan ID Card Number validation (13 digits only)
  const validatePakistanIdCard = (idCard: string): boolean => {
    const cleanId = idCard.replace(/\D/g, ''); // Remove non-digits
    return cleanId.length === 13 && /^\d{13}$/.test(cleanId);
  };

  // Name validation (at least 2 characters, letters and spaces only)
  const validateName = (name: string): boolean => {
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && /^[a-zA-Z\s]+$/.test(trimmedName);
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
        if (steps.idVerification && !steps.bank) { navigate('/bank-verification'); return; }
      } catch {}
    })();
  }, [navigate]);

  const handleInputChange = (field: keyof BusinessSetupFormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Real-time validation
    if (field === 'nameOnId' && typeof value === 'string') {
      if (value.trim() && !validateName(value)) {
        setNameError('Name must contain only letters and spaces, at least 2 characters');
      } else {
        setNameError('');
      }
    }

    if (field === 'idCardNumber' && typeof value === 'string') {
      // Only allow digits and limit to 13 characters
      const numericValue = value.replace(/\D/g, '').slice(0, 13);
      setFormData(prev => ({
        ...prev,
        [field]: numericValue,
      }));

      if (numericValue.length > 0 && !validatePakistanIdCard(numericValue)) {
        if (numericValue.length < 13) {
          setIdCardError(' ID card number must be exactly 13 digits');
        } else {
          setIdCardError('Please enter a valid National ID card number');
        }
      } else {
        setIdCardError('');
      }
    }
  };

  const handleFileUpload = async (field: 'frontIdImage' | 'backIdImage', file: File) => {
    handleInputChange(field, file);
    try {
      if (field === 'frontIdImage') setUploadingFront(true);
      if (field === 'backIdImage') setUploadingBack(true);
      const { url, publicId } = await uploadSingleImageAPI(file);
      if (field === 'frontIdImage') { setFrontPreviewUrl(url); setFrontPublicId(publicId || ''); }
      if (field === 'backIdImage') { setBackPreviewUrl(url); setBackPublicId(publicId || ''); }
    } catch (e) {
      console.error('Preview upload failed:', e);
    } finally {
      if (field === 'frontIdImage') setUploadingFront(false);
      if (field === 'backIdImage') setUploadingBack(false);
    }
  };

  const isFormValid = useMemo(() => {
    return (
      validateName(formData.nameOnId) &&
      validatePakistanIdCard(formData.idCardNumber) &&
      !!frontPreviewUrl &&
      !!backPreviewUrl &&
      !uploadingFront &&
      !uploadingBack &&
      !nameError &&
      !idCardError
    );
  }, [formData.nameOnId, formData.idCardNumber, frontPreviewUrl, backPreviewUrl, uploadingFront, uploadingBack, nameError, idCardError]);

  // Mobile/Desktop: unified submit action (no form event required)
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const userId = (() => { try { return localStorage.getItem('onboardingUserId') || ''; } catch { return ''; } })();
      if (!userId) throw new Error('Missing userId for onboarding');
      if (!frontPreviewUrl || !backPreviewUrl) throw new Error('Please upload both front and back ID images');

      // Call new step endpoint via service submitBusiness
      await submitBusiness({
        userId,
        idCardName: formData.nameOnId,
        idCardNumber: formData.idCardNumber,
        idCardFrontUrl: frontPreviewUrl,
        idCardBackUrl: backPreviewUrl,
      });
      
      // Navigate to the next step
      navigate('/bank-verification');
    } catch (error: any) {
      console.error('Error submitting business setup:', error);
      const fieldErrors = error?.response?.data?.fieldErrors || {};
      if (fieldErrors.idCardNumber) {
        showToast({
          type: 'error',
          title: 'ID Card Number Already Used',
          message: fieldErrors.idCardNumber,
        });
      } else {
        showToast({
          type: 'error',
          title: 'Business setup failed',
          message: error?.response?.data?.error || error?.message || 'Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignupLayout
      imageSrc={businessSetupImage}
      imageAlt="Business Setup"
      imageHeight="tall"
    >
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <div className="max-w-[352px] md:max-w-[600px] mx-auto lg:mx-0">
        {/* Mobile: compact heading; Desktop: larger heading */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-[20px] md:text-[40px] font-semibold text-black mb-1 md:mb-2">
            Complete you Business Setup
          </h1>
        </div>

        {/* Mobile: section heading smaller; Desktop: larger */}
        <div className="mb-4 md:mb-8">
          <h2 className="text-[20px] md:text-[30px] font-medium text-black mb-1 md:mb-2">
            Upload National ID Document
          </h2>
        </div>

        {/* Mobile: 38px height, 10px radius; Desktop: 67px, 15px radius */}
        <div className="mb-4 md:mb-[27px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Name written on ID Card (Exactly Same)"
              value={formData.nameOnId}
              onChange={(e) => handleInputChange('nameOnId', e.target.value)}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[23px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder:text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
            />
            {nameError && (
              <p className="text-red-500 text-xs mt-1 ml-1">{nameError}</p>
            )}
          </div>
        </div>

        {/* Mobile: compact input; Desktop: large input */}
        <div className="mb-4 md:mb-[27px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your ID Card Number (13 digits)"
              value={formData.idCardNumber}
              onChange={(e) => handleInputChange('idCardNumber', e.target.value)}
              maxLength={13}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[23px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder:text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
            />
            {idCardError && (
              <p className="text-red-500 text-xs mt-1 ml-1">{idCardError}</p>
            )}
          </div>
        </div>

        {/* Mobile: smaller subsection; Desktop: larger */}
        <div className="mb-4 md:mb-[27px]">
          <h3 className="text-[15px] md:text-[30px] font-medium text-black mb-2 md:mb-4">
            Upload front side of ID Card
          </h3>
          {/* Mobile: LEFT aligned upload box with exact-ish size (≈127x105); Desktop: original centered/right align */}
          <div className="relative flex justify-start md:justify-end py-2 md:py-3">
            <div className="w-[150px]  h-[120px] md:w-[269px] md:h-[221px] border-2 border border-[#B8B1B1] rounded-[30px] md:rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-[#2ECC71] transition-colors relative overflow-hidden">
              <div className="w-[90px] h-[80px] md:w-[153px] mt-2 md:h-[137px] border border-[#2ECC71] rounded-[30px] md:rounded-[25px] flex items-center justify-center mb-2 md:mb-4 bg-white">
                {frontPreviewUrl ? (
                  <img src={frontPreviewUrl} alt="Front Preview" className="w-full h-full object-cover rounded-[25px]" />
                ) : (
                  <div className="w-[70px] h-[72px] md:w-[120px] md:h-[124px] flex items-center justify-center">
                    <img src={uploadImage} alt="Upload" />
                  </div>
                )}
              </div>
              <p className="text-[10px] md:text-[20px] text-[#B8B1B1] font-normal">
                {uploadingFront ? 'Uploading... Please wait' : 'Drag or Click to upload'}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload('frontIdImage', e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Mobile: smaller subsection; Desktop: larger */}
        <div className="mb-6 md:mb-[54px]">
          <h3 className="text-[15px] md:text-[30px] font-medium text-black mb-2 md:mb-4">
            Upload back side of ID Card
          </h3>
          {/* Mobile: LEFT aligned upload box with exact-ish size (≈127x105); Desktop: original centered/right align */}
          <div className="relative flex justify-start md:justify-end  md:py-3">
            <div className="w-[150px]  h-[120px] md:w-[269px] md:h-[221px] border-2  border-[#B8B1B1] rounded-[30px] md:rounded-[20px] flex flex-col items-center justify-center cursor-pointer py-2 hover:border-[#2ECC71] transition-colors relative overflow-hidden">
              <div className="w-[90px] h-[80px] mt-2 md:w-[153px] md:h-[137px] border border-[#2ECC71] rounded-[30px] md:rounded-[25px] flex items-center justify-center mb-2 md:mb-4 ">
                {backPreviewUrl ? (
                  <img src={backPreviewUrl} alt="Back Preview" className="w-full h-full object-cover rounded-[25px]" />
                ) : (
                  <div className="w-[70px] h-[72px]  md:w-[120px] md:h-[124px] flex items-center justify-center">
                    <img src={uploadImage} alt="Upload" />
                  </div>
                )}
              </div>
              <p className="text-[10px] md:text-[20px] text-[#B8B1B1] font-normal">
                {uploadingBack ? 'Uploading... Please wait' : 'Drag or Click to upload'}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload('backIdImage', e.target.files[0]);
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

export default BusinessSetup;
