import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-50",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm disabled:opacity-50",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm disabled:opacity-50",
        secondary:
          "bg-[hsl(var(--brand-secondary))] text-white hover:bg-[hsl(var(--brand-secondary-hover))] shadow-md font-bold disabled:opacity-50",
        ghost:
          "hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
        link: "text-primary underline-offset-4 hover:underline disabled:opacity-50",
        brand:
          "bg-[hsl(var(--brand-primary))] text-white hover:bg-[hsl(var(--brand-primary-hover))] shadow-lg font-semibold disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
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
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
