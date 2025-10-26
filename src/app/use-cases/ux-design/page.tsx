'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6"
            >
              <span className="text-2xl">🎨</span>
              <span className="text-sm font-medium text-purple-700">For UX Teams</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Align on design priorities
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-4 leading-relaxed"
            >
              Get your design team aligned on what to tackle next. Prioritize user research, design improvements, and UX initiatives based on collective input and user impact.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm text-gray-500 mb-8"
            >
              Design sprints · User research · UX improvements · Design system work
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
                <div className="text-3xl">🤔</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Too many design initiatives, not enough time?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Your design backlog is overflowing. User research requests, design system improvements, accessibility fixes, and new feature designs all compete for attention. How do you decide what to tackle first?
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
              Focus on what matters most
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Padool helps UX teams prioritize design work based on user impact, team capacity, and strategic alignment.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'User-focused priorities',
                description: 'Prioritize design work that has the biggest impact on user experience. Let data guide your design decisions.'
              },
              {
                icon: '⚡',
                title: 'Faster design sprints',
                description: 'Start each design sprint with clear priorities. No more endless discussions about what to work on next.'
              },
              {
                icon: '🤝',
                title: 'Cross-team alignment',
                description: 'Get product, engineering, and design aligned on UX priorities. Everyone understands the design roadmap.'
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
              Perfect for these design scenarios
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Design Sprint Planning',
                description: 'Before starting a design sprint, prioritize user research questions, design improvements, and new features. Get your team aligned on what to tackle first.',
                checklist: [
                  'List all design initiatives and research questions',
                  'Include user impact and effort estimates',
                  'Team votes on priorities in 10 minutes',
                  'Start sprint with ranked design tasks'
                ]
              },
              {
                title: 'User Research Prioritization',
                description: 'Got dozens of user research questions? Let your team vote on which research will have the biggest impact on product decisions.',
                checklist: [
                  'Compile research questions from stakeholders',
                  'Add context about user segments and business impact',
                  'Design team votes on research priorities',
                  'Plan research roadmap based on results'
                ]
              },
              {
                title: 'Design System Roadmap',
                description: 'Building or improving your design system? Prioritize components, patterns, and improvements based on team needs and user impact.',
                checklist: [
                  'List design system components and improvements',
                  'Include usage frequency and user impact data',
                  'Design and engineering teams vote together',
                  'Build components in priority order'
                ]
              },
              {
                title: 'UX Improvement Backlog',
                description: 'Identify usability issues and UX improvements across your product. Prioritize fixes based on user impact and implementation effort.',
                checklist: [
                  'Document usability issues and improvement ideas',
                  'Add user impact scores and effort estimates',
                  'Cross-functional team votes on priorities',
                  'Tackle highest-impact improvements first'
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

      {/* Design Process Section */}
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
              Integrate with your design process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Padool fits seamlessly into existing UX workflows and design methodologies.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Design Thinking',
                description: 'Use Padool in the "Define" phase to prioritize which user problems to solve first. Get stakeholder alignment before ideation.',
                icon: '💡'
              },
              {
                title: 'Design Sprints',
                description: 'Start each sprint with a quick prioritization session. Focus your team on the most impactful design challenges.',
                icon: '🏃‍♀️'
              },
              {
                title: 'Lean UX',
                description: 'Prioritize experiments and user research based on learning potential and business impact. Build-measure-learn with focus.',
                icon: '🔄'
              }
            ].map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl mb-4">{method.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{method.title}</h3>
                <p className="text-gray-600 leading-relaxed">{method.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-12 border border-purple-100"
          >
            <div className="flex items-center gap-2 text-4xl mb-6">⭐⭐⭐⭐⭐</div>
            <blockquote className="text-2xl font-medium text-gray-900 mb-6 leading-relaxed">
              "As a UX designer, I was constantly pulled in different directions. Padool helped our team focus on user impact over everything else. Now we start each design sprint with clear priorities and stakeholder buy-in."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                UX
              </div>
              <div>
                <div className="font-semibold text-gray-900">UX Designer</div>
                <div className="text-gray-600">Fintech startup</div>
              </div>
            </div>
          </motion.div>
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
              Ready to focus your design work?
            </h2>
            <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
              Create your first UX prioritization session in seconds. No credit card, no signup, no complications.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCTAClick}
              className="text-lg px-10 py-4 bg-white text-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl"
            >
              Start Free Session
            </Button>
            <p className="text-sm text-purple-100 mt-6">
              Join UX teams making better design decisions
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
