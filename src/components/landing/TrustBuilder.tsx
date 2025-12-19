'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

// Placeholder data - in production, these would come from Supabase
const metrics = [
  {
    value: '127',
    label: 'Sessions run',
    subtext: 'In the last 30 days',
  },
  {
    value: '2,847',
    label: 'Votes cast',
    subtext: 'Real teams making real decisions',
  },
  {
    value: '9.3 min',
    label: 'Avg session time',
    subtext: 'We said 10 minutes. We meant it.',
  },
];

const feedback = [
  {
    type: 'positive',
    icon: '✓',
    text: 'Finally killed our 2-hour sprint planning meetings',
    color: 'text-clarity',
  },
  {
    type: 'critical',
    icon: '△',
    text: 'Needs Linear integration, not just Jira',
    color: 'text-secondary-600',
  },
  {
    type: 'request',
    icon: '→',
    text: 'Would love session templates for common use cases',
    color: 'text-blue-600',
  },
];

export function TrustBuilder() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
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
        ease: 'easeOut',
      },
    },
  };

  return (
    <section ref={ref} className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-12"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
          >
            Building in public
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-600"
          >
            Real usage data. Unfiltered feedback. Help us get it right.
          </motion.p>
        </motion.div>

        {/* Live Metrics */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-8 mb-12"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              variants={itemVariants}
              className="bg-white rounded-lg p-6 border border-gray-300 text-center"
            >
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {metric.label}
              </div>
              <div className="text-xs text-gray-600">
                {metric.subtext}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feedback Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-3xl mx-auto mb-10"
        >
          <div className="bg-white rounded-lg p-8 border-2 border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              What people are saying
            </h3>
            <div className="space-y-4 mb-6">
              {feedback.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-gray-900 font-bold">•</div>
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
            <a
              href="mailto:hello@woorkshop.app"
              className="text-sm font-semibold text-gray-900 hover:underline"
            >
              Share your feedback →
            </a>
          </div>
        </motion.div>

        {/* Roadmap */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          <p className="text-sm text-gray-600">
            Want to see what's next?{' '}
            <a href="mailto:hello@woorkshop.app?subject=Roadmap%20Access" className="text-gray-900 hover:underline font-medium">
              Request roadmap access
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
