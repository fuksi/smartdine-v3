import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500",
        secondary:
          "border-transparent bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg hover:shadow-xl hover:from-gray-700 hover:to-gray-800 focus:ring-gray-500",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-pink-700 focus:ring-red-500",
        success:
          "border-transparent bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 focus:ring-green-500",
        warning:
          "border-transparent bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700 focus:ring-amber-500",
        info:
          "border-transparent bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-blue-600 focus:ring-cyan-500",
        outline: 
          "border-2 border-gray-200 bg-white/80 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-700",
        ghost:
          "border-transparent bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 hover:text-gray-900 focus:ring-gray-400 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:bg-gray-700/50",
        shimmer:
          "border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-[length:200%_100%] text-white animate-shimmer shadow-lg hover:shadow-xl",
        glow:
          "border-transparent bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40",
      },
      size: {
        default: "px-3 py-1.5 text-xs",
        sm: "px-2 py-1 text-[10px] rounded-lg",
        lg: "px-4 py-2 text-sm rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

function Badge({ className, variant, size, icon, removable, onRemove, children, ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        badgeVariants({ variant, size }),
        removable && "pr-1",
        className
      )} 
      {...props}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      <span>{children}</span>
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1.5 rounded-full p-0.5 hover:bg-white/20 transition-colors"
          type="button"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export { Badge, badgeVariants };
