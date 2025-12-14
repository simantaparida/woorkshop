'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

interface Testimonial {
  quote: string;
  attribution: string;
  avatar: JSX.Element;
}

export function SocialProof() {
  const { trackEvent } = useAnalytics();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Track when section enters viewport
  useEffect(() => {
    if (isInView) {
      trackEvent('social_proof_viewed');
    }
  }, [isInView, trackEvent]);

  const handleCTAClick = () => {
    trackEvent('testimonial_cta_clicked');
  };

  const testimonials: Testimonial[] = [
    {
      quote: 'Woorkshop turned our sprint planning into a 15-minute ritual. Fewer meetings, clearer priorities.',
      attribution: 'Product Manager, early-stage SaaS team',
      avatar: (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          P
        </div>
      ),
    },
    {
      quote: 'We ran a cross-functional workshop and everyone left with the same top-3 priorities. That rarely happens.',
      attribution: 'Design Lead, distributed team',
      avatar: (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          D
        </div>
      ),
    },
    {
      quote: 'The results export made it easy to jump from alignment to action in Jira and our roadmap doc.',
      attribution: 'Engineering Manager, growth-focused team',
      avatar: (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          E
        </div>
      ),
    },
  ];

  const logos = [
    { bg: 'from-blue-500 to-blue-600', initial: 'S' },
    { bg: 'from-purple-500 to-purple-600', initial: 'D' },
    { bg: 'from-green-500 to-green-600', initial: 'T' },
    { bg: 'from-orange-500 to-orange-600', initial: 'F' },
    { bg: 'from-pink-500 to-pink-600', initial: 'R' },
    { bg: 'from-indigo-500 to-indigo-600', initial: 'A' },
  ];

  // Metrics temporarily removed - will be replaced with real data from Supabase
  const metrics: Array<{ value: string; label: string }> = [
    // { value: '12k+', label: 'votes cast' },
    // { value: '800+', label: 'sessions run' },
    // { value: '12 min', label: 'avg session' },
  ];

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Label */}


          {/* H2 */}
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Teams that move faster with Woorkshop
          </h2>

          {/* Subhead */}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hundreds of teams use Woorkshop to turn debates into clear decisions. Here's what they say.
          </p>
        </motion.div>

        {/* Logo Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-6 mb-16 flex-wrap"
        >
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className={`w-14 h-14 rounded-full bg-gradient-to-br ${logo.bg} flex items-center justify-center text-white font-bold shadow-md opacity-60 hover:opacity-100 transition-opacity`}
              aria-hidden="true"
            >
              {logo.initial}
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              {/* Quote Icon */}
              <svg
                className="w-8 h-8 text-blue-600 mb-4 opacity-40"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>

              {/* Quote */}
              <blockquote className="text-gray-800 leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>

              {/* Attribution */}
              <div className="flex items-center gap-3">
                {testimonial.avatar}
                <cite className="not-italic text-sm text-gray-600">
                  {testimonial.attribution}
                </cite>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Metrics Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center justify-center gap-8 mb-12 flex-wrap"
        >
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200"
            >
              <span className="text-lg font-bold text-gray-900">{metric.value}</span>
              <span className="text-sm text-gray-600">{metric.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center"
        >
          <Link
            href="/templates"
            onClick={handleCTAClick}
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center gap-2">
              See customer stories & templates
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
