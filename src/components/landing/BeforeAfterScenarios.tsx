'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const scenarios = [
  {
    title: 'Sprint Planning',
    teamType: 'Product Teams',
    before: {
      headline: '2-hour meetings that go nowhere',
      points: [
        '"Let\'s take this offline" × 6',
        'Leave with "maybe" priorities',
        'Same debates next sprint',
      ],
    },
    after: {
      headline: '10-minute alignment sessions',
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
    before: {
      headline: 'The CEO\'s "great idea" derails everything',
      points: [
        'Roadmap changes every week',
        'Team morale tanks',
        'Junior members stop contributing',
      ],
    },
    after: {
      headline: 'Data-backed pushback',
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
    before: {
      headline: 'Research no one acts on',
      points: [
        '50 insights',
        'Zero prioritization',
        '"Everything is important"',
      ],
    },
    after: {
      headline: 'Ranked insights teams actually ship',
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

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
    <section ref={ref} className="py-24 bg-white">
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
            What changes when you have a system
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Real scenarios from teams who replaced chaos with structure
          </motion.p>
        </motion.div>

        {/* Scenario Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="space-y-6 max-w-5xl mx-auto"
        >
          {scenarios.map((scenario, index) => (
            <motion.div
              key={scenario.title}
              variants={itemVariants}
              className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Header - Always Visible */}
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full px-8 py-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
              >
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {scenario.teamType}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {expandedIndex === index ? 'Collapse' : 'Expand'}
                  </span>
                  <svg
                    className={`w-6 h-6 text-gray-700 transition-transform duration-300 ${
                      expandedIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expandable Content */}
              <motion.div
                initial={false}
                animate={{
                  height: expandedIndex === index ? 'auto' : 0,
                  opacity: expandedIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="grid md:grid-cols-2 divide-x divide-gray-200">
                  {/* Before */}
                  <div className="p-8 bg-gradient-to-br from-chaos/5 to-chaos/0">
                    <div className="inline-block px-3 py-1 bg-chaos/10 text-chaos text-xs font-bold uppercase rounded-full mb-4">
                      Before
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      {scenario.before.headline}
                    </h4>
                    <ul className="space-y-3">
                      {scenario.before.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-chaos mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* After */}
                  <div className="p-8 bg-gradient-to-br from-clarity/5 to-clarity/0">
                    <div className="inline-block px-3 py-1 bg-clarity/10 text-clarity text-xs font-bold uppercase rounded-full mb-4">
                      After
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      {scenario.after.headline}
                    </h4>
                    <ul className="space-y-3">
                      {scenario.after.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-clarity mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
