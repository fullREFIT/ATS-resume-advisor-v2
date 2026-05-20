import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "min-h-12 bg-[#4ade80] px-6 text-[#0a0a0a] hover:bg-[#22c55e] disabled:bg-[#2a2a2a] disabled:text-[#78716c]",
  secondary:
    "min-h-11 border border-[#2a2a2a] bg-transparent px-5 text-[#e8e4de] hover:bg-[#2a2a2a]/60 disabled:border-[#1f1f1f] disabled:text-[#78716c]",
  ghost: "min-h-10 px-3 text-[#e8e4de] hover:bg-[#2a2a2a]/60 disabled:text-[#78716c]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", fullWidth, className = "", children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
