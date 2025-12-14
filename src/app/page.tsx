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

      {/* Value Props Section */}
      <ValueProps />

      {/* Pricing Section */}
      <Pricing />

      {/* Final CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
              Stop guessing. Start prioritizing.
            </h2>

            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join product teams using Woorkshop to build the right things.
              <span className="text-white font-medium"> Completely free</span> during our public review period.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push(ROUTES.LOGIN)}
                className="!bg-white !text-blue-600 hover:!bg-blue-50 hover:-translate-y-1 transition-all duration-200 !border-0 font-bold shadow-lg"
              >
                Launch a Session
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => window.open('https://twitter.com/uxworks_app', '_blank')}
                className="!bg-transparent !text-white !border-2 !border-white hover:!bg-white hover:!text-blue-600 transition-all duration-200 font-semibold !shadow-none"
              >
                Follow Updates
              </Button>
            </div>

            <p className="text-sm text-blue-200 mt-8 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No signup required to start
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
                  href="mailto:hello@uxworks.app"
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
                  <button onClick={handleStartGame} className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
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
                  <a href="mailto:hello@uxworks.app" className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group">
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
                <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Cookie Policy</a>
              </div>
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
