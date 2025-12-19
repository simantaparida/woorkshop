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
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-12"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl md:text-3xl font-bold text-gray-900"
          >
            Building in public
          </motion.h2>
        </motion.div>

        {/* Live Metrics - Horizontal */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-col md:flex-row justify-center items-center gap-12 mb-10"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              variants={itemVariants}
              className="text-center"
            >
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-gray-600">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          <p className="text-sm text-gray-600">
            Have feedback?{' '}
            <a href="mailto:hello@woorkshop.app" className="text-gray-900 hover:underline font-medium">
              hello@woorkshop.app
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
