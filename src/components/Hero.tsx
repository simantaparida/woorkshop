'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { ROUTES } from '@/lib/constants';
import {
  fadeInDrift,
  slideUp,
  delayedFade,
  HERO_SEQUENCE,
  MOVEMENT,
  useReducedMotion,
  getMotionVariants,
} from '@/lib/motion';

export function Hero() {
  const reducedMotion = useReducedMotion();
  const ctaRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // CTA lifts 2px on scroll start, then locks
  const ctaY = useTransform(scrollY, [0, 50], [0, -MOVEMENT.LIFT]);

  return (
    <section className="relative bg-white pt-32 pb-24 overflow-hidden z-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center space-y-8">
          {/* Step 1: Headline - Fade in with gentle upward drift (4px) over 600ms */}
          <motion.h1
            variants={getMotionVariants(fadeInDrift(MOVEMENT.DRIFT), reducedMotion)}
            initial="hidden"
            animate="visible"
            className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-[1.05] tracking-tight"
          >
            Stop letting the loudest voice win your roadmap.
          </motion.h1>

          {/* Step 2: Subtext - Slide up slightly after headline */}
          <motion.div
            variants={getMotionVariants(slideUp(MOVEMENT.SUBTLE), reducedMotion)}
            initial="hidden"
            animate="visible"
            transition={{ delay: HERO_SEQUENCE.SUBTEXT }}
            className="space-y-4 max-w-3xl mx-auto"
          >
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
              Woorkshop helps teams think together—not argue louder.
            </p>
          </motion.div>

          {/* Step 3: CTA - Appears while subtext finishing, with scroll micro-lift */}
          <motion.div
            ref={ctaRef}
            variants={getMotionVariants(delayedFade(HERO_SEQUENCE.CTA), reducedMotion)}
            initial="hidden"
            animate="visible"
            style={{ y: reducedMotion ? 0 : ctaY }}
            className="pt-2"
          >
            <Link
              href={ROUTES.LOGIN}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg transition-all duration-300 ease-out hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              aria-label="Start a session"
            >
              <span className="flex items-center gap-2">
                Start a session
                {/* Right arrow icon: hidden by default, slides in on hover */}
                <svg
                  className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-20" />
      </div>
    </section>
  );
}
