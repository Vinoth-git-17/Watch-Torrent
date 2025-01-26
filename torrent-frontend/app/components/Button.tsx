// Button.tsx
import React, { ButtonHTMLAttributes } from "react";


type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

export const Button: React.FC<ButtonProps> = ({ className, children, ...props }) => {
  return (
    <button
      {...props}
      className={
        `px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ${className ?? ""}`
        }
    >
      {children}
    </button>
  );
};