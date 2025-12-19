'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-12">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block"
            >
              ← Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Woorkshop ("Service"), you agree to be bound by these Terms of Service ("Terms").
                If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Woorkshop is a collaborative prioritization and workshop facilitation platform that enables teams to
                conduct voting sessions, problem framing exercises, and interactive workshops. The Service provides
                tools for real-time collaboration, data collection, and decision-making.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                When you create an account with us, you must provide accurate, complete, and current information.
                Failure to do so constitutes a breach of the Terms, which may result in immediate termination of
                your account.
              </p>
              <p className="text-gray-700 mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Safeguarding your account password</li>
                <li>Any activities or actions under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-700 mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Content</h2>
              <p className="text-gray-700 mb-4">
                You retain all rights to any content you submit, post, or display on or through the Service ("User Content").
                By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce,
                and display such content for the purpose of providing and improving the Service.
              </p>
              <p className="text-gray-700 mb-4">
                You represent and warrant that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>You own or have the necessary rights to the User Content</li>
                <li>Your User Content does not violate any third-party rights</li>
                <li>Your User Content complies with these Terms and applicable laws</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The Service and its original content (excluding User Content), features, and functionality are and will
                remain the exclusive property of Woorkshop and its licensors. The Service is protected by copyright,
                trademark, and other laws. Our trademarks may not be used without our prior written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason,
                including if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
              <p className="text-gray-700 mb-4">
                You may terminate your account at any time by contacting us at{' '}
                <a href="mailto:simantaparidaux@gmail.com" className="text-blue-600 hover:text-blue-700">
                  simantaparidaux@gmail.com
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall Woorkshop, nor its directors, employees, partners, agents, suppliers, or affiliates,
                be liable for any indirect, incidental, special, consequential, or punitive damages, including without
                limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties
                of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability,
                fitness for a particular purpose, non-infringement, or course of performance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed and construed in accordance with applicable laws, without regard to its
                conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be
                considered a waiver of those rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision
                is material, we will try to provide at least 30 days notice prior to any new terms taking effect. What
                constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:simantaparidaux@gmail.com" className="text-blue-600 hover:text-blue-700">
                    simantaparidaux@gmail.com
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong>Website:</strong>{' '}
                  <Link href="/" className="text-blue-600 hover:text-blue-700">
                    woorkshop.com
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Woorkshop. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm hover:text-white transition-colors">
                Terms of Service
              </Link>
              <a href="mailto:simantaparidaux@gmail.com" className="text-sm hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
