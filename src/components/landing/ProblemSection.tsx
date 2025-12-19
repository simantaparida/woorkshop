'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const problems = [
  {
    icon: '📋',
    title: 'Whiteboards Get Crowded',
    description: 'Too many voices, not enough structure',
    detail: 'Ideas compete for attention instead of evaluation',
    color: 'from-gray-700 to-gray-600',
  },
  {
    icon: '🎭',
    title: 'Sticky Notes Turn Performative',
    description: 'The loudest voice wins, not the best idea',
    detail: 'Teams optimize for presentation, not substance',
    color: 'from-gray-700 to-gray-600',
  },
  {
    icon: '⏱️',
    title: 'Voting Feels Rushed',
    description: 'Decisions made without real reflection',
    detail: 'Alignment becomes an illusion, not a reality',
    color: 'from-gray-700 to-gray-600',
  },
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [showSecondLine, setShowSecondLine] = useState(false);

  // Title animation sequence
  useEffect(() => {
    if (!isInView) return;

    const timer = setTimeout(() => {
      setShowSecondLine(true);
    }, 800); // Show second line after 0.8s

    return () => {
      clearTimeout(timer);
    };
  }, [isInView]);

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
    <section ref={ref} className="relative py-24 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 z-10">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          {/* Small Label */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-red-400 bg-red-950/50 rounded-full border border-red-800/50">
              The Real Problem
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-3 mb-6"
          >
            <h2 className="text-[1.5rem] font-bold text-gray-400 leading-tight">
              It's not a roadmap problem.
            </h2>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={showSecondLine ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-extrabold text-white leading-tight"
            >
              It's a politics problem.
            </motion.h2>
          </motion.div>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={showSecondLine ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-400 leading-relaxed max-w-3xl mx-auto"
          >
            Most teams don't lack ideas. They lack a way to surface them fairly.
          </motion.p>
        </motion.div>

        {/* Problem Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-8 items-stretch"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              variants={itemVariants}
              className="group relative flex"
            >
              {/* Gradient border wrapper */}
              <div className="relative rounded-lg p-[1px] bg-gradient-to-br from-gray-700 to-gray-600 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-900/50 w-full">
                {/* Card content */}
                <div className="relative bg-gray-800 group-hover:bg-gradient-to-br group-hover:from-gray-750 group-hover:via-gray-800 group-hover:to-gray-750 rounded-lg p-8 h-full flex flex-col transition-all duration-300">
                  {/* Icon */}
                  <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">
                    {problem.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {problem.title}
                  </h3>

                  {/* Description */}
                  <p className="text-base font-semibold text-gray-300 mb-2">
                    {problem.description}
                  </p>

                  {/* Detail */}
                  <p className="text-sm text-gray-400">
                    {problem.detail}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
