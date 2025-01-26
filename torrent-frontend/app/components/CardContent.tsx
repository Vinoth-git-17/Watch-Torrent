// CardContent.tsx
import React from "react";

type CardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={`p-6 ${className ?? ""}`}>{children}</div>;
};