'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6"
            >
              <span className="text-2xl">🚀</span>
              <span className="text-sm font-medium text-blue-700">For High-Velocity Product Teams</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Stop Debating. <span className="text-blue-600">Start Shipping.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-4 leading-relaxed"
            >
              Turn 2-hour sprint planning into 15-minute alignment sessions. Use <span className="font-semibold text-gray-900">RICE</span>, <span className="font-semibold text-gray-900">MoSCoW</span>, or <span className="font-semibold text-gray-900">100-Point</span> frameworks to make gut feelings irrelevant and ship what actually matters.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm text-gray-500 mb-8"
            >
              Real-time Collaboration · No Signup Required · Export to Jira/CSV
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
                className="text-lg px-8 py-4 !bg-blue-600 !text-white hover:!bg-blue-700 !border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Start Free Session
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-8 mb-12 shadow-md">
              <div className="flex items-start gap-4">
                <div className="text-4xl">⚠️</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">The Real Problem Isn't Your Backlog</h3>
                  <p className="text-gray-700 leading-relaxed">
                    It's consensus. Sales wants features that close deals. Support wants bugs squashed. The CEO has "one more thing." Everyone thinks their priority is THE priority. Without a framework, roadmaps become political battlegrounds where the loudest voice wins—not the best idea.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Stop Guessing, Start Scoring
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right tool for the job. Whether it's a quick vote or a detailed scoring session, Woorkshop aligns your team in real-time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Pick Your Framework',
                description: 'RICE for strategic depth. MoSCoW for scope management. 100-Point for budget simulation. Switch frameworks depending on the decision you need to make.'
              },
              {
                icon: '🎯',
                title: 'Kill the HiPPO',
                description: 'Highest Paid Person\'s Opinion shouldn\'t win by default. Blind voting surfaces true team priorities before politics enter the room.'
              },
              {
                icon: '📊',
                title: 'Export to Your Tools',
                description: 'Ranked priorities go straight to CSV for Jira, Linear, or Notion. No copy-paste busywork. From decision to backlog in one click.'
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-300 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-4xl mb-6 bg-gradient-to-br from-blue-50 to-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
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
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
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

      {/* Building in Public - Feedback Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Building in Public
            </h2>
            <p className="text-gray-600">
              Real usage data. Unfiltered feedback. Help us get it right.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-md"
          >
            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">127</div>
                <div className="text-xs md:text-sm font-semibold text-gray-900 mb-1">Sessions run</div>
                <div className="text-[10px] md:text-xs text-gray-600">In the last 30 days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">2,847</div>
                <div className="text-xs md:text-sm font-semibold text-gray-900 mb-1">Votes cast</div>
                <div className="text-[10px] md:text-xs text-gray-600">Real teams making real decisions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">9.3 min</div>
                <div className="text-xs md:text-sm font-semibold text-gray-900 mb-1">Avg session time</div>
                <div className="text-[10px] md:text-xs text-gray-600">We said 10 minutes. We meant it.</div>
              </div>
            </div>

            {/* What Product Teams Are Saying */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">What product teams are saying</h3>
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
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
              >
                Share your feedback
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Walk in with chaos. Walk out with clarity.
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Create your first session in 60 seconds. No credit card, no signup, no demo request.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCTAClick}
              className="text-lg px-10 py-4 bg-white text-blue-600 hover:bg-gray-50 shadow-lg hover:shadow-xl"
            >
              Start Free Session
            </Button>
            <p className="text-sm text-blue-100 mt-6">
              Join product teams making better decisions
            </p>
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
