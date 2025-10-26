'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { APP_NAME, APP_DESCRIPTION, ROUTES } from '@/lib/constants';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

export default function HomePage() {
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [sessionCode, setSessionCode] = useState('');

  const handleStartGame = () => {
    trackEvent('start_game_clicked');
    router.push(ROUTES.CREATE);
  };

  const handleJoinSession = () => {
    if (sessionCode.trim()) {
      router.push(`/session/${sessionCode.trim()}/lobby`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation - Notion Style */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="font-semibold text-lg text-gray-900">UX Works</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                How it works
              </a>
              <a href="mailto:hello@uxworks.app" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowJoinModal(true)}
                className="hidden sm:flex"
              >
                Join Session
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartGame}
                className="shadow-sm"
              >
                Start New Session
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Notion Style */}
      <section className="relative overflow-hidden bg-white pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Illustrated Characters Row */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-2 mb-10"
            >
              {/* Character avatars - simplified emoji style */}
              <div className="flex -space-x-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-2xl">
                  📊
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-100 border-2 border-white flex items-center justify-center text-2xl">
                  💡
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <div className="w-12 h-12 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center text-2xl">
                  👥
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-2xl">
                  ✨
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-2xl">
                  🚀
                </div>
              </div>
            </motion.div>

            {/* Main Headline - Notion Style */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight"
            >
              Your team's priorities.
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Aligned. Together.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10"
            >
              One prioritization workspace where teams decide what to build,
              <br className="hidden sm:block" />
              align on priorities, and get back to shipping.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartGame}
                className="text-lg px-10 py-4 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                Start free session
              </Button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-10 py-4 text-gray-700 hover:text-gray-900 font-medium transition-colors w-full sm:w-auto"
              >
                See how it works
              </button>
            </motion.div>

            {/* Trust Badge */}
            <motion.p
              variants={itemVariants}
              className="text-sm text-gray-500"
            >
              No signup required • Free forever • Takes 10 minutes
            </motion.p>
          </motion.div>

        </div>

        {/* Trust Badges Section - Below Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 border-t border-gray-200 pt-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500 mb-8">
              Trusted by product teams who ship fast
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-50">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-2xl">🚀</span>
                <span className="font-semibold text-sm">Startups</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-2xl">🎨</span>
                <span className="font-semibold text-sm">Design Teams</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-2xl">💼</span>
                <span className="font-semibold text-sm">Product Teams</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-2xl">🌍</span>
                <span className="font-semibold text-sm">Remote Teams</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to align your team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for product managers, UX designers, and teams who want to prioritize features quickly
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Simple Setup',
                desc: 'Create a session in seconds. Add your features, set a context, and share the link — no accounts, no friction.'
              },
              {
                icon: '⚡',
                title: 'Real-time Voting',
                desc: 'Each participant allocates 100 points across features. Watch results update live as your team votes.'
              },
              {
                icon: '📊',
                title: 'Instant Results',
                desc: 'See ranked priorities with visual charts. Export results as CSV for your sprint planning.'
              },
              {
                icon: '👥',
                title: 'Collaborative',
                desc: 'Share a simple link. No login required for participants. Everyone can vote at the same time.'
              },
              {
                icon: '🔒',
                title: 'Privacy First',
                desc: 'Sessions expire after 24 hours. No tracking, no data mining — just your team and your decisions.'
              },
              {
                icon: '🚀',
                title: 'Lightning Fast',
                desc: 'Built with Next.js and Supabase. Real-time updates, smooth animations, zero lag.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
                }}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300"
              >
                <motion.div
                  className="text-5xl mb-4"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="font-semibold text-xl mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Run a prioritization workshop in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Create & Share',
                desc: 'Set up a new session, add features to vote on, and share the link with your team. No signup required.'
              },
              {
                step: '2',
                title: 'Vote Together',
                desc: 'Each participant allocates 100 points across features based on priority. See votes update in real-time.'
              },
              {
                step: '3',
                title: 'View Results',
                desc: 'Review ranked features with charts and statistics. Export as CSV and use in your planning docs.'
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="text-center"
              >
                <motion.div
                  className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {step.step}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Visual Flow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-4 bg-white px-8 py-4 rounded-full border border-gray-200 shadow-sm">
              <span className="text-sm font-medium text-gray-700">Setup</span>
              <span className="text-gray-400">→</span>
              <span className="text-sm font-medium text-gray-700">Vote</span>
              <span className="text-gray-400">→</span>
              <span className="text-sm font-medium text-gray-700">Decide</span>
              <span className="text-gray-400">→</span>
              <span className="text-sm font-medium text-primary">Build</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof / Use Cases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Perfect for teams who move fast
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you're planning a sprint or validating a roadmap
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Product Teams',
                emoji: '🎯',
                desc: 'Align stakeholders on feature priorities before sprint planning. Get quantitative input instead of endless debates.',
                benefits: ['Sprint planning', 'Roadmap validation', 'Stakeholder alignment']
              },
              {
                title: 'UX Designers',
                emoji: '✨',
                desc: 'Run quick prioritization workshops with users or teammates. Gather data on which features matter most.',
                benefits: ['User research', 'Design sprints', 'Feature discovery']
              },
              {
                title: 'Startup Founders',
                emoji: '🚀',
                desc: 'Decide what to build next with your team. Move from opinions to data-driven decisions in minutes.',
                benefits: ['MVP planning', 'Team alignment', 'Fast iteration']
              },
              {
                title: 'Remote Teams',
                emoji: '🌍',
                desc: 'Run async prioritization across time zones. Everyone votes when convenient, results update in real-time.',
                benefits: ['Async-friendly', 'Time zone flexible', 'No meetings required']
              }
            ].map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{useCase.emoji}</span>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {useCase.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {useCase.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {useCase.benefits.map((benefit) => (
                    <span
                      key={benefit}
                      className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">
              Ready to align your team?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Create your first prioritization session in seconds. No credit card, no signup, no BS.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleStartGame}
              className="text-xl px-12 py-4 bg-white text-primary hover:bg-gray-50 shadow-lg hover:shadow-xl"
            >
              Start Free Session →
            </Button>
            <p className="text-sm text-blue-100 mt-6">
              Join teams who've made better decisions in less time
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
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                <li><button onClick={handleStartGame} className="hover:text-white transition-colors">Start session</button></li>
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

      {/* Join Session Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Join Session
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Enter the session code shared by your host to join the prioritization workshop.
                  </p>
                  <Input
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                    placeholder="Enter session code"
                    className="mb-4"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && sessionCode.trim()) {
                        handleJoinSession();
                      }
                    }}
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowJoinModal(false);
                        setSessionCode('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleJoinSession}
                      disabled={!sessionCode.trim()}
                      className="flex-1"
                    >
                      Join Session
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
