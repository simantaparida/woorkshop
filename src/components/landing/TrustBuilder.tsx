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
    <section ref={ref} className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6"
          >
            We're building this in public.
            <br />
            Help us get it right.
          </motion.h2>
        </motion.div>

        {/* Live Metrics */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              variants={itemVariants}
              className="bg-white rounded-2xl p-8 border border-gray-200 text-center hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-5xl font-extrabold text-blue-600 mb-2">
                {metric.value}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {metric.label}
              </div>
              <div className="text-sm text-gray-600">
                {metric.subtext}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Unfiltered Feedback */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="bg-secondary-50 rounded-2xl p-8 border-2 border-secondary-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span>📣</span>
              What people are actually saying
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              We pull feedback from our Discord, emails, and feedback forms. The good, the bad, and the "please add this feature."
            </p>
            <div className="space-y-4">
              {feedback.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`text-lg font-bold ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="text-gray-700 leading-relaxed">
                    "{item.text}"
                  </div>
                </div>
              ))}
            </div>
            <a
              href="mailto:hello@woorkshop.app"
              className="inline-block mt-6 text-sm font-semibold text-secondary-700 hover:text-secondary-800 transition-colors"
            >
              Add your feedback →
            </a>
          </div>
        </motion.div>

        {/* Public Roadmap Link */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="text-4xl">🗺️</div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 text-lg mb-1">
                See what we're building next
              </div>
              <div className="text-sm text-gray-600">
                Our roadmap is public. See what's coming and vote on features you want.
              </div>
            </div>
            <a
              href="mailto:hello@woorkshop.app?subject=Roadmap%20Access"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              Request Access
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
