import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm text-text-secondary font-medium">
          {label}
        </label>
      )}
      <input
        className={`rounded-sm border border-border bg-background px-3 py-2 text-base text-text-primary transition-colors duration-150 placeholder:text-text-tertiary focus:border-primary focus:outline-none ${className}`}
        {...props}
      />
    </div>
  );
}
