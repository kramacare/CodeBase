import React from "react";
import { cn } from "@/lib/utils";

interface HeadingBlockProps {
  title: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg" | "xl";
  alignment?: "left" | "center" | "right";
  className?: string;
}

const HeadingBlock = ({ 
  title, 
  subtitle, 
  size = "lg", 
  alignment = "left", 
  className 
}: HeadingBlockProps) => {
  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  };
  
  const titleSizes = {
    sm: "text-2xl md:text-3xl",
    md: "text-3xl md:text-4xl", 
    lg: "text-4xl md:text-5xl",
    xl: "text-5xl md:text-6xl"
  };
  
  const subtitleSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  };

  return (
    <div className={cn(
      "space-y-4",
      alignmentClasses[alignment],
      className
    )}>
      <h2 className={cn(
        "font-display font-bold leading-tight text-foreground",
        titleSizes[size]
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          "text-muted-foreground max-w-3xl",
          subtitleSizes[size],
          alignment === "center" && "mx-auto"
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default HeadingBlock;
