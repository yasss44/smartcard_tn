import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Define button variants using class-variance-authority
const buttonVariants = cva(
  // Base styles for all buttons
  "relative inline-flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-2 border-gray-800 bg-transparent hover:bg-gray-100/10 active:scale-95",
        primary: "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/20",
        secondary: "bg-gray-800 text-cyan-400 border border-cyan-400 hover:bg-cyan-400 hover:text-gray-900 shadow-[0_0_10px_rgba(6,214,160,0.3)]",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-100/10",
        ghost: "bg-transparent hover:bg-gray-100/10",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        dark: "bg-gray-900 text-white border border-gray-700 hover:bg-gray-800 active:scale-95",
      },
      size: {
        default: "h-10 px-4 py-2.5 rounded-full",
        sm: "h-8 px-3 py-2 rounded-full text-xs",
        lg: "h-12 px-6 py-3 rounded-full text-base",
        icon: "h-10 w-10 rounded-full p-0",
      },
      width: {
        auto: "w-auto",
        full: "w-full",
        fixed: "w-[170px] min-w-max",
      },
    },
    defaultVariants: {
      variant: "dark",
      size: "default",
      width: "auto",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, width, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, width, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
