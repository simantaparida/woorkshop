'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
              <span className="text-2xl">👥</span>
              <span className="text-sm font-medium text-blue-700">For Product Teams</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Prioritize features with your team
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-4 leading-relaxed"
            >
              Replace endless debates with data-driven decisions. Get quantitative input from your entire team and align stakeholders on what to build next.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm text-gray-500 mb-8"
            >
              Sprint planning · Roadmap validation · Stakeholder alignment
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
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 mb-12">
              <div className="flex items-start gap-4">
                <div className="text-3xl">😫</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sprint planning taking too long?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Every sprint planning meeting feels like a battle. Engineering wants technical debt, Design wants user experience improvements, PMs want revenue features, and leadership wants everything done yesterday. Sound familiar?
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
              Replace debates with data
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Padool gives product teams a structured way to prioritize features based on collective team input, not just the loudest voice.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Faster decisions',
                description: 'Reduce sprint planning from hours to 15 minutes. Get everyone aligned on priorities in one structured session.'
              },
              {
                icon: '📊',
                title: 'Data-driven insights',
                description: 'See exactly which features matter most to your team. No more guessing or assumption-based planning.'
              },
              {
                icon: '🤝',
                title: 'Stakeholder buy-in',
                description: 'Everyone has a voice and can see why certain features ranked higher. Alignment happens naturally.'
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-lg transition-shadow"
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
              Perfect for these scenarios
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Sprint Planning',
                description: 'Before starting a sprint, run a 10-minute session with your team. Everyone allocates points to features in the backlog. Get ranked priorities based on collective input, not just your gut feeling.',
                checklist: [
                  'Create session with sprint backlog features',
                  'Invite engineering, design, and PM',
                  'Everyone votes in 5 minutes',
                  'See ranked priorities with results'
                ]
              },
              {
                title: 'Roadmap Validation',
                description: 'Got a proposed roadmap but need to validate it with stakeholders? Let your team vote on proposed features. The data will show you what resonates and what needs adjustment.',
                checklist: [
                  'Share proposed roadmap features',
                  'Each stakeholder votes based on their perspective',
                  'Discover alignment gaps early',
                  'Adjust roadmap based on results'
                ]
              },
              {
                title: 'Stakeholder Alignment',
                description: 'When different departments have conflicting priorities, give everyone equal voting power. The ranked results create a neutral starting point for discussion.',
                checklist: [
                  'Include cross-functional stakeholders',
                  'Use role-based voting for insights',
                  'See how different functions prioritize',
                  'Use results to facilitate discussion'
                ]
              },
              {
                title: 'Feature Requests',
                description: 'Got dozens of feature requests from customers or sales? Instead of choosing arbitrarily, let your product team vote on what to tackle first.',
                checklist: [
                  'Import feature requests from sources',
                  'Add context and customer value',
                  'Team votes on prioritization',
                  'Build top-ranked features first'
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
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              "Padool turned our sprint planning into a 15-minute ritual. Instead of 2-hour meetings where everyone argues, we now get aligned priorities in minutes. The data makes it much easier to say no to stakeholders."
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
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">{APP_NAME}</h3>
              <p className="text-sm leading-relaxed">
                A lightweight prioritization workshop for product and UX teams.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href={ROUTES.FEATURES} className="hover:text-white transition-colors">Features</a></li>
                <li><a href={ROUTES.CREATE} className="hover:text-white transition-colors">Start session</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><a href="https://twitter.com/uxworks_app" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:hello@uxworks.app" className="hover:text-white transition-colors">hello@uxworks.app</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm mb-4 sm:mb-0">
              © {new Date().getFullYear()} UX Works. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
