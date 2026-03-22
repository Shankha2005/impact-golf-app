import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = "px-6 py-3 font-bold rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50";
  
  const variants = {
    primary: "bg-charity text-white hover:bg-charity-dark shadow-md shadow-green-100",
    secondary: "bg-gray-900 text-white hover:bg-black shadow-md",
    outline: "bg-white text-gray-800 border-2 border-gray-200 hover:border-gray-300"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}