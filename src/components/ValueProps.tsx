'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

interface Feature {
  title: string;
  description: string;
  icon: JSX.Element;
}

const features: Feature[] = [
  {
    title: 'Hand off your busywork',
    description: 'What used to take hours now takes minutes. Tell Padool the goal and watch it organize priorities.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Collaborates with your team',
    description: 'Invite PMs, designers and engineers — everyone has the same voice and the same view.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Knows what you know',
    description: 'Bring context from docs, tickets, and conversations so decisions are informed, not guessed.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Personalized to you',
    description: 'Session goals, templates, and quick modes adapt to how your team prefers to work.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
];

export function ValueProps() {
  const { trackEvent } = useAnalytics();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const handleCTAClick = () => {
    trackEvent('value_prop_cta_click');
    // Scroll to demo or trigger modal
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid lg:grid-cols-2 gap-16 items-start"
        >
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            {/* Small Label */}
            <motion.div variants={itemVariants}>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full border border-blue-200">
                Product features · Trusted basics
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
            >
              You assign the tasks. Padool does the work.
            </motion.h2>

            {/* Subhead */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-600 leading-relaxed"
            >
              Hand off repetitive prioritization work and reclaim your team's time. Tell Padool the goal, invite teammates, and watch priorities surface — fast.
            </motion.p>

            {/* Features List */}
            <motion.div variants={itemVariants} className="space-y-6 pt-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="flex items-start gap-4 group"
                >
                  {/* Circle Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <button
                onClick={handleCTAClick}
                data-analytics="value_prop_cta"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-base font-semibold rounded-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                aria-label="Try a demo flow"
              >
                <span className="relative">Try a demo flow</span>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.div>
          </div>

          {/* Right Column - Screenshot/Demo Preview */}
          <motion.div
            variants={itemVariants}
            className="relative lg:sticky lg:top-24"
          >
            {/* Caption */}
            <div className="mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-600">Live demo preview</span>
            </div>

            {/* Screenshot Card */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 p-6">
              {/* Placeholder Screenshot Content */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Mock App Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">P</span>
                      </div>
                      <div>
                        <div className="h-3 bg-white/90 rounded w-32 mb-1"></div>
                        <div className="h-2 bg-white/60 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20"></div>
                      <div className="w-8 h-8 rounded-full bg-white/20"></div>
                      <div className="w-8 h-8 rounded-full bg-white/20"></div>
                    </div>
                  </div>
                </div>

                {/* Mock Feature Cards */}
                <div className="p-6 space-y-4">
                  {/* Card 1 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="h-4 bg-blue-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-blue-200 rounded w-1/2"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded bg-blue-200 flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-700">85</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="h-4 bg-purple-300 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-purple-200 rounded w-3/5"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded bg-purple-200 flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-700">72</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="h-4 bg-green-300 rounded w-4/5 mb-2"></div>
                        <div className="h-3 bg-green-200 rounded w-2/5"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-6 rounded bg-green-200 flex items-center justify-center">
                          <span className="text-xs font-bold text-green-700">68</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Mock Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-200"></div>
                      <div className="w-6 h-6 rounded-full bg-purple-200 -ml-2"></div>
                      <div className="w-6 h-6 rounded-full bg-green-200 -ml-2"></div>
                      <span className="text-xs text-gray-500 ml-2">+5 teammates</span>
                    </div>
                    <div className="h-8 bg-blue-600 rounded px-4 flex items-center">
                      <div className="h-2 bg-white rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full blur-2xl opacity-30"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-200 rounded-full blur-2xl opacity-30"></div>
            </div>

            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-6 left-6 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <span className="text-xs font-semibold text-gray-700">Real-time sync</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -top-6 right-12 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-gray-700">8 active voters</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
