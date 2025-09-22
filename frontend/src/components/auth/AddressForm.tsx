import React, { useState } from 'react';
import FormField from './FormField';
import ActionButton from './ActionButton';

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  isLoading?: boolean;
}

export interface AddressFormData {
  pickupAddress: string;
  region: string;
  sameAsPickup: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<AddressFormData>({
    pickupAddress: '',
    region: '',
    sameAsPickup: false,
  });

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="relative">
      {/* Add a Pick up Address Heading */}
      <h2 
        className="absolute text-black font-semibold"
        style={{ 
          top: '0px', 
          left: '0px', 
          width: '382px', 
          height: '47px',
          fontSize: '40px',
          lineHeight: '47px'
        }}
      >
        Add a Pick up Adress
      </h2>
      
      {/* Address Details Input */}
      <div 
        className="absolute"
        style={{ 
          top: '90px', 
          left: '9px', 
          width: '583px', 
          height: '67px' 
        }}
      >
        <FormField
          type="textarea"
          placeholder="Address Details: Number, Street, Landmark, etc."
          value={formData.pickupAddress}
          onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
          className="h-[67px] text-[25px] placeholder:text-[#B8B1B1]"
        />
      </div>

      {/* Region/City/District Dropdown */}
      <div 
        className="absolute"
        style={{ 
          top: '184px', 
          left: '9px', 
          width: '583px', 
          height: '67px' 
        }}
      >
        <div className="relative">
          <FormField
            type="select"
            placeholder="Region/City/District"
            value={formData.region}
            onChange={(e) => handleInputChange('region', e.target.value)}
            className="h-[67px] text-[25px] placeholder:text-[#B8B1B1] pr-12"
          />
          <div 
            className="absolute"
            style={{ 
              top: '22px', 
              right: '29px', 
              width: '24px', 
              height: '24px' 
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M2 6.25L12 17.03L22 6.25"
                stroke="#B8B1B1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Return Address Heading */}
      <h2 
        className="absolute text-black font-semibold"
        style={{ 
          top: '294px', 
          left: '0px', 
          width: '256px', 
          height: '47px',
          fontSize: '40px',
          lineHeight: '47px'
        }}
      >
        Return Adress
      </h2>

      {/* Checkbox */}
      <div 
        className="absolute"
        style={{ 
          top: '365px', 
          left: '0px', 
          width: '45px', 
          height: '45px' 
        }}
      >
        <div className="relative">
          <input
            type="checkbox"
            id="sameAsPickup"
            checked={formData.sameAsPickup}
            onChange={(e) => handleInputChange('sameAsPickup', e.target.checked)}
            className="w-[45px] h-[45px] rounded-[5px] bg-[#2ECC71] border-0 focus:ring-0 focus:ring-offset-0"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="23" height="18" viewBox="0 0 23 18" fill="none">
              <path
                d="M2 9L8.5 15.5L21 2"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Same Address as Pickup Address Text */}
      <label
        htmlFor="sameAsPickup"
        className="absolute text-[#B8B1B1] font-normal cursor-pointer"
        style={{ 
          top: '381px', 
          left: '67px', 
          width: '385px', 
          height: '29px',
          fontSize: '25px',
          lineHeight: '29px'
        }}
      >
        Same Address as Pickup Address
      </label>

      {/* Continue Next Button */}
      <div 
        className="absolute"
        style={{ 
          top: '462px', 
          left: '0px', 
          width: '234px', 
          height: '67px' 
        }}
      >
        <ActionButton
          type="submit"
          text="Continue Next"
          onClick={() => handleSubmit({} as React.FormEvent)}
          disabled={isLoading}
          className="w-[234px] h-[67px] bg-[#2ECC71] text-white text-[30px] font-bold rounded-[15px]"
        />
      </div>
    </div>
  );
};

export default AddressForm;
