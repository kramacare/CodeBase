import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { sectionVariants, commonViewport } from "@/lib/animations";

interface SectionWrapperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof typeof motion.section> {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  animate?: boolean;
}

const SectionWrapper = React.forwardRef<HTMLDivElement, SectionWrapperProps>(
  ({ className, children, maxWidth = "7xl", padding = "lg", animate = true, ...props }, ref) => {
    const maxWidthClasses = {
      sm: "max-w-sm",
      md: "max-w-md", 
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      "7xl": "max-w-7xl",
      full: "max-w-full"
    };
    
    const paddingClasses = {
      none: "",
      sm: "px-4 py-8",
      md: "px-4 sm:px-6 py-12", 
      lg: "px-4 sm:px-6 md:px-8 py-12 sm:py-16",
      xl: "px-4 sm:px-6 md:px-8 py-16 sm:py-20"
    };

    const content = (
      <div className={cn(
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}>
        {children}
      </div>
    );

    if (animate) {
      return (
        <motion.section
          ref={ref}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={commonViewport}
          className="mx-auto"
          {...(props as any)}
        >
          {content}
        </motion.section>
      );
    }

    return (
      <section
        ref={ref}
        className={cn("mx-auto", className)}
        {...props}
      >
        {content}
      </section>
    );
  }
);

SectionWrapper.displayName = "SectionWrapper";

export default SectionWrapper;
