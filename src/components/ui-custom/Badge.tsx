import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error";
}

const variantClasses: Record<string, string> = {
  default: "bg-primary-light text-primary-hover",
  success: "bg-green-100 text-success",
  warning: "bg-amber-100 text-warning",
  error: "bg-red-100 text-error",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
