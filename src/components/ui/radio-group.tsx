import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
    name?: string;
    orientation?: "horizontal" | "vertical";
  }
>(({ className, value, onValueChange, name, orientation = "vertical", ...props }, ref) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
      <div
        className={cn(
          "grid gap-3",
          orientation === "horizontal" ? "grid-flow-col auto-cols-max" : "grid-cols-1",
          className
        )}
        ref={ref}
        role="radiogroup"
        {...props}
      />
    </RadioGroupContext.Provider>
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    value: string;
    label?: string;
    description?: string;
  }
>(({ className, value, label, description, id, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext);
  const uniqueId = id || `radio-${value}`;
  const isChecked = context.value === value;

  const handleChange = () => {
    context.onValueChange?.(value);
  };

  return (
    <div className="flex items-start space-x-3 group">
      <div className="relative flex items-center justify-center">
        <input
          ref={ref}
          type="radio"
          id={uniqueId}
          name={context.name}
          value={value}
          checked={isChecked}
          onChange={handleChange}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            "aspect-square h-5 w-5 rounded-full border-2 transition-all duration-200 cursor-pointer relative flex items-center justify-center",
            isChecked
              ? "border-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary))] shadow-lg"
              : "border-gray-300 bg-white hover:border-gray-400 group-hover:border-[hsl(var(--brand-primary))]",
            "focus-within:ring-2 focus-within:ring-[hsl(var(--brand-primary))] focus-within:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          onClick={handleChange}
        >
          {isChecked && (
            <div className="h-2 w-2 rounded-full bg-white animate-scale-in" />
          )}
        </div>
      </div>
      
      {(label || description) && (
        <div className="flex-1 cursor-pointer" onClick={handleChange}>
          {label && (
            <label 
              htmlFor={uniqueId}
              className="text-sm font-medium text-gray-900 cursor-pointer dark:text-gray-100"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
