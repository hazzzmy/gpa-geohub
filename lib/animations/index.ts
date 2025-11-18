import { Variants } from 'framer-motion';

// Common animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInUp: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
};

export const slideInDown: Variants = {
  hidden: { y: '-100%' },
  visible: { y: 0 },
};

export const slideInLeft: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
};

export const slideInRight: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
};

// Stagger animations for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Hover animations
export const hoverScale: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export const hoverLift: Variants = {
  initial: { y: 0 },
  hover: { y: -4 },
  tap: { y: 0 },
};

export const hoverGlow: Variants = {
  initial: { boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' },
  hover: { boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.1)' },
};

// Page transitions
export const pageTransition: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const modalTransition: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

// Loading animations
export const loadingSpinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const loadingPulse: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Common transitions
export const transitions = {
  fast: { duration: 0.2, ease: 'easeOut' },
  normal: { duration: 0.3, ease: 'easeOut' },
  slow: { duration: 0.5, ease: 'easeOut' },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bounce: { type: 'spring', stiffness: 400, damping: 10 },
} as const;

// Animation presets for common use cases
export const animationPresets = {
  // Button animations
  button: {
    hover: hoverScale,
    transition: transitions.fast,
  },

  // Card animations
  card: {
    initial: fadeInUp,
    hover: hoverLift,
    transition: transitions.normal,
  },

  // List animations
  list: {
    container: staggerContainer,
    item: staggerItem,
    transition: transitions.normal,
  },

  // Modal animations
  modal: {
    variants: modalTransition,
    transition: transitions.spring,
  },

  // Page animations
  page: {
    variants: pageTransition,
    transition: transitions.normal,
  },

  // Loading animations
  loading: {
    spinner: loadingSpinner,
    pulse: loadingPulse,
  },
} as const;

// Utility functions for common animation patterns
export const createStaggerAnimation = (delay: number = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: delay,
    },
  },
});

export const createFadeInAnimation = (direction: 'up' | 'down' | 'left' | 'right' = 'up'): Variants => {
  const animations = {
    up: fadeInUp,
    down: fadeInDown,
    left: fadeInLeft,
    right: fadeInRight,
  };
  return animations[direction];
};

// Animation hooks for common patterns
export const useAnimationProps = (preset: keyof typeof animationPresets) => {
  return animationPresets[preset];
};
