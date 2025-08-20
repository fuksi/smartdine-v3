import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 group-hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800/80 dark:placeholder:text-gray-400 dark:focus-visible:ring-blue-400",
  {
    variants: {
      variant: {
        default: "",
        ghost: "border-transparent bg-transparent focus-visible:border-gray-300 focus-visible:bg-white/50",
        filled: "bg-gray-50 border-gray-200 focus-visible:bg-white focus-visible:border-blue-500",
        floating: "pt-6 pb-2",
      },
      inputSize: {
        default: "h-12 px-4 py-3",
        sm: "h-9 px-3 py-2 text-xs",
        lg: "h-14 px-5 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, label, error, helperText, startIcon, endIcon, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      props.onBlur?.(e);
    };

    const isFloating = variant === "floating";
    const showFloatingLabel = isFloating && (isFocused || hasValue);

    return (
      <div className="relative group">
        {label && !isFloating && (
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {label}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {startIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              inputVariants({ variant, inputSize }),
              startIcon && "pl-10",
              endIcon && "pr-10",
              error && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500",
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {isFloating && label && (
            <label
              className={cn(
                "absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 dark:text-gray-400",
                showFloatingLabel
                  ? "top-2 text-xs font-medium text-blue-600 dark:text-blue-400"
                  : "top-1/2 transform -translate-y-1/2 text-sm"
              )}
            >
              {label}
            </label>
          )}
          
          {endIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {endIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={cn(
            "mt-2 text-xs",
            error ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
