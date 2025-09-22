import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupLayout from '../components/auth/SignupLayout';
import ActionButton from '../components/auth/ActionButton';
import businessSetupImage from '../assets/images/auth/Rectangle 114 (3).png';
import uploadImage from '../assets/images/auth/Upload.png';
interface BusinessSetupFormData {
  nameOnId: string;
  idCardNumber: string;
  frontIdImage: File | null;
  backIdImage: File | null;
}

const BusinessSetup: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BusinessSetupFormData>({
    nameOnId: '',
    idCardNumber: '',
    frontIdImage: null,
    backIdImage: null,
  });

  const handleInputChange = (field: keyof BusinessSetupFormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (field: 'frontIdImage' | 'backIdImage', file: File) => {
    handleInputChange(field, file);
  };

  // Mobile/Desktop: unified submit action (no form event required)
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Here you would typically send the data to your backend
      console.log('Business setup data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to the next step
      navigate('/bank-verification');
    } catch (error) {
      console.error('Error submitting business setup:', error);
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
          </div>
        </div>

        {/* Mobile: compact input; Desktop: large input */}
        <div className="mb-4 md:mb-[27px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your ID Card Number"
              value={formData.idCardNumber}
              onChange={(e) => handleInputChange('idCardNumber', e.target.value)}
              className="w-full h-[38px] md:h-[67px] px-[18px] md:px-[23px] py-[10px] md:py-[19px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder:text-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]"
            />
          </div>
        </div>

        {/* Mobile: smaller subsection; Desktop: larger */}
        <div className="mb-4 md:mb-[27px]">
          <h3 className="text-[15px] md:text-[30px] font-medium text-black mb-2 md:mb-4">
            Upload front side of ID Card
          </h3>
          {/* Mobile: LEFT aligned upload box with exact-ish size (≈127x105); Desktop: original centered/right align */}
          <div className="relative flex justify-start md:justify-end py-2 md:py-3">
            <div className="w-[150px]  h-[120px] md:w-[269px] md:h-[221px] border-2 border border-[#B8B1B1] rounded-[30px] md:rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-[#2ECC71] transition-colors">
              <div className="w-[90px] h-[80px] md:w-[153px] mt-2 md:h-[137px] border border-[#2ECC71] rounded-[30px] md:rounded-[25px] flex items-center justify-center mb-2 md:mb-4">
                <div className="w-[70px] h-[72px] md:w-[120px] md:h-[124px] flex items-center justify-center">
                  <img src={uploadImage} alt="Upload" />
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
            <div className="w-[150px]  h-[120px] md:w-[269px] md:h-[221px] border-2  border-[#B8B1B1] rounded-[30px] md:rounded-[20px] flex flex-col items-center justify-center cursor-pointer py-2
            
            hover:border-[#2ECC71] transition-colors">
              <div className="w-[90px] h-[80px] mt-2 md:w-[153px] md:h-[137px] border border-[#2ECC71] rounded-[30px] md:rounded-[25px] flex items-center justify-center mb-2 md:mb-4 ">
                <div className="w-[70px] h-[72px]  md:w-[120px] md:h-[124px] flex items-center justify-center">
                  <img src={uploadImage} alt="Upload" />
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
            disabled={isLoading}
            className="h-[38px] md:h-[67px] px-6 md:px-0 bg-[#2ECC71] text-white text-[16px] md:text-[30px] font-medium md:font-bold rounded-[10px] md:rounded-[15px] w-auto md:w-[234px]"
          />
        </div>
      </div>
    </SignupLayout>
  );
};

export default BusinessSetup;
