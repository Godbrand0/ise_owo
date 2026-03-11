import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-600/20 active:scale-[0.98]",
      secondary: "bg-zinc-800 text-white hover:bg-zinc-700 active:scale-[0.98]",
      outline: "border border-zinc-200 bg-transparent hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 active:scale-[0.98]",
      ghost: "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-[0.98]",
      danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs rounded-lg",
      md: "h-11 px-5 text-sm font-medium rounded-xl",
      lg: "h-14 px-8 text-base font-semibold rounded-2xl",
      icon: "h-10 w-10 rounded-xl flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
