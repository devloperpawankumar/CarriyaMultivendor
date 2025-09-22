import React from 'react';

export interface FormFieldProps {
  type: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select';
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder: string;
  required?: boolean;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  type,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = ''
}) => {
  const baseClassName = "w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]";

  if (type === 'textarea') {
    return (
      <div className={`relative ${className}`}>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseClassName} resize-none`}
          required={required}
        />
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div className={`relative ${className}`}>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`${baseClassName} appearance-none`}
          required={required}
        >
          <option value="" disabled>{placeholder}</option>
        </select>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${baseClassName}`}
        required={required}
      />
    </div>
  );
};

export default FormField;
