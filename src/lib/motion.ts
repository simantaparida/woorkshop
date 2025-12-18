'use client';

import { useEffect, useState } from 'react';
import type { Variants } from 'framer-motion';

/**
 * Motion System for Calm, Intentional Animations
 *
 * Design principles:
 * - Duration: 200-400ms for calm motion
 * - Easing: Smooth deceleration curve
 * - Movement: Constrained to 8-16px vertical
 * - Respects prefers-reduced-motion
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Duration constants (in seconds)
 * Slower durations create a more alive, smooth feel
 */
export const DURATION = {
  FAST: 0.5,    // 500ms - Quick transitions
  MEDIUM: 0.7,  // 700ms - Most transitions
  SLOW: 0.9,    // 900ms - Emphasis
} as const;

/**
 * Calm easing curve - smooth, alive motion
 * cubic-bezier(0.22, 1, 0.36, 1) - gentle acceleration with smooth deceleration
 */
export const CALM_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Vertical movement constraints (in pixels)
 * Keep movements subtle and intentional
 */
export const MOVEMENT = {
  SUBTLE: 8,     // 8px - Minimal movement
  NORMAL: 12,    // 12px - Default movement
  EMPHASIS: 16,  // 16px - Maximum movement
} as const;

/**
 * Hero section animation sequence timing
 * Sequential delays for narrative hierarchy with breathing room
 */
export const HERO_SEQUENCE = {
  HEADLINE: 0,     // First: immediate
  SUBTEXT: 0.4,    // Second: 400ms after headline starts
  CTA: 0.9,        // Third: 900ms after headline starts
} as const;

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/**
 * Fade in - opacity only, no movement
 * Use for: Headlines, establishing content
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATION.MEDIUM,
      ease: CALM_EASE,
    },
  },
};

/**
 * Slide up - opacity + vertical movement
 * Use for: Secondary content, supporting text
 *
 * @param distance - Vertical movement in pixels (default: MOVEMENT.NORMAL)
 */
export const slideUp = (distance: number = MOVEMENT.NORMAL): Variants => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.MEDIUM,
      ease: CALM_EASE,
    },
  },
});

/**
 * Delayed fade - opacity with delay
 * Use for: CTAs, final elements in sequence
 *
 * @param delay - Delay before animation starts in seconds
 */
export const delayedFade = (delay: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATION.MEDIUM,
      ease: CALM_EASE,
      delay,
    },
  },
});

/**
 * Stagger container - for lists and grouped elements
 * Use for: Lists, grids, card collections
 *
 * @param staggerDelay - Delay between each child (default: 0.1s)
 */
export const staggerContainer = (staggerDelay: number = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0,
    },
  },
});

/**
 * Stagger item - child element for stagger container
 * Use with: staggerContainer
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: MOVEMENT.NORMAL },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.MEDIUM,
      ease: CALM_EASE,
    },
  },
};

// ============================================================================
// ACCESSIBILITY
// ============================================================================

/**
 * Hook to detect user's motion preference
 * Returns true if user prefers reduced motion
 *
 * @returns boolean - true if prefers-reduced-motion is set
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  return prefersReducedMotion;
};

/**
 * Get motion variants with reduced motion support
 * Disables all motion when user prefers reduced motion
 *
 * @param variants - Framer Motion variants object
 * @param reducedMotion - Boolean from useReducedMotion hook
 * @returns Variants - Original or no-motion variants
 */
export const getMotionVariants = (
  variants: Variants,
  reducedMotion: boolean
): Variants => {
  if (reducedMotion) {
    // Instant appearance, no animation
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0 } },
    };
  }
  return variants;
};
