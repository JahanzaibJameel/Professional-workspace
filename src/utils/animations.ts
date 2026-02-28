import type { Variants } from 'framer-motion';

export const premiumTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
  mass: 0.5,
};

export const luxuryFadeVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { ...premiumTransition, duration: 0.6 },
  },
};

export const elegantFloatVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: premiumTransition,
  },
  hover: {
    y: -8,
    transition: { duration: 0.3 },
  },
};

export const magneticCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: premiumTransition,
  },
  hover: {
    scale: 1.03,
    y: -12,
    transition: { duration: 0.4, type: 'spring', stiffness: 300, damping: 25 },
  },
  tap: {
    scale: 0.96,
  },
};

export const smoothSlideVariants: Variants = {
  hidden: { x: -80, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { ...premiumTransition, duration: 0.5 },
  },
};

export const bounceInVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
      mass: 0.4,
    },
  },
};

export const rotateEntranceVariants: Variants = {
  hidden: { rotate: -20, opacity: 0, scale: 0.8 },
  visible: {
    rotate: 0,
    opacity: 1,
    scale: 1,
    transition: premiumTransition,
  },
};

export const glassPop: Variants = {
  hidden: { scale: 0.5, opacity: 0, backdropFilter: 'blur(0px)' },
  visible: {
    scale: 1,
    opacity: 1,
    backdropFilter: 'blur(16px)',
    transition: { ...premiumTransition, duration: 0.4 },
  },
};

export const premiumStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

export const premiumItemVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: premiumTransition,
  },
};

export const shimmerVariants: Variants = {
  shimmer: {
    backgroundPosition: ['200% center', '-200% center'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const pulsePremiumVariants: Variants = {
  pulse: {
    scale: [1, 1.08, 1],
    boxShadow: [
      '0 0 0 0 rgba(139, 92, 246, 0.7)',
      '0 0 0 10px rgba(139, 92, 246, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

export const slideInVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: premiumTransition,
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: premiumTransition,
  },
};

export const pageTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: pageTransition,
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
  },
};

export const columnVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: pageTransition,
  },
};

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: pageTransition,
  },
};

export const rotateVariants: Variants = {
  hidden: { opacity: 0, rotate: -10 },
  visible: {
    opacity: 1,
    rotate: 0,
    transition: pageTransition,
  },
};

export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};