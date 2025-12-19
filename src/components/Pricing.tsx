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
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Free while we figure this out
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Full access during public review. Early users get locked-in benefits when we launch pricing.
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-lg p-8 border-2 border-gray-800">
            {/* Price */}
            <div className="text-center mb-6">
              <span className="text-5xl font-bold text-gray-900">$0</span>
              <p className="text-gray-600 mt-2">Full access. No credit card. No bait-and-switch.</p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

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
          </div>
        </motion.div>

        {/* Why Free */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto mt-12 text-center"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">Why is this free?</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            We're validating product-market fit. If this doesn't solve your team's prioritization problem, we want to know now—not after we've charged you.
          </p>
          <p className="text-gray-600 text-sm">
            Questions? <a href="mailto:hello@woorkshop.app" className="text-gray-900 hover:underline font-medium">hello@woorkshop.app</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
