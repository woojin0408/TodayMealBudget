import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface PrimaryButtonProps extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "ghost";
}

const variants = {
  primary: "bg-main text-white shadow-[0_6px_22px_rgba(255,159,67,0.4)]",
  secondary: "bg-white text-ink border-2 border-line shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
  success: "bg-success text-white shadow-[0_4px_18px_rgba(76,175,122,0.4)]",
  ghost: "bg-transparent text-muted"
};

export function PrimaryButton({ children, className = "", variant = "primary", ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`min-h-12 rounded-[20px] px-5 py-3 text-base font-extrabold whitespace-nowrap transition active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
