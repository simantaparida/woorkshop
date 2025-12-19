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
    <section className="relative bg-white pt-32 pb-32 overflow-hidden z-20">
      {/* Responsive container: 180px padding on desktop, proper padding on mobile */}
      <div className="mx-auto px-8 sm:px-10 md:px-16 lg:px-[180px]">
        <div className="grid lg:grid-cols-[40%_60%] gap-12 lg:gap-20 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8 lg:space-y-10">
            {/* Step 1: Headline - Fade in with gentle upward drift (4px) over 600ms */}
            <motion.h1
              variants={getMotionVariants(fadeInDrift(MOVEMENT.DRIFT), reducedMotion)}
              initial="hidden"
              animate="visible"
              className="text-[28px] sm:text-4xl lg:text-[52px] font-bold text-gray-900 leading-[1.15] tracking-tight"
            >
              Make better decisions together.
            </motion.h1>

            {/* Step 2: Subtext - Slide up slightly after headline */}
            <motion.div
              variants={getMotionVariants(slideUp(MOVEMENT.SUBTLE), reducedMotion)}
              initial="hidden"
              animate="visible"
              transition={{ delay: HERO_SEQUENCE.SUBTEXT }}
            >
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                Where every voice matters and groupthink disappears.
              </p>
            </motion.div>

            {/* Step 3: CTA - Appears while subtext finishing, with scroll micro-lift */}
            <motion.div
              ref={ctaRef}
              variants={getMotionVariants(delayedFade(HERO_SEQUENCE.CTA), reducedMotion)}
              initial="hidden"
              animate="visible"
              style={{ y: reducedMotion ? 0 : ctaY }}
              className="pt-4"
            >
              <div className="inline-block p-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <Link
                  href={ROUTES.LOGIN}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg transition-all duration-300 ease-out hover:bg-blue-700 hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  aria-label="Start your first collaborative session"
                >
                  <span className="flex items-center gap-2">
                    Start your first session
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
              </div>
            </motion.div>
          </div>

          {/* Right Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative w-full lg:w-[140%] lg:-mr-[20%] mt-12 lg:mt-0 px-4 sm:px-0"
          >
            <img
              src="/images/hero-image-1.png"
              alt="Team meeting illustration showing collaborative decision-making"
              className="w-full h-auto rounded-xl"
            />
          </motion.div>
        </div>
      </div>

      {/* Refined background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-purple-50 to-pink-50 rounded-full blur-3xl opacity-25" />
      </div>
    </section>
  );
}
