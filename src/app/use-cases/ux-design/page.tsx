'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/Navbar';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

export default function UXDesignPage() {
  const router = useRouter();
  const { trackEvent } = useAnalytics();

  const handleCTAClick = () => {
    trackEvent('ux_design_cta_clicked');
    router.push(ROUTES.CREATE);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6"
            >
              <span className="text-2xl">🎨</span>
              <span className="text-sm font-medium text-purple-700">For UX & Design Teams</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Design What Matters. <span className="text-purple-600">Not What's Loud.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-4 leading-relaxed"
            >
              Stop debating which design task to tackle first. Use <span className="font-semibold text-gray-900">100-Point Voting</span>, <span className="font-semibold text-gray-900">RICE</span>, or <span className="font-semibold text-gray-900">MoSCoW</span> to align your team on user impact—before you open Figma.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm text-gray-500 mb-8"
            >
              Real-time Collaboration · No Signup Required · Export to CSV
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={handleCTAClick}
                className="text-lg px-8 py-4"
              >
                Start Free Session
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚠️</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Design Backlog Is a Mess. So Is Everyone Else's.</h3>
                  <p className="text-gray-700 leading-relaxed">
                    User research requests, design system updates, accessibility fixes, prototype revisions—everything feels urgent. Instead of designing, you're stuck in Slack threads debating priorities. Woorkshop cuts that down to 10 minutes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⏱️',
                title: 'Stop Debating. Start Designing.',
                description: '10-minute voting sessions replace hour-long Slack threads. Your team gets aligned without burning half the sprint on "what should we work on?"'
              },
              {
                icon: '🎯',
                title: 'Design for Impact, Not Politics',
                description: 'Stop prioritizing the loudest stakeholder request. Use frameworks like RICE or MoSCoW to score design tasks on actual user impact.'
              },
              {
                icon: '📊',
                title: 'Export to Your Workflow',
                description: 'Download results as CSV and import straight into Figma, Notion, or Jira. No manual data entry, no lost context.'
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Use It For
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Design Sprint Kickoffs',
                description: 'Stop wasting the first hour of your sprint debating what to design. Run a 10-minute voting session and start designing what actually matters.',
                checklist: [
                  'Add design tasks, research questions, prototypes',
                  'Team votes on user impact vs. effort',
                  'Export ranked list to Figma or FigJam',
                  'Sprint starts with clarity, not arguments'
                ]
              },
              {
                title: 'User Research Triage',
                description: 'You have 20 research questions and bandwidth for 3. Which ones actually move the needle? Let your team vote and find out.',
                checklist: [
                  'List research questions from stakeholders',
                  'Score by learning value and feasibility',
                  'Vote in 10 minutes, async or live',
                  'Focus research time on what matters'
                ]
              },
              {
                title: 'Design System Roadmaps',
                description: 'Building a design system? Prioritize components based on usage, impact, and team consensus—not whoever yells loudest.',
                checklist: [
                  'Add components, tokens, patterns to backlog',
                  'Score by usage frequency and UX impact',
                  'Design and eng teams vote together',
                  'Build what teams actually need first'
                ]
              },
              {
                title: 'UX Debt Cleanup',
                description: 'Accessibility fixes, usability tweaks, visual polish—your UX backlog is infinite. Prioritize fixes that improve metrics or unblock conversions.',
                checklist: [
                  'List UX issues, bugs, polish tasks',
                  'Add impact estimates and effort scores',
                  'Team votes on what to tackle first',
                  'Fix what breaks the experience, not what looks bad in dark mode'
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
                <ul className="space-y-2">
                  {useCase.checklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Building in Public Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Building in Public
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're validating product-market fit. If design teams don't find this useful, we want to know now.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                metric: '1,200+',
                label: 'Design Sessions Run',
                icon: '🎨'
              },
              {
                metric: '4,500+',
                label: 'Designers Collaborating',
                icon: '👥'
              },
              {
                metric: '15min',
                label: 'Average Session Length',
                icon: '⏱️'
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 text-center"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.metric}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Free While We Figure This Out
            </h2>
            <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
              No credit card. No signup. Just create a session, vote, and export your results. If it doesn't help your design team prioritize better, we want to hear about it.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCTAClick}
              className="text-lg px-10 py-4 bg-white text-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl"
            >
              Start Free Session
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={handleCTAClick} className="text-sm text-gray-400 hover:text-white transition-colors">
                    Start Session
                  </button>
                </li>
                <li>
                  <Link href={ROUTES.FEATURES} className="text-sm text-gray-400 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
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

            {/* Connect */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Connect</h4>
              <div className="flex items-center gap-3">
                <a
                  href="https://twitter.com/uxworks_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
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
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="mailto:simantaparidaux@gmail.com"
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-purple-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="Email"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 pb-4">
            <p className="text-sm text-gray-500 text-center mb-12">
              © {new Date().getFullYear()} Woorkshop. All rights reserved.
            </p>

            {/* Large Woorkshop Logo */}
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
