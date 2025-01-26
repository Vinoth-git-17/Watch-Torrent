import React from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={
        `bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 ${className ?? ""}`
        }
    >
      {children}
    </div>
  );
};