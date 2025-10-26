'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

interface Step {
  number: string;
  title: string;
  description: string;
  color: string;
  bgGradient: string;
  iconGradient: string;
}

export function HowItWorks() {
  const { trackEvent } = useAnalytics();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleCTAClick = () => {
    trackEvent('try_demo_clicked');
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const steps: Step[] = [
    {
      number: '01',
      title: 'Create & Share',
      description: 'Add your ideas, choose a session goal, and send the link — no signups, no friction.',
      color: 'blue',
      bgGradient: 'from-blue-50 to-blue-100/50',
      iconGradient: 'from-blue-500 to-blue-600',
    },
    {
      number: '02',
      title: 'Vote Together',
      description: 'Each teammate gets 100 points. Use quick modes (Even / Top 3) or allocate freely.',
      color: 'purple',
      bgGradient: 'from-purple-50 to-purple-100/50',
      iconGradient: 'from-purple-500 to-purple-600',
    },
    {
      number: '03',
      title: 'See the Results',
      description: 'Padool ranks priorities, shows alignment metrics, and gives an export you can share.',
      color: 'green',
      bgGradient: 'from-green-50 to-green-100/50',
      iconGradient: 'from-green-500 to-green-600',
    },
  ];

  return (
    <section ref={ref} className="relative py-24 overflow-hidden bg-white">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Simple Process</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            How Padool flows
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to align your team and decide what to build next.
          </p>
        </motion.div>

        {/* Steps Flow */}
        <div className="relative max-w-6xl mx-auto mb-16">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200"></div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                className="relative"
              >
                {/* Card */}
                <div className="relative group">
                  {/* Floating Number Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3, type: 'spring', stiffness: 200 }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 z-10"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.iconGradient} shadow-lg flex items-center justify-center`}>
                      <span className="text-white font-bold text-lg">{step.number}</span>
                    </div>
                  </motion.div>

                  {/* Main Card */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="relative mt-6 p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                  >

                    <div className="relative">
                      {/* Icon */}
                      <div className="mb-6">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${step.iconGradient}`}>
                          {index === 0 && (
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          )}
                          {index === 1 && (
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          )}
                          {index === 2 && (
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-700 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Arrow Indicator (except last) */}
                      {index < steps.length - 1 && (
                        <div className="hidden md:block absolute -right-12 top-1/2 -translate-y-1/2 text-gray-300">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Results Preview with Floating Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="relative">
            {/* Main Preview Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <span className="text-sm font-semibold text-gray-700">Live Results Preview</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">8 active voters</span>
                </div>
              </div>

              {/* Ranked Items */}
              <div className="space-y-5">
                {[
                  { label: 'User authentication', score: 92, rank: 1, color: 'from-blue-500 to-blue-600', votes: '8/8' },
                  { label: 'Dark mode toggle', score: 78, rank: 2, color: 'from-purple-500 to-purple-600', votes: '7/8' },
                  { label: 'Mobile app version', score: 65, rank: 3, color: 'from-green-500 to-green-600', votes: '6/8' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: 1 + idx * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} text-white font-bold text-sm shadow-md`}>
                          #{item.rank}
                        </div>
                        <span className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">{item.votes}</span>
                        <span className="text-xl font-bold text-gray-900">{item.score}</span>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${item.score}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: 1.2 + idx * 0.15, ease: 'easeOut' }}
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full relative`}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {['bg-gradient-to-br from-blue-500 to-blue-600', 'bg-gradient-to-br from-purple-500 to-purple-600', 'bg-gradient-to-br from-green-500 to-green-600', 'bg-gradient-to-br from-orange-500 to-orange-600'].map((color, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ duration: 0.3, delay: 1.5 + idx * 0.1, type: 'spring', stiffness: 200 }}
                      className={`w-10 h-10 rounded-full ${color} border-3 border-white flex items-center justify-center text-white text-sm font-bold shadow-md hover:scale-110 transition-transform cursor-pointer`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </motion.div>
                  ))}
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-sm hover:shadow-lg transition-all hover:scale-105">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -5 }}
              animate={isInView ? { opacity: 1, y: 0, rotate: -3 } : { opacity: 0, y: 20, rotate: -5 }}
              transition={{ duration: 0.5, delay: 1.8 }}
              className="absolute -top-4 -right-4 bg-gradient-to-br from-green-500 to-green-600 text-white px-4 py-2 rounded-xl shadow-xl"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-bold">Real-time sync</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <button
            onClick={handleCTAClick}
            aria-label="Try a demo flow"
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center gap-2">
              Try a demo flow
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Demo runs in your browser — no account required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
