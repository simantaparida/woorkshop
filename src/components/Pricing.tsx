'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

interface PricingPlan {
  name: string;
  price: string;
  originalPrice?: string;
  tagline: string;
  features: string[];
  ctaText: string;
  ctaLink?: string;
  isPopular?: boolean;
  isComingSoon?: boolean;
  badge?: string;
}

export function Pricing() {
  const { trackEvent } = useAnalytics();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleCTAClick = (plan: string) => {
    trackEvent('pricing_cta_clicked', { plan });
  };

  const plan: PricingPlan = {
    name: 'Public Review Access',
    price: '$0',
    tagline: 'Full access. No credit card. No bait-and-switch.',
    features: [
      'Unlimited sessions & voters',
      'All frameworks (RICE, MoSCoW, 100-Point)',
      'CSV & Jira export',
      'Real-time collaboration',
      'Session history (coming soon)',
      'Early adopter benefits when we launch pricing',
    ],
    ctaText: 'Start Free Session',
    ctaLink: '/home',
    isPopular: false,
  };

  return (
    <section ref={ref} className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Free. No catch.
          </h2>
          <p className="text-lg text-gray-600">
            Use it while we build. Early users get benefits when we launch.
          </p>
        </motion.div>

        {/* Simplified Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-lg p-8 border-2 border-gray-800">
            {/* CTA */}
            <Link
              href={plan.ctaLink || '#'}
              onClick={() => handleCTAClick(plan.name.toLowerCase())}
              aria-label={`${plan.ctaText}`}
              className="w-full group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white text-lg font-bold rounded-lg transition-all duration-300 ease-out hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              <span className="relative flex items-center gap-2">
                {plan.ctaText}
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            {/* Footer Note */}
            <p className="text-sm text-gray-600 text-center mt-6">
              No credit card. No bait-and-switch.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
