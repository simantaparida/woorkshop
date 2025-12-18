'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const scenarios = [
  {
    title: 'Sprint Planning',
    teamType: 'Product Teams',
    emoji: '📅',
    before: {
      headline: '2-hour meetings that go nowhere',
      description: 'Everyone talks. Nothing gets decided.',
      points: [
        '"Let\'s take this offline" × 6',
        'Leave with "maybe" priorities',
        'Same debates next sprint',
      ],
    },
    after: {
      headline: '10-minute alignment sessions',
      description: 'Clear priorities. Immediate action.',
      points: [
        'Pre-voting before the meeting',
        'Meeting starts with results',
        'Leave with top-3 commitments',
      ],
    },
  },
  {
    title: 'Startup Decisions',
    teamType: 'Founders',
    emoji: '🚀',
    before: {
      headline: 'The CEO\'s "great idea" derails everything',
      description: 'Opinions rule. Data loses.',
      points: [
        'Roadmap changes every week',
        'Team morale tanks',
        'Junior members stop contributing',
      ],
    },
    after: {
      headline: 'Data-backed pushback',
      description: 'Numbers speak. Everyone listens.',
      points: [
        '"That scores 12/100 vs our top priority at 87"',
        'Roadmap stability',
        'Everyone\'s voice counts equally',
      ],
    },
  },
  {
    title: 'Design Research',
    teamType: 'UX Designers',
    emoji: '🎨',
    before: {
      headline: 'Research no one acts on',
      description: '50 insights. Zero shipped.',
      points: [
        '50 insights',
        'Zero prioritization',
        '"Everything is important"',
      ],
    },
    after: {
      headline: 'Ranked insights teams actually ship',
      description: 'Prioritized actions. Real impact.',
      points: [
        'RICE-scored insights',
        'Clear top-5 to design',
        'From research to action',
      ],
    },
  },
];

export function BeforeAfterScenarios() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

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
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-12"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full border border-blue-200">
              The Transformation
            </span>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6"
          >
            Before vs. After
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Real teams. Real transformations. See what changes when chaos meets structure.
          </motion.p>
        </motion.div>

        {/* Scenario Tabs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {scenarios.map((scenario, index) => (
              <motion.button
                key={scenario.title}
                variants={itemVariants}
                onClick={() => setSelectedIndex(index)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  selectedIndex === index
                    ? 'bg-gray-900 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <span className="mr-2">{scenario.emoji}</span>
                {scenario.title}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Comparison Cards */}
        <motion.div
          key={selectedIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Before Card */}
          <div className="relative">
            <div className="absolute -top-3 left-6 z-10">
              <span className="inline-block px-4 py-1.5 bg-red-500 text-white text-xs font-bold uppercase rounded-full shadow-md">
                Without System
              </span>
            </div>
            <div className="bg-white rounded-2xl border-2 border-red-200 p-8 pt-10 h-full">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {scenarios[selectedIndex].before.headline}
                </h3>
                <p className="text-sm font-semibold text-red-600">
                  {scenarios[selectedIndex].before.description}
                </p>
              </div>
              <ul className="space-y-3">
                {scenarios[selectedIndex].before.points.map((point, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 leading-snug">{point}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* After Card */}
          <div className="relative">
            <div className="absolute -top-3 left-6 z-10">
              <span className="inline-block px-4 py-1.5 bg-green-500 text-white text-xs font-bold uppercase rounded-full shadow-md">
                With System
              </span>
            </div>
            <div className="bg-white rounded-2xl border-2 border-green-200 p-8 pt-10 h-full">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {scenarios[selectedIndex].after.headline}
                </h3>
                <p className="text-sm font-semibold text-green-600">
                  {scenarios[selectedIndex].after.description}
                </p>
              </div>
              <ul className="space-y-3">
                {scenarios[selectedIndex].after.points.map((point, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 leading-snug">{point}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Team Type Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <span className="text-sm text-gray-500">
            For <span className="font-semibold text-gray-700">{scenarios[selectedIndex].teamType}</span>
          </span>
        </motion.div>
      </div>
    </section>
  );
}
