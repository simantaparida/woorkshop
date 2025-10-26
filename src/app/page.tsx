'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ValueProps } from '@/components/ValueProps';
import { SocialProof } from '@/components/SocialProof';
import { Pricing } from '@/components/Pricing';
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
      {/* New Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Value Props Section */}
      <ValueProps />

      {/* Social Proof Section */}
      <SocialProof />

      {/* Pricing Section */}
      <Pricing />

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
