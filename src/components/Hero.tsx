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
          {/* Trust Badges */}
          <motion.div variants={itemVariants} className="flex items-center justify-center mb-8">
            <div className="inline-flex items-center gap-6 flex-wrap justify-center">
              {/* No Signup Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-blue-700">No Signup Required</span>
              </div>

              {/* Real-Time Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-purple-700">Real-Time Collaboration</span>
              </div>

              {/* Free Forever Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-700">Free Forever</span>
              </div>

              {/* Secure Badge */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-200">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Secure & Private</span>
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-5 leading-[1.1] tracking-tight"
          >
            Prioritize features as a team — in 10 minutes
          </motion.h1>

          {/* Subhead - Reduced size */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 mb-8 mx-auto max-w-3xl leading-relaxed"
          >
            Run voting sessions, RICE scoring, or MoSCoW workshops. No signup, no spreadsheets, no endless meetings.
          </motion.p>

          {/* CTA Buttons - Elegant Modern Hover */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mb-12">
            <Link
              href={ROUTES.LOGIN}
              className="group relative inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 overflow-hidden"
              aria-label="Get started with Woorkshop"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-2">
                Start Free Session
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
            Free forever · No signup required · Real-time collaboration
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
                    woorkshop.app/session/demo
                  </div>
                </div>
              </div>

              {/* Video content area - Realistic Voting Interface */}
              <div className="relative aspect-video bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Voting Interface Mockup */}
                <div className="absolute inset-0 p-8">
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: isPlaying ? 1 : 0.5, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="h-5 bg-gray-800 rounded w-48 mb-2"></div>
                        <div className="h-3 bg-gray-400 rounded w-32"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white"></div>
                        <div className="w-8 h-8 rounded-full bg-purple-200 border-2 border-white -ml-3"></div>
                        <div className="w-8 h-8 rounded-full bg-green-200 border-2 border-white -ml-3"></div>
                        <div className="text-xs text-gray-600 ml-2">+5 voting</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: isPlaying ? "65%" : "0%" }}
                          transition={{ duration: 1.5, delay: 0.3 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        ></motion.div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">35 points left</span>
                    </div>
                  </motion.div>

                  {/* Feature Cards */}
                  <div className="space-y-3">
                    {/* Feature 1 - High Priority */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isPlaying ? 1 : 0.5, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-full"></div>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <span className="text-lg font-bold text-blue-700">40</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-blue-200"></div>
                          <div className="w-4 h-4 rounded-full bg-purple-200 -ml-2"></div>
                          <span>8 votes</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Feature 2 - Medium Priority */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isPlaying ? 1 : 0.5, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.35 }}
                      className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-800 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                            <span className="text-lg font-bold text-purple-700">25</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-green-200"></div>
                          <span>6 votes</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Feature 3 - Lower Priority */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isPlaying ? 1 : 0.5, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-800 rounded w-4/5 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <span className="text-lg font-bold text-green-700">0</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Not voted yet</span>
                      </div>
                    </motion.div>
                  </div>
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
