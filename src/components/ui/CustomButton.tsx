import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/animations";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof typeof motion.button> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto";
    
    const variants = {
      primary: "bg-primary text-white hover:bg-primary/90 shadow-soft hover:shadow-hover focus:ring-primary",
      secondary: "bg-white text-primary hover:bg-primary/5 border-0 shadow-soft hover:shadow-hover focus:ring-primary",
      outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary"
    };
    
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg"
    };

    return (
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
