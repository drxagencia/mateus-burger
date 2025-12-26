import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-2xl font-bold transition-all duration-200 transform flex items-center justify-center gap-2 tracking-wide text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed";
  
  const getStyle = () => {
    if (variant === 'primary') {
      return { 
        backgroundColor: 'var(--theme-color)', 
        color: 'white',
      };
    }
    return {};
  };

  const variants = {
    primary: "hover:brightness-110 active:scale-95",
    secondary: "bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md active:scale-95",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 active:scale-95"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{ ...getStyle(), ...props.style }}
      {...props}
    >
      {children}
    </button>
  );
};