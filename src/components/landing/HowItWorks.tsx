'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FileText, Users, BarChart3 } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: FileText,
    title: 'Add your options',
    description: 'Problems, ideas, trade-offs — clearly framed.',
  },
  {
    number: '2',
    icon: Users,
    title: 'Think individually',
    description: 'Everyone responds. No influence. No pressure.',
  },
  {
    number: '3',
    icon: BarChart3,
    title: 'Reveal the signal',
    description: 'The group sees what actually matters.',
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
    <section ref={ref} className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full border border-blue-200 mb-6">
              Dead Simple
            </span>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6"
          >
            Three steps. Ten minutes.
            <br />
            One clear decision.
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative"
            >
              {/* Step Card */}
              <div className="relative bg-white rounded-lg p-6 border-2 border-gray-800 hover:border-gray-900 hover:shadow-md transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-white text-lg font-bold mb-4">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-gray-100 mb-4">
                  <step.icon className="w-7 h-7 text-gray-700" />
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
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            That's it.
          </p>
          <div className="space-y-1">
            <p className="text-lg text-gray-600">No facilitation theatre.</p>
            <p className="text-lg text-gray-600">No endless follow-ups.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
