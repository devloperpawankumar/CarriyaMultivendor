import React from 'react';

export interface ActionButtonProps {
  type?: 'button' | 'submit' | 'reset';
  text: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  type = 'button',
  text,
  icon,
  onClick,
  className = '',
  disabled = false
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      <span>{text}</span>
    </button>
  );
};

export default ActionButton;
