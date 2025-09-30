import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import ActionButton from '../components/auth/ActionButton';
import bankVerificationImage from '../assets/images/auth/Rectangle 114 (3).png';
import uploadImage from '../assets/images/auth/Upload.png';

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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BankVerificationFormData>({
    accountName: '',
    accountNumber: '',
    ibanNumber: '',
    bankName: '',
    branchCode: '',
    bankDocument: null,
  });

  const handleInputChange = (field: keyof BankVerificationFormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (file: File) => {
    handleInputChange('bankDocument', file);
  };

  // Mobile/Desktop: unified submit action (no form event required)
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Here you would typically send the data to your backend
      console.log('Bank verification data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to the seller dashboard
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Error submitting bank verification:', error);
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
          </div>
        </div>

        <div className="mb-4 md:mb-[27px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Bank Account Number"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[23px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder:text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
            />
          </div>
        </div>

        <div className="mb-4 md:mb-[27px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Bank IBAN Number"
              value={formData.ibanNumber}
              onChange={(e) => handleInputChange('ibanNumber', e.target.value)}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[23px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder:text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
            />
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
          </div>
        </div>

        <div className="mb-4 md:mb-[27px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Branch Code"
              value={formData.branchCode}
              onChange={(e) => handleInputChange('branchCode', e.target.value)}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[23px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder:text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
            />
          </div>
        </div>

        {/* Mobile: LEFT aligned upload box with ≈127x105; Desktop: original align/size */}
        <div className="mb-4 md:mb-[27px]">
          <h3 className="text-[15px] md:text-[30px] font-medium text-black mb-2 md:mb-4">
            Bank Information Document – First Page
          </h3>
          <div className="relative flex justify-start md:justify-end py-2 md:py-3">
            <div className="w-[150px] h-[120px] md:w-[269px] md:h-[221px] border-2 border md:border border-[#B8B1B1] rounded-[30px] md:rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-[#2ECC71] transition-colors">
              <div className="w-[90px] h-[80px] md:w-[153px]  mt-2 md:h-[137px] border border-[#2ECC71] rounded-[30px] md:rounded-[25px] flex items-center justify-center mb-2 md:mb-4">
                <div className="w-[70px] h-[72px] md:w-[120px] md:h-[124px] flex items-center justify-center">
                  <img src={uploadImage} alt="Upload" className="w-full h-full object-contain" />
                </div>
              </div>
              <p className="text-[10px] md:text-[20px] text-[#B8B1B1] font-normal">
                Drag or Click to upload
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
            disabled={isLoading}
            className="h-[38px] md:h-[67px] px-6 md:px-0 bg-[#2ECC71] text-white text-[16px] md:text-[30px] font-medium md:font-bold rounded-[10px] md:rounded-[15px] w-auto md:w-[234px]"
          />
        </div>
      </div>
    </SignupLayout>
  );
};

export default BankVerification;
