import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

type Variant = "primary" | "secondary" | "text";
type Size = "md" | "lg" | "senior";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  children: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary:
    "bg-primary-500 text-white shadow-card hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none",
  secondary:
    "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:text-gray-400",
  text: "text-primary-500 hover:text-primary-600 disabled:text-gray-300",
};

const sizeClass: Record<Size, string> = {
  md: "px-4 py-3 text-body-lg rounded-button",
  lg: "px-5 py-4 text-body-lg rounded-button",
  senior: "px-6 py-5 text-senior-btn rounded-button", // 시니어(부모)용 큰 버튼
};

/** 디자인 시스템 버튼. Primary=full-width CTA, Secondary=gray, Text=최소 사용. */
export function Button({
  variant = "primary",
  size = "lg",
  fullWidth,
  leftIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-bold tap-target",
        "transition-transform duration-fast ease-smooth active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:active:scale-100",
        variant === "text" && "font-semibold",
        variantClass[variant],
        sizeClass[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  );
}
