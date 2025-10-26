'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/Navbar';
import { ROUTES } from '@/lib/constants';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

export default function FeaturesPage() {
  const router = useRouter();
  const { trackEvent } = useAnalytics();

  const handleCTAClick = () => {
    trackEvent('features_page_cta_clicked');
    router.push(ROUTES.CREATE);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Everything you need to align your team
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-gray-600 mb-4 leading-relaxed"
            >
              Padool gives you all the tools to prioritize features, align stakeholders, and make better decisions — without the complexity.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm text-gray-500 mb-8"
            >
              No credit card required · Start in 10 minutes
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
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

      {/* Feature Groups */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Create Sessions Effortlessly */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-24"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
                  <span className="text-2xl">✨</span>
                  <span className="text-sm font-medium text-blue-700">Quick Setup</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Create Sessions Effortlessly
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Get your prioritization workshop up and running in minutes, not hours.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">No signup required — just create and share a link</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Choose from ready-made templates or start from scratch</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Add rich context with descriptions, links, and categories</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Set session goals and timelines to keep everyone focused</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="h-4 bg-blue-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Collaborative Voting */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-24"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
                  <span className="text-2xl">👥</span>
                  <span className="text-sm font-medium text-purple-700">Team Collaboration</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Collaborative Voting
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Give everyone a voice and watch decisions emerge naturally from team input.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Real-time voting with instant updates as people join and vote</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">100-point allocation system that forces clear priorities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Add notes to explain your voting rationale</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Track progress as teammates submit their votes</span>
                  </li>
                </ul>
              </div>
              <div className="lg:order-1 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-purple-200"></div>
                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 bg-purple-100 rounded-lg border-l-4 border-purple-500"></div>
                    <div className="h-12 bg-purple-50 rounded-lg border-l-4 border-purple-400"></div>
                    <div className="h-12 bg-purple-100 rounded-lg border-l-4 border-purple-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Insightful Results */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-24"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 mb-6">
                  <span className="text-2xl">📊</span>
                  <span className="text-sm font-medium text-green-700">Visual Insights</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Insightful Results
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Move from opinions to data with clear visualizations and actionable insights.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Ranked priority lists with clear winners and outliers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Team alignment metrics showing consensus strength</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Role-based filtering to understand different perspectives</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Export to CSV for easy integration with your tools</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="h-6 bg-green-200 rounded w-2/3 mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-3 bg-green-500 rounded-l-full" style={{ width: '85%' }}></div>
                    <div className="h-3 bg-green-400 rounded-l-full" style={{ width: '65%' }}></div>
                    <div className="h-3 bg-green-300 rounded-l-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Works the Way You Work */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-24"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-6">
                  <span className="text-2xl">⚙️</span>
                  <span className="text-sm font-medium text-orange-700">Flexibility</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Works the Way You Work
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Adapt Padool to your team's workflow, not the other way around.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Multiple scoring modes: 100 points, RICE, MoSCoW, and more</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Synchronous or async — vote when it works for you</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Workshop mode with structured phases and timers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Assign roles to track voting patterns by team function</span>
                  </li>
                </ul>
              </div>
              <div className="lg:order-1 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 h-8 bg-orange-200 rounded"></div>
                    <div className="w-8 h-8 bg-orange-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-orange-100 rounded"></div>
                    <div className="h-3 bg-orange-100 rounded"></div>
                    <div className="h-3 bg-orange-100 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Secure by Design */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-24"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 mb-6">
                  <span className="text-2xl">🔒</span>
                  <span className="text-sm font-medium text-gray-700">Privacy First</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Secure by Design
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Your data stays yours. We don't track, mine, or monetize your decisions.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Sessions auto-expire after 24 hours for complete privacy</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">No tracking cookies, no analytics surveillance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Anonymous participation — no required account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Host controls for session deletion and management</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-8 border border-gray-200">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-300 rounded w-2/3 mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">🔒 Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
                <span className="text-2xl">🚀</span>
                <span className="text-sm font-medium text-indigo-700">On the Roadmap</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Coming Soon
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We're constantly adding new features based on what you need most.
              </p>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Session History & Archives</h3>
                  <p className="text-gray-600 text-sm">Save and revisit past prioritization sessions with full results.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Advanced Analytics</h3>
                  <p className="text-gray-600 text-sm">Team insights, voting patterns, and consensus trends over time.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Team Workspaces</h3>
                  <p className="text-gray-600 text-sm">Shared templates, saved configurations, and team branding.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Integrations</h3>
                  <p className="text-gray-600 text-sm">Connect with Notion, Jira, Linear, and your favorite tools.</p>
                </div>
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
              Ready to try Padool?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Create your first session in seconds. No credit card, no signup, no complications.
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
              Join teams making better decisions
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
