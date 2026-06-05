import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-md border border-border bg-background p-6 shadow-surface ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardSurface({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-md border border-border bg-surface p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
