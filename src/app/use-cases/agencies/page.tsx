'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/Navbar';
import { ROUTES } from '@/lib/constants';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

export default function AgenciesPage() {
  const router = useRouter();
  const { trackEvent } = useAnalytics();

  const handleCTAClick = () => {
    trackEvent('agencies_page_cta_clicked');
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
              <span className="text-sm font-medium text-purple-700">For Agencies & Consultancies</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Run Client Workshops That <span className="text-purple-600">Actually Work.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-4 leading-relaxed"
            >
              Turn messy stakeholder sessions into structured decisions. Use proven frameworks like <span className="font-semibold text-gray-900">RICE</span>, <span className="font-semibold text-gray-900">MoSCoW</span>, or <span className="font-semibold text-gray-900">100-Point Voting</span> to align clients fast and deliver prioritization workshops that justify your retainer.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm text-gray-500 mb-8"
            >
              Real-time Collaboration · Client-Ready Reports · Export to CSV
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
                className="text-lg px-8 py-4 !bg-purple-600 !text-white hover:!bg-purple-700 !border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Start Free Workshop
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Workshops Shouldn't Feel Like Hostage Negotiations</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You block off 2 hours. Stakeholders argue in circles. The CEO overrules everyone. The CMO checks email. You leave with vague "alignment" and no clear next steps. Then you spend another 3 hours writing a summary deck to justify what just happened. There's a better way.
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Why Agencies Choose Woorkshop
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stop improvising. Use battle-tested frameworks that make you look like the strategic partner you are.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Make Clients Feel Heard',
                description: 'Blind voting means every stakeholder\'s opinion counts equally. The intern and the CEO get the same vote. Data settles disputes, not politics.'
              },
              {
                icon: '⚡',
                title: 'Run Efficient Workshops',
                description: 'Stop burning billable hours on circular debates. Structured frameworks turn 2-hour meetings into 20-minute alignment sessions with clear outcomes.'
              },
              {
                icon: '📊',
                title: 'Deliver Credible Reports',
                description: 'Export ranked priorities with voting data. Show clients exactly how decisions were made. No more "trust us" handwaving—just transparent, defensible results.'
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-300 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-4xl mb-6 bg-gradient-to-br from-purple-50 to-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">{benefit.icon}</div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Real Agency Scenarios
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From discovery to delivery, Woorkshop helps you facilitate client workshops that close deals and move projects forward.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Discovery Workshop Kickoffs',
                description: 'Start new client engagements with a structured prioritization session. Align stakeholders on scope, define MVP features, and set clear expectations—all before you write a single line of code or design a single screen.',
                checklist: [
                  'Facilitate anonymous idea submission to surface all perspectives',
                  'Use 100-Point Voting to force trade-offs on scope',
                  'Export prioritized feature list as project roadmap',
                  'Show clients data-backed decisions, not gut feelings'
                ]
              },
              {
                title: 'Scope Creep Management',
                description: 'Client wants to add "just one more thing"? Run a quick MoSCoW session. Show them what moves to "Won\'t Have" if the new feature becomes a "Must Have." Let the framework deliver the bad news.',
                checklist: [
                  'Categorize existing scope as Must/Should/Could/Won\'t',
                  'Visualize impact of new requests on timeline',
                  'Let stakeholders vote on trade-offs in real-time',
                  'Export updated scope doc with client consensus baked in'
                ]
              },
              {
                title: 'Quarterly Strategy Sessions',
                description: 'Retainer clients need ongoing strategic input. Use RICE scoring to evaluate new initiatives against Reach, Impact, Confidence, and Effort. Show them which bets are worth taking—and which aren\'t.',
                checklist: [
                  'Score initiatives across 4 dimensions with stakeholder input',
                  'Calculate priority scores automatically (no spreadsheet math)',
                  'Rank initiatives by ROI potential, not who yelled loudest',
                  'Export strategic roadmap directly to project management tools'
                ]
              },
              {
                title: 'Stakeholder Alignment Workshops',
                description: 'Multiple departments, conflicting priorities, limited budget. Run a collaborative voting session where everyone allocates points to what they value. Watch consensus emerge from chaos in 15 minutes.',
                checklist: [
                  'Give each stakeholder 100 budget points to allocate',
                  'See aggregate priorities ranked by total votes',
                  'Identify areas of consensus vs. disagreement instantly',
                  'Walk out with a prioritized backlog everyone agreed to'
                ]
              }
            ].map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{useCase.description}</p>
                <ul className="space-y-3">
                  {useCase.checklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm">{item}</span>
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
                <div className="text-[10px] md:text-xs text-gray-600">Fast enough to stay billable</div>
              </div>
            </div>

            {/* What Agencies Are Saying */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">What agencies are saying</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-purple-600 font-bold">•</div>
                  <div className="text-gray-700 text-sm leading-relaxed">
                    "Clients love seeing their input turn into data. Makes us look way more strategic."
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-purple-600 font-bold">•</div>
                  <div className="text-gray-700 text-sm leading-relaxed">
                    "We use this in every discovery workshop now. Cuts alignment time in half."
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-purple-600 font-bold">•</div>
                  <div className="text-gray-700 text-sm leading-relaxed">
                    "Would pay for white-label reports and branded export options"
                  </div>
                </div>
              </div>
              <a
                href="https://forms.gle/SUSxNsiB8V7qWQTn9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-purple-600 hover:text-purple-700 hover:underline inline-flex items-center gap-1"
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
      <section className="py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Stop winging it. Start facilitating.
            </h2>
            <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
              Run your first client workshop in 60 seconds. No signup, no credit card, no learning curve.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCTAClick}
              className="text-lg px-10 py-4 bg-white text-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl"
            >
              Start Free Workshop
            </Button>
            <p className="text-sm text-purple-100 mt-6">
              Join agencies running better client workshops
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
