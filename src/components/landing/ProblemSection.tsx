'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const problems = [
  {
    icon: '👔',
    title: 'HiPPO Syndrome',
    description: 'The Highest Paid Person's Opinion wins every time',
    detail: 'Junior team members stop sharing ideas',
    color: 'from-chaos/10 to-chaos/5',
  },
  {
    icon: '📊',
    title: 'Death by Sticky Notes',
    description: '300 notes. 2 hours. Zero decisions.',
    detail: 'Miro boards that never turn into action',
    color: 'from-secondary-100 to-secondary-50',
  },
  {
    icon: '🔄',
    title: 'The Same Debate Loop',
    description: '"Let's discuss this next week" (again)',
    detail: 'Every sprint planning feels like Groundhog Day',
    color: 'from-gray-100 to-gray-50',
  },
];

export function ProblemSection() {
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
    <section ref={ref} className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          {/* Small Label */}
          <motion.div variants={itemVariants}>
            <span className="inline-block px-3 py-1 text-xs font-semibold text-chaos bg-red-50 rounded-full border border-red-200 mb-6">
              The Real Problem
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6"
          >
            It's not a roadmap problem.
            <br />
            It's a politics problem.
          </motion.h2>

          {/* Subhead */}
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
          >
            When decisions are made by whoever argues loudest, your team loses trust in the process—and each other.
          </motion.p>
        </motion.div>

        {/* Problem Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              variants={itemVariants}
              className="group relative"
            >
              <div className={`bg-gradient-to-br ${problem.color} rounded-2xl p-8 h-full border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg`}>
                {/* Icon */}
                <div className="text-5xl mb-4">{problem.icon}</div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {problem.title}
                </h3>

                {/* Description */}
                <p className="text-base font-semibold text-gray-700 mb-2">
                  {problem.description}
                </p>

                {/* Detail */}
                <p className="text-sm text-gray-600">
                  {problem.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pullquote */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-blue-50 rounded-2xl p-10 border-l-4 border-blue-600">
            <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 italic leading-relaxed text-center">
              "I'm tired of pretending sticky notes are a methodology."
            </blockquote>
            <p className="text-sm text-gray-600 text-center mt-4">
              — Product Manager, Series B Startup
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
