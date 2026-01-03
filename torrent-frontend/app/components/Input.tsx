import React, { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  refObject?: React.Ref<HTMLInputElement> | undefined;
};

export const Input: React.FC<InputProps> = ({
  className,
  refObject,
  ...props
}) => {
  return (
    <input
      ref={refObject}
      {...props}
      className={`border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
        className ?? ""
      }`}
    />
  );
};
