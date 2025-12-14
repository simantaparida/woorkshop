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
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm mb-6">
            <span className="text-sm font-medium text-blue-700">Public Review Period</span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Free while we figure this out.
            <br />
            Seriously.
          </h2>

          {/* Subhead */}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're in public review. You get full access to everything while we improve the product based on your feedback. When we're ready to charge, early users get locked-in benefits.
          </p>
        </motion.div>

        {/* Single Pricing Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="relative bg-white rounded-2xl shadow-xl p-10 border-2 border-blue-200"
          >
            {/* Plan Name */}
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {plan.name}
            </h3>

            {/* Price */}
            <div className="mb-4">
              <span className="text-5xl font-extrabold text-blue-600">{plan.price}</span>
            </div>

            {/* Tagline */}
            <p className="text-lg text-gray-700 font-medium mb-8">
              {plan.tagline}
            </p>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 flex-shrink-0 mt-0.5 text-clarity"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-base text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href={plan.ctaLink || '#'}
              onClick={() => handleCTAClick(plan.name.toLowerCase())}
              aria-label={`${plan.ctaText}`}
              className="w-full group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
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
              We'll announce pricing 30 days before charging. Early users will get special pricing locked in permanently.
            </p>
          </motion.div>
        </div>

        {/* Transparency Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🔓</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Why is this free?
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We're validating product-market fit. If this doesn't solve your team's prioritization problem, we want to know now—not after we've charged you.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Your feedback shapes the product. Use it, break it, tell us what's missing.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600">
            Questions? Reach out to us at{' '}
            <a href="mailto:hello@woorkshop.app" className="text-blue-600 hover:underline font-medium">
              hello@woorkshop.app
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
