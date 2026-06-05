import React from "react";
import { Slot } from "@radix-ui/react-slot";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover",
  secondary:
    "bg-transparent text-primary border border-primary hover:bg-primary-light",
};

export function Button({
  variant = "primary",
  asChild = false,
  className = "",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={`inline-flex items-center justify-center rounded-full px-7 py-3 text-[15px] font-medium leading-none transition-colors duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
