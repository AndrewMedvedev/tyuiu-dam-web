import type { ButtonHTMLAttributes, ReactNode } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

export function GlassButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: GlassButtonProps) {
  const baseStyles =
    "inline-flex w-full items-center justify-center rounded-3xl px-5 py-3 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-sky-300";
  const variantStyles =
    variant === "primary"
      ? "bg-sky-600 text-white shadow-[0_18px_50px_rgba(47,123,255,0.2)] hover:bg-sky-500"
      : variant === "secondary"
        ? "bg-white/90 text-slate-900 border border-white/60 hover:bg-white"
        : "bg-transparent text-sky-700 hover:bg-sky-50";

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
