'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FileText, Users, BarChart3 } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: FileText,
    title: 'Add your options',
    description: 'Problems, ideas, trade-offs.',
  },
  {
    number: '2',
    icon: Users,
    title: 'Think individually',
    description: 'No influence. No pressure.',
  },
  {
    number: '3',
    icon: BarChart3,
    title: 'Reveal the signal',
    description: 'See what matters.',
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
    <section ref={ref} className="py-24 bg-gradient-to-b from-blue-50 to-blue-100">
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
            className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
          >
            Three steps. One decision.
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-5 mb-12 max-w-4xl mx-auto"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative"
            >
              {/* Step Card */}
              <div className="relative bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 text-lg font-bold mb-4">
                  {step.number}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Closing Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="text-xl text-gray-600">
            That's it. No theatre. No follow-ups.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
