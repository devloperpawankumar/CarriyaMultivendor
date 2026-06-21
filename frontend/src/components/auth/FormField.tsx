import React from 'react';

export interface FormFieldProps {
  type: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select';
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const FormField: React.FC<FormFieldProps> = ({
  type,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  error,
  onKeyPress
}) => {
  const baseClassName = "w-full h-[38px] md:h-[67px] px-[18px] md:px-[29px] border border-[#B8B1B1] rounded-[10px] md:rounded-[15px] text-[12px] md:text-[25px] text-[#B8B1B1] placeholder-[#B8B1B1] focus:outline-none focus:border-[#2ECC71] shadow-[1px_2px_4px_rgba(233,255,242,1)]";

  if (type === 'textarea') {
    return (
      <div className={`relative ${className}`}>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          className={`${baseClassName} resize-none`}
          required={required}
          disabled={disabled}
        />
        {error && (
          <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>
        )}
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
          disabled={disabled}
        >
          <option value="" disabled>{placeholder}</option>
        </select>
        {error && (
          <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>
        )}
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
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        className={`${baseClassName}`}
        required={required}
        disabled={disabled}
      />
      {error && (
        <div className="text-red-500 text-[10px] md:text-[14px] mt-1">{error}</div>
      )}
    </div>
  );
};

export default FormField;
