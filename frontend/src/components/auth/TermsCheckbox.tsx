import React from 'react';

export interface TermsCheckboxProps {
  className?: string;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <input
        type="checkbox"
        id="terms"
        className="w-4 h-4 mt-1 text-[#2ECC71] border-[#B8B1B1] rounded focus:ring-[#2ECC71] focus:ring-2 accent-[#2ECC71]"
        required
      />
      <label htmlFor="terms" className="text-[12px] md:text-[15px] font-light text-[#767676] leading-relaxed">
        "By creating or using an account, you confirm that you have read and agree to our [Terms of Use] and [Privacy Policy]."
      </label>
    </div>
  );
};

export default TermsCheckbox;
