'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { ROUTES } from '@/lib/constants';

export function Hero() {
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <section className="relative bg-white pt-20 pb-12 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Simple Character Illustrations */}
          <motion.div variants={itemVariants} className="flex items-center justify-center mb-8">
            <div className="inline-flex items-center -space-x-4">
              {/* Character 1 - Book */}
              <div className="w-16 h-16 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-200">
                <span className="text-2xl">📚</span>
              </div>

              {/* Character 2 - Glasses Person */}
              <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-900 flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-200">
                <div className="relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 border-2 border-gray-900 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full absolute top-1 left-2"></div>
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full absolute top-1 right-2"></div>
                  <div className="w-4 h-1 bg-gray-900 rounded-full mt-4"></div>
                </div>
              </div>

              {/* Character 3 - Person with curly hair */}
              <div className="w-20 h-20 rounded-full bg-gray-800 border-4 border-white flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-200">
                <span className="text-2xl">👤</span>
              </div>

              {/* Character 4 - Lightbulb (Center/Largest) */}
              <div className="w-24 h-24 rounded-full bg-orange-500 border-4 border-white flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200 z-10">
                <span className="text-3xl">💡</span>
              </div>

              {/* Character 5 - Hard Hat */}
              <div className="w-22 h-22 rounded-full bg-white border-4 border-gray-900 flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-200">
                <span className="text-3xl">👷</span>
              </div>

              {/* Character 6 - Headphones */}
              <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-900 flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-200">
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-4 border-t-4 border-l-4 border-r-4 border-blue-500 rounded-t-full"></div>
                  <div className="absolute -left-3 top-0 w-3 h-4 bg-blue-500 rounded"></div>
                  <div className="absolute -right-3 top-0 w-3 h-4 bg-blue-500 rounded"></div>
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full absolute top-1 left-2"></div>
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full absolute top-1 right-2"></div>
                  <div className="w-2 h-1 bg-gray-900 rounded-full mt-4"></div>
                </div>
              </div>

              {/* Character 7 - Woman */}
              <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-900 flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-200">
                <span className="text-2xl">👩</span>
              </div>

              {/* Character 8 - Person */}
              <div className="w-18 h-18 rounded-full bg-white border-4 border-gray-900 flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-200">
                <div className="relative">
                  <div className="w-2 h-2 bg-gray-900 rounded-full absolute top-0 left-2"></div>
                  <div className="w-2 h-2 bg-gray-900 rounded-full absolute top-0 right-2"></div>
                  <div className="w-3 h-0.5 bg-gray-900 rounded-full mt-5"></div>
                </div>
              </div>

              {/* Character 9 - Checklist */}
              <div className="w-16 h-16 rounded-full bg-yellow-400 border-4 border-white flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-200">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-5 leading-[1.1] tracking-tight"
          >
            Decide what to build next. Together.
          </motion.h1>

          {/* Subhead - Reduced size */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 mb-8 mx-auto max-w-3xl leading-relaxed"
          >
            Padool helps product and design teams align on what matters most. Create a quick session, invite teammates, and get a ranked list of ideas — no signup required.
          </motion.p>

          {/* CTA Buttons - Elegant Modern Hover */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mb-12">
            <Link
              href={ROUTES.LOGIN}
              className="group relative inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 overflow-hidden"
              aria-label="Get started with Padool"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-2">
                Get started
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            <a
              href="#how-it-works"
              className="group relative inline-flex items-center gap-2 px-7 py-3.5 bg-blue-50 text-blue-700 text-base font-semibold rounded-lg border border-blue-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-blue-100 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              aria-label="Request Demo"
            >
              Request Demo
            </a>
          </motion.div>

          {/* Microcopy */}
          <motion.p
            variants={itemVariants}
            className="text-sm text-gray-500 mb-14"
          >
            Free forever · No login · Takes 10 minutes
          </motion.p>

          {/* Video Placeholder - Auto-playing, no overlay button */}
          <motion.div
            variants={itemVariants}
            className="relative max-w-5xl mx-auto"
          >
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Browser chrome */}
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-50 rounded-md px-3 py-1.5 text-xs text-gray-600 font-medium">
                    padool.app/session/demo
                  </div>
                </div>
              </div>

              {/* Video content area - Auto-playing animation */}
              <div className="relative aspect-video bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Animated UI mockup */}
                <div className="absolute inset-0 p-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isPlaying ? 1 : 0.5, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-white rounded-xl shadow-lg p-5 mb-4 border border-gray-100"
                  >
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-100 rounded w-2/5 mb-4"></div>
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isPlaying ? 1 : 0.5, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="bg-white rounded-xl shadow-lg p-5 mb-4 border border-gray-100"
                  >
                    <div className="h-4 bg-gradient-to-r from-purple-200 to-purple-100 rounded w-1/3 mb-4"></div>
                    <div className="h-3 bg-gray-100 rounded w-4/5 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/5"></div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isPlaying ? 1 : 0.5, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="bg-white rounded-xl shadow-lg p-5 border border-gray-100"
                  >
                    <div className="h-4 bg-gradient-to-r from-green-200 to-green-100 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-3/5"></div>
                  </motion.div>
                </div>

                {/* Playing indicator (subtle) */}
                {isPlaying && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-700">Live Preview</span>
                  </div>
                )}
              </div>
            </div>

            {/* Simple Play/Pause control below - no duration */}
            <div className="flex items-center justify-center mt-5">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="group inline-flex items-center gap-2 px-5 py-2.5 text-gray-700 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                {isPlaying ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                    Pause Preview
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play Preview
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Trust line */}
          <motion.p
            variants={itemVariants}
            className="text-sm text-gray-400 italic mt-12"
          >
            Used by curious teams who like their work smooth as sky.
          </motion.p>
        </motion.div>
      </div>

      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-20" />
      </div>
    </section>
  );
}
