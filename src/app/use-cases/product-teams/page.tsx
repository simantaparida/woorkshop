'use client';

import { motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/Navbar';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

export default function ProductTeamsPage() {
  const router = useRouter();
  const { trackEvent } = useAnalytics();

  const handleCTAClick = () => {
    trackEvent('product_teams_cta_clicked');
    router.push(ROUTES.CREATE);
  };

  const problemRef = useRef(null);
  const isProblemInView = useInView(problemRef, { once: true, margin: '-100px' });
  const [showSecondLine, setShowSecondLine] = useState(false);

  const scenariosRef = useRef(null);
  const isScenariosInView = useInView(scenariosRef, { once: true, margin: '-100px' });
  const [selectedScenario, setSelectedScenario] = useState(0);

  const trustRef = useRef(null);
  const isTrustInView = useInView(trustRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isProblemInView) return;
    const timer = setTimeout(() => setShowSecondLine(true), 800);
    return () => clearTimeout(timer);
  }, [isProblemInView]);

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

  const scenarios = [
    {
      title: 'Sprint Planning',
      emoji: '📅',
      before: {
        headline: '2-hour debate marathons',
        description: 'Everyone talks. Nothing gets decided.',
        points: [
          '"Let\'s circle back on that" × 7',
          'The loudest PM always wins',
          'Same arguments every sprint',
        ],
      },
      after: {
        headline: '15-minute alignment sprint',
        description: 'Data speaks. Team aligns.',
        points: [
          'Pre-vote async before meeting',
          'Meeting opens with ranked results',
          'Leave with top-3 commitments',
        ],
      },
    },
    {
      title: 'Feature Prioritization',
      emoji: '🎯',
      before: {
        headline: 'The HiPPO decides everything',
        description: 'Politics > product sense.',
        points: [
          'CEO\'s "gut feel" overrides research',
          'Roadmap changes weekly',
          'Junior voices ignored',
        ],
      },
      after: {
        headline: 'RICE scores settle debates',
        description: 'Numbers over noise.',
        points: [
          '"That scores 14/100 vs our top priority at 87"',
          'Roadmap grounded in data',
          'Everyone\'s input weighted fairly',
        ],
      },
    },
    {
      title: 'Backlog Grooming',
      emoji: '🧹',
      before: {
        headline: '200 tickets, zero clarity',
        description: '"Everything is important."',
        points: [
          'No one knows what to build next',
          'Engineers cherry-pick easy wins',
          'Impact gets buried in noise',
        ],
      },
      after: {
        headline: 'Clear top-10, ruthless scope',
        description: 'Must-haves vs nice-to-haves.',
        points: [
          'MoSCoW categorization in 10 minutes',
          'Engineers know the priority order',
          'High-impact work floats to top',
        ],
      },
    },
  ];

  const problems = [
    {
      icon: '🎭',
      title: 'HiPPO Rules the Room',
      description: 'Highest Paid Person\'s Opinion wins',
      detail: 'Junior PMs stop contributing. Best ideas stay silent.',
    },
    {
      icon: '⏱️',
      title: 'Meetings Drag On Forever',
      description: '2-hour debates that end with "maybe"',
      detail: 'No structure means no decisions.',
    },
    {
      icon: '📊',
      title: 'Gut Feelings Beat Data',
      description: 'Roadmaps change on a whim',
      detail: 'No framework to anchor priorities.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6"
            >
              <span className="text-xl">🚀</span>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">For Product Teams</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
            >
              Stop debating priorities.
              <br />
              <span className="text-blue-600">Start shipping them.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto"
            >
              Turn 2-hour sprint planning meetings into 15-minute alignment sessions. Use RICE, MoSCoW, or 100-Point frameworks to make gut feelings feel irrelevant.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                variant="secondary"
                size="lg"
                onClick={handleCTAClick}
                className="group !bg-blue-600 !text-white hover:!bg-blue-700 hover:shadow-md transition-all duration-200 !border-0 font-bold px-8 py-4 text-lg inline-flex items-center gap-2"
              >
                Start Free Session
                <svg
                  className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <p className="text-sm text-gray-500">
                No signup · No credit card · 60 seconds to first session
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section ref={problemRef} className="relative py-24 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isProblemInView ? 'visible' : 'hidden'}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-red-400 bg-red-950/50 rounded-full border border-red-800/50">
                The Real Problem
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-3 mb-6"
            >
              <h2 className="text-[1.5rem] font-bold text-gray-400 leading-tight">
                You don't have a roadmap problem.
              </h2>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={showSecondLine ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-extrabold text-white leading-tight"
              >
                You have a consensus problem.
              </motion.h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={showSecondLine ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-400 leading-relaxed max-w-3xl mx-auto"
            >
              Your backlog is overflowing. Sales wants one thing, Support wants another, and the CEO has a "game-changer." Without structure, decisions become political theater.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isProblemInView ? 'visible' : 'hidden'}
            className="grid md:grid-cols-3 gap-8 items-stretch"
          >
            {problems.map((problem) => (
              <motion.div
                key={problem.title}
                variants={itemVariants}
                className="group relative flex"
              >
                <div className="relative rounded-lg p-[1px] bg-gradient-to-br from-gray-700 to-gray-600 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-900/50 w-full">
                  <div className="relative bg-gray-800 group-hover:bg-gradient-to-br group-hover:from-gray-750 group-hover:via-gray-800 group-hover:to-gray-750 rounded-lg p-8 h-full flex flex-col transition-all duration-300">
                    <div className="text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">
                      {problem.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {problem.title}
                    </h3>
                    <p className="text-base font-semibold text-gray-300 mb-2">
                      {problem.description}
                    </p>
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

      {/* Before/After Scenarios */}
      <section ref={scenariosRef} className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isScenariosInView ? 'visible' : 'hidden'}
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
              Real product teams. Real transformations. See what changes when chaos meets structure.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isScenariosInView ? 'visible' : 'hidden'}
            className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white"
          >
            <div className="bg-gray-50 border-b-2 border-gray-200">
              <div className="grid grid-cols-3 divide-x divide-gray-200">
                {scenarios.map((scenario, index) => (
                  <motion.button
                    key={scenario.title}
                    variants={itemVariants}
                    onClick={() => setSelectedScenario(index)}
                    className={`px-5 py-4 text-sm font-semibold transition-all duration-300 ${
                      selectedScenario === index
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {scenario.title}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.div
              key={selectedScenario}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2"
            >
              <div className="p-8 border-r border-gray-200">
                <div className="mb-6">
                  <div className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase rounded-full mb-4">
                    Without System
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {scenarios[selectedScenario].before.headline}
                  </h3>
                  <p className="text-sm font-semibold text-red-600">
                    {scenarios[selectedScenario].before.description}
                  </p>
                </div>
                <ul className="space-y-3">
                  {scenarios[selectedScenario].before.points.map((point, idx) => (
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

              <div className="p-8 bg-gradient-to-br from-green-50/30 to-white">
                <div className="mb-6">
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full mb-4">
                    With System
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {scenarios[selectedScenario].after.headline}
                  </h3>
                  <p className="text-sm font-semibold text-green-600">
                    {scenarios[selectedScenario].after.description}
                  </p>
                </div>
                <ul className="space-y-3">
                  {scenarios[selectedScenario].after.points.map((point, idx) => (
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for the Product Lifecycle
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Problem Framing',
                description: 'Before jumping to solutions, make sure you are solving the right problem. Use our problem framing templates to align on the "Why" before the "What".',
                checklist: [
                  'Define the core user problem',
                  'Identify success metrics',
                  'Align on scope constraints',
                  'Generate hypothesis before features'
                ]
              },
              {
                title: 'Quarterly Roadmapping',
                description: 'Use the RICE framework to robustly score major initiatives. Balance Reach, Impact, and Confidence against Effort to ensure you are placing the right bets.',
                checklist: [
                  'Import quarterly initiatives',
                  'Team estimates Effort scores',
                  'PMs define Reach & Impact',
                  'Visualize the highest ROI items'
                ]
              },
              {
                title: 'Sprint Backlog Logic',
                description: 'Have a overflow of "nice-to-haves"? Use the MoSCoW method (Must, Should, Could, Won\'t) to aggressively scope down your sprint to what truly matters.',
                checklist: [
                  'Categorize checklist items',
                  'Negotiate scope with engineering',
                  'Protect the "Must Haves"',
                  'Defer the "Won\'t Haves" for later'
                ]
              },
              {
                title: 'Budget Allocation',
                description: 'Use the 100-Point Method to simulate budget constraints. Give stakeholders 100 "dollars" to spend on features, revealing what they truly value when resources are limited.',
                checklist: [
                  'Allocate fixed currency to stakeholders',
                  'Force trade-off decisions',
                  'Identify "Dark Horse" favorites',
                  'Reveal true value perception'
                ]
              }
            ].map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{useCase.description}</p>
                <ul className="space-y-3">
                  {useCase.checklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Builder Section */}
      <section ref={trustRef} className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isTrustInView ? 'visible' : 'hidden'}
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

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isTrustInView ? 'visible' : 'hidden'}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    127
                  </div>
                  <div className="text-xs md:text-sm font-semibold text-gray-900 mb-1">
                    Sessions run
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-600">
                    In the last 30 days
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    2,847
                  </div>
                  <div className="text-xs md:text-sm font-semibold text-gray-900 mb-1">
                    Votes cast
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-600">
                    Real teams making real decisions
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    9.3 min
                  </div>
                  <div className="text-xs md:text-sm font-semibold text-gray-900 mb-1">
                    Avg session time
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-600">
                    We said 10 minutes. We meant it.
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  What product teams are saying
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 font-bold">•</div>
                    <div className="text-gray-700 text-sm leading-relaxed">
                      "Finally killed our 2-hour sprint planning meetings"
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 font-bold">•</div>
                    <div className="text-gray-700 text-sm leading-relaxed">
                      "RICE scoring helps us push back on exec 'great ideas' with data"
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600 font-bold">•</div>
                    <div className="text-gray-700 text-sm leading-relaxed">
                      "Would love Linear integration, not just Jira export"
                    </div>
                  </div>
                </div>
                <a
                  href="https://forms.gle/SUSxNsiB8V7qWQTn9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Share your feedback →
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Walk in with chaos. Walk out with clarity.
            </h2>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              No signup. No credit card. No demo request.
              <br />
              Just click, share, and start prioritizing in 60 seconds.
            </p>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleCTAClick}
              className="group !bg-blue-600 !text-white hover:!bg-blue-700 hover:shadow-md transition-all duration-200 !border-0 font-bold px-8 py-4 text-lg inline-flex items-center gap-2"
            >
              Start Free Session
              <svg
                className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={handleCTAClick} className="text-sm text-gray-400 hover:text-white transition-colors">
                    Start Session
                  </button>
                </li>
                <li>
                  <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:simantaparidaux@gmail.com" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Connect</h4>
              <div className="flex items-center gap-3">
                <a
                  href="https://twitter.com/uxworks_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="Twitter/X"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/uxworks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="mailto:simantaparidaux@gmail.com"
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="Email"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 pb-4">
            <p className="text-sm text-gray-500 text-center mb-12">
              © {new Date().getFullYear()} Woorkshop. All rights reserved.
            </p>

            <div className="w-full">
              <h2 className="font-comfortaa text-[60px] sm:text-[80px] md:text-[120px] lg:text-[160px] font-bold text-gray-700/40 leading-none tracking-[0.05em] sm:tracking-[0.1em] select-none text-center md:text-left">
                woorkshop
              </h2>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
