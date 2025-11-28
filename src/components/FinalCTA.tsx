'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

export function FinalCTA() {
  const { trackEvent } = useAnalytics();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Track when section enters viewport
  useEffect(() => {
    if (isInView) {
      trackEvent('final_cta_viewed');
    }
  }, [isInView, trackEvent]);

  const handleCTAClick = () => {
    trackEvent('final_cta_clicked');
  };

  return (
    <section ref={ref} className="relative py-24 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
        >
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Ready to align your team?
          </h2>

          {/* Subhead */}
          <p className="text-slate-600 md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Create your first Padool session in seconds. No credit card, no signup, no noise — just clarity.
          </p>

          {/* CTA Button */}
          <Link
            href="/projects"
            onClick={handleCTAClick}
            aria-label="Start a free Padool session"
            className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center gap-2">
              Start Free Session
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

          {/* Microcopy */}
          <p className="text-sm text-slate-500 mt-4">
            Join teams making better decisions in less time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
