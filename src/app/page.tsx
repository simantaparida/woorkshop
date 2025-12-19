'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { RecognitionSection } from '@/components/landing/RecognitionSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { ValueProps } from '@/components/ValueProps';
import { BeforeAfterScenarios } from '@/components/landing/BeforeAfterScenarios';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pricing } from '@/components/Pricing';
import { TrustBuilder } from '@/components/landing/TrustBuilder';
import { APP_NAME, APP_DESCRIPTION, ROUTES } from '@/lib/constants';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

export default function HomePage() {
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [sessionCode, setSessionCode] = useState('');

  const handleStartGame = () => {
    trackEvent('start_game_clicked');
    router.push('/home');
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

      {/* Recognition Section - Scroll-driven sticky highlight */}
      <RecognitionSection />

      {/* Problem Section */}
      <ProblemSection />

      {/* Value Props Section */}
      <ValueProps />

      {/* Before/After Scenarios */}
      <BeforeAfterScenarios />

      {/* How It Works */}
      <HowItWorks />

      {/* Pricing Section */}
      <Pricing />

      {/* Trust Builder */}
      <TrustBuilder />

      {/* Final CTA Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Walk in with data. Walk out with alignment.
            </h2>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              No signup. No credit card. No demo request.
              <br />
              Just click, share, and start prioritizing in 60 seconds.
            </p>

            <div className="flex flex-col items-center gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push(ROUTES.LOGIN)}
                className="!bg-gray-900 !text-white hover:!bg-gray-800 hover:shadow-md transition-all duration-200 !border-0 font-bold px-8 py-4 text-lg"
              >
                Start Free Session
              </Button>
              <a
                href="#how-it-works"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                See how it works →
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <h3 className="font-comfortaa text-xl font-bold text-white mb-3 tracking-[0.1em]">woorkshop</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Turn team debates into clear priorities. Free during public review.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={handleStartGame} className="text-sm text-gray-400 hover:text-white transition-colors">
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
                  <a href="mailto:hello@uxworks.app" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} Woorkshop. All rights reserved.
            </p>
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
