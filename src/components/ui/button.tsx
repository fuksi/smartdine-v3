import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl focus-visible:ring-blue-500 disabled:opacity-50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        destructive:
          "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl focus-visible:ring-red-500 disabled:opacity-50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        outline:
          "border-2 border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md focus-visible:ring-gray-400 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-700",
        secondary:
          "bg-gradient-to-r from-[hsl(var(--brand-secondary))] to-[hsl(var(--brand-secondary-hover))] text-white hover:from-[hsl(var(--brand-secondary-hover))] hover:to-[hsl(var(--brand-secondary))] shadow-lg hover:shadow-xl font-bold disabled:opacity-50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        ghost:
          "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 backdrop-blur-sm disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-800/50 dark:hover:text-gray-100",
        link: "text-blue-600 underline-offset-4 hover:underline disabled:opacity-50 dark:text-blue-400",
        brand:
          "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-primary-hover))] text-white hover:from-[hsl(var(--brand-primary-hover))] hover:to-[hsl(var(--brand-primary))] shadow-lg hover:shadow-xl font-semibold disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        shimmer:
          "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-[length:200%_100%] text-white animate-shimmer shadow-lg hover:shadow-xl disabled:opacity-50",
        glow:
          "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 disabled:opacity-50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
      },
      size: {
        default: "h-12 px-6 py-3 text-sm",
        sm: "h-9 rounded-lg px-4 py-2 text-xs",
        lg: "h-14 rounded-xl px-8 py-4 text-base",
        icon: "h-12 w-12",
        xl: "h-16 rounded-2xl px-10 py-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, rightIcon, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!loading && icon && <span className="mr-2">{icon}</span>}
        <span className="relative z-10">{children}</span>
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
