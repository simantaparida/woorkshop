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
      <section className="relative pt-24 pb-16 overflow-hidden">
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
              Build the Right Thing, <span className="text-blue-600">Together</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-4 leading-relaxed"
            >
              Align your product strategy with collective intelligence. Use frameworks like <span className="font-semibold text-gray-900">RICE</span>, <span className="font-semibold text-gray-900">MoSCoW</span>, or <span className="font-semibold text-gray-900">100-Point Voting</span> to turn opinions into data-backed priorities in minutes.
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
                className="text-lg px-8 py-4 shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/50 transition-all"
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
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-8 mb-12 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🤯</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Drowning in Feature Requests?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Your backlog is growing faster than your capacity. Sales wants one thing, Support wants another, and the CEO has a "great idea." Without a structured framework, prioritization becomes a battle of opinions, not value. You need a way to quantify impact and clear the noise.
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
                title: 'Framework Flexibility',
                description: 'Switch between RICE (Reach, Impact, Confidence, Effort) for strategic depth, MoSCoW for requirements, or 100-Point Method for quick budgeting.'
              },
              {
                icon: '🎯',
                title: 'Democratized Input',
                description: 'Give every team member a voice with unbiased voting. Avoid "HiPPO" (Highest Paid Person\'s Opinion) influence and uncover your team\'s true priorities.'
              },
              {
                icon: '📊',
                title: 'Actionable Artifacts',
                description: 'Don\'t just end the meeting. Export your ranked priorities directly to CSV for Jira or Notion. Move seamlessly from decision to execution.'
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg shadow-blue-50/50 hover:shadow-xl hover:shadow-blue-100/50 transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-6 bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gray-50">
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

      {/* Testimonial */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 border border-blue-100"
          >
            <div className="flex items-center gap-2 text-4xl mb-6">⭐⭐⭐⭐⭐</div>
            <blockquote className="text-2xl font-medium text-gray-900 mb-6 leading-relaxed">
              "Woorkshop turned our sprint planning into a 15-minute ritual. Instead of 2-hour meetings where everyone argues, we now get aligned priorities in minutes. The data makes it much easier to say no to stakeholders."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                PM
              </div>
              <div>
                <div className="font-semibold text-gray-900">Product Manager</div>
                <div className="text-gray-600">Early-stage SaaS team</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to streamline your sprint planning?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Create your first prioritization session in seconds. No credit card, no signup, no complications.
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
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-400 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-16 grid grid-cols-2 md:grid-cols-12 gap-8">
            {/* Brand Section - Takes more space */}
            <div className="col-span-2 md:col-span-4">
              <div className="mb-6">
                <h3 className="font-comfortaa text-2xl font-bold text-blue-400 mb-3 tracking-[0.1em]">woorkshop</h3>
                <p className="text-gray-400 leading-relaxed text-sm max-w-xs">
                  Turn team debates into clear priorities. No signup required, completely free during public review.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://twitter.com/uxworks_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="GitHub"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
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

            {/* Product Links */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-0.5 transition-transform">Features</span>
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-0.5 transition-transform">Pricing</span>
                  </a>
                </li>
                <li>
                  <button onClick={handleCTAClick} className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-0.5 transition-transform">Start Session</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Use Cases */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Use Cases</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/use-cases/product-teams" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-0.5 transition-transform">Product Teams</span>
                  </a>
                </li>
                <li>
                  <a href="/use-cases/ux-design" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-0.5 transition-transform">UX Design</span>
                  </a>
                </li>
                <li>
                  <a href="/use-cases/startups" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-0.5 transition-transform">Startups</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/features" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-0.5 transition-transform">All Features</span>
                  </a>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-0.5 transition-transform">GitHub</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-0.5 transition-transform">Documentation</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-0.5 transition-transform">About</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:simantaparidaux@gmail.com" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-0.5 transition-transform">Contact</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
                    <span className="group-hover:translate-x-0.5 transition-transform">Careers</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} <span className="text-gray-400 font-medium">Woorkshop</span>. All rights reserved.
              </p>

              <div className="flex items-center gap-6">
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
