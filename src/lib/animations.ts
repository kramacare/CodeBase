import { Variants } from "framer-motion";

// Page load animations
export const pageLoadVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: "easeOut" 
    }
  }
};

// Staggered children animations
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: "easeOut" 
    }
  }
};

// Section scroll animations
export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut" 
    }
  }
};

// Card animations
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: "easeOut" 
    }
  },
  hover: {
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

// Button animations
export const buttonVariants: Variants = {
  hover: {
    scale: 1.03,
    transition: {
      duration: 0.15,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  }
};

// Text animations
export const textVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: "easeOut" 
    }
  }
};

// Fade animations
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.3, 
      ease: "easeOut" 
    }
  }
};

// Common animation props
export const commonViewport = { once: true, amount: 0.2 };
export const commonTransition = { duration: 0.4, ease: "easeOut" };
