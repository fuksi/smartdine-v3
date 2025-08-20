import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, indeterminate, id, ...props }, ref) => {
    const uniqueId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const [isChecked, setIsChecked] = React.useState(props.checked || false);

    React.useEffect(() => {
      if (props.checked !== undefined) {
        setIsChecked(props.checked);
      }
    }, [props.checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!props.disabled) {
        setIsChecked(e.target.checked);
        props.onChange?.(e);
      }
    };

    return (
      <div className="flex items-start space-x-3 group">
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={uniqueId}
            className="sr-only"
            checked={isChecked}
            onChange={handleChange}
            {...props}
          />
          <div
            className={cn(
              "h-5 w-5 rounded-lg border-2 transition-all duration-200 cursor-pointer relative flex items-center justify-center",
              isChecked || indeterminate
                ? "border-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary))] shadow-lg"
                : "border-gray-300 bg-white hover:border-gray-400 group-hover:border-[hsl(var(--brand-primary))]",
              "focus-within:ring-2 focus-within:ring-[hsl(var(--brand-primary))] focus-within:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus-within:ring-red-500",
              className
            )}
            onClick={() => {
              if (!props.disabled) {
                const newChecked = !isChecked;
                setIsChecked(newChecked);
                props.onChange?.({
                  target: { checked: newChecked }
                } as React.ChangeEvent<HTMLInputElement>);
              }
            }}
          >
            {isChecked && !indeterminate && (
              <svg
                className="h-3 w-3 text-white animate-scale-in"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {indeterminate && (
              <div className="h-0.5 w-3 bg-white animate-scale-in" />
            )}
          </div>
        </div>
        
        {(label || description) && (
          <div className="flex-1 cursor-pointer" onClick={() => {
            if (!props.disabled) {
              const newChecked = !isChecked;
              setIsChecked(newChecked);
              props.onChange?.({
                target: { checked: newChecked }
              } as React.ChangeEvent<HTMLInputElement>);
            }
          }}>
            {label && (
              <label 
                htmlFor={uniqueId}
                className={cn(
                  "text-sm font-medium cursor-pointer",
                  error ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-gray-100"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={cn(
                "text-xs mt-1",
                error ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
              )}>
                {description}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 mt-1 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
