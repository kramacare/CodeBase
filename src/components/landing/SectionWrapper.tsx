import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface SectionWrapperProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  bgClassName?: string;
}

const SectionWrapper = ({ id, children, className, bgClassName }: SectionWrapperProps) => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        "section-padding transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        bgClassName,
      )}
    >
      <div className={cn("section-container", className)}>{children}</div>
    </section>
  );
};

export default SectionWrapper;
