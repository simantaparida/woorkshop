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

  const plans: PricingPlan[] = [
    {
      name: 'Public Review',
      price: 'Free',
      tagline: 'Full access to all features during our public review period.',
      features: [
        'Unlimited sessions',
        'All frameworks (RICE, MoSCoW)',
        'Session history (Coming soon)',
        'CSV & Jira export',
      ],
      ctaText: 'Start Free Session →',
      ctaLink: '/tools',
      isPopular: true,
      badge: 'Limited Time',
    },
    {
      name: 'Pro',
      price: 'Soon',
      tagline: 'Advanced controls for growing teams. Coming soon.',
      features: [
        'Everything in Free',
        'Team analytics dashboard',
        'Priority support',
        'Custom templates',
      ],
      ctaText: 'Coming Soon',
      isComingSoon: true,
    },
    {
      name: 'Team',
      price: 'Custom',
      tagline: 'Enterprise-grade security and administration.',
      features: [
        'Everything in Pro',
        'SSO & SAML',
        'Audit logs',
        'Dedicated success manager',
      ],
      ctaText: 'Contact Sales',
      ctaLink: '/contact',
      isComingSoon: true,
    },
  ];

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
            Free for everyone. For now.
          </h2>

          {/* Subhead */}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're in public review. Enjoy full access to all features while we fine-tune the experience. Lock in your workflow today.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative bg-white rounded-2xl shadow-md p-6 flex flex-col ${plan.isPopular ? 'ring-2 ring-blue-600' : 'border border-gray-200'
                } ${plan.isComingSoon ? 'opacity-80' : ''}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-md">
                  {plan.badge}
                </div>
              )}

              {/* Status Badge for Coming Soon */}
              {plan.isComingSoon && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  Coming soon
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                {plan.originalPrice && (
                  <span className="text-gray-500 text-sm font-medium">{plan.originalPrice}</span>
                )}
              </div>

              {/* Tagline */}
              <p className="text-sm text-gray-600 mb-6 min-h-[40px]">
                {plan.tagline}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.isComingSoon ? 'text-gray-400' : 'text-green-500'
                        }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.isComingSoon ? (
                <button
                  disabled
                  className="w-full px-7 py-3.5 bg-gray-100 text-gray-400 text-base font-semibold rounded-lg cursor-not-allowed border border-gray-200"
                >
                  {plan.ctaText}
                </button>
              ) : (
                <Link
                  href={plan.ctaLink || '#'}
                  onClick={() => handleCTAClick(plan.name.toLowerCase())}
                  aria-label={`${plan.ctaText} for ${plan.name} plan`}
                  className="w-full group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 overflow-hidden mt-auto"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    {plan.ctaText}
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
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
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
