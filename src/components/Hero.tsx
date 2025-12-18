'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import {
  fadeIn,
  slideUp,
  delayedFade,
  HERO_SEQUENCE,
  MOVEMENT,
  useReducedMotion,
  getMotionVariants,
} from '@/lib/motion';

export function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative bg-white pt-32 pb-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center space-y-8">
          {/* Step 1: Headline - Fade in only, no movement */}
          <motion.h1
            variants={getMotionVariants(fadeIn, reducedMotion)}
            initial="hidden"
            animate="visible"
            className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.05] tracking-tight"
          >
            Stop letting the loudest voice win your roadmap.
          </motion.h1>

          {/* Step 2: Subtext - Slide up slightly after headline */}
          <motion.div
            variants={getMotionVariants(slideUp(MOVEMENT.NORMAL), reducedMotion)}
            initial="hidden"
            animate="visible"
            transition={{ delay: HERO_SEQUENCE.SUBTEXT }}
            className="space-y-4 max-w-3xl mx-auto"
          >
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
              Woorkshop helps teams think together—not argue louder.
            </p>
            <div className="space-y-2 text-lg text-gray-600">
              <p>Turn opinions into structured input.</p>
              <p>Turn meetings into decisions.</p>
            </div>
          </motion.div>

          {/* Step 3: CTA - Appears last with delay */}
          <motion.div
            variants={getMotionVariants(delayedFade(HERO_SEQUENCE.CTA), reducedMotion)}
            initial="hidden"
            animate="visible"
            className="pt-2"
          >
            <Link
              href={ROUTES.LOGIN}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg transition-all duration-300 ease-out hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              aria-label="Start a session in 10 minutes"
            >
              {/* Timer icon: hidden by default, slides in on hover */}
              <Clock
                className="w-5 h-5 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300"
                aria-hidden="true"
              />
              <span className="flex items-center gap-2">
                Start a session
                <span className="text-base font-normal text-blue-100">(10 minutes)</span>
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
