'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 mb-4">
                At Woorkshop ("we", "us", or "our"), we respect your privacy and are committed to protecting your
                personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our collaborative prioritization and workshop facilitation platform.
              </p>
              <p className="text-gray-700 mb-4">
                Please read this Privacy Policy carefully. By using Woorkshop, you agree to the collection and use of
                information in accordance with this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Information You Provide</h3>
              <p className="text-gray-700 mb-4">
                We collect information that you voluntarily provide when using our Service:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
                <li><strong>Profile Information:</strong> Optional profile details you choose to add</li>
                <li><strong>Workshop Content:</strong> Data you create during sessions, including votes, comments, and decisions</li>
                <li><strong>Communications:</strong> Messages you send to us or through the Service</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 Information Automatically Collected</h3>
              <p className="text-gray-700 mb-4">
                When you access our Service, we automatically collect certain information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, and interaction patterns</li>
                <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
                <li><strong>Cookies and Tracking:</strong> Session data and preferences (see Cookie Policy below)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the collected information for various purposes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Service Delivery:</strong> To provide, maintain, and improve the Service</li>
                <li><strong>Account Management:</strong> To create and manage your account</li>
                <li><strong>Communication:</strong> To send updates, security alerts, and support messages</li>
                <li><strong>Analytics:</strong> To understand usage patterns and improve user experience</li>
                <li><strong>Security:</strong> To detect, prevent, and address technical issues and fraud</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 With Your Consent</h3>
              <p className="text-gray-700 mb-4">
                We share information when you give us explicit permission to do so.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Service Providers</h3>
              <p className="text-gray-700 mb-4">
                We may employ third-party companies to facilitate our Service, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Cloud hosting providers (for infrastructure)</li>
                <li>Authentication services (for secure login)</li>
                <li>Analytics providers (for usage insights)</li>
                <li>Email service providers (for communications)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">
                We may disclose your information if required by law or in response to valid requests by public authorities.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 Business Transfers</h3>
              <p className="text-gray-700 mb-4">
                If we are involved in a merger, acquisition, or asset sale, your information may be transferred.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal information on a need-to-know basis</li>
              </ul>
              <p className="text-gray-700 mb-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive
                to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this
                Privacy Policy. We will retain and use your information to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Enforce our agreements</li>
                <li>Provide ongoing services you've requested</li>
              </ul>
              <p className="text-gray-700 mb-4">
                When data is no longer needed, we will securely delete or anonymize it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Data Rights</h2>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data</li>
                <li><strong>Portability:</strong> Request transfer of your data</li>
                <li><strong>Objection:</strong> Object to certain data processing</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="text-gray-700 mb-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:simantaparidaux@gmail.com" className="text-blue-600 hover:text-blue-700">
                  simantaparidaux@gmail.com
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to track activity on our Service and hold certain information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the Service to function properly</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use the Service</li>
                <li><strong>Security Cookies:</strong> Authenticate users and prevent fraud</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However,
                if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                Our Service may contain links to third-party websites or services that are not operated by us. We strongly
                advise you to review the Privacy Policy of every site you visit. We have no control over and assume no
                responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our Service is not intended for children under the age of 13. We do not knowingly collect personally
                identifiable information from children under 13. If you are a parent or guardian and you are aware that
                your child has provided us with personal data, please contact us so we can take necessary action.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and maintained on computers located outside of your state, province,
                country, or other governmental jurisdiction where data protection laws may differ. We will take all steps
                reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending you an email notification (for material changes)</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You are advised to review this Privacy Policy periodically for any changes. Changes are effective when
                posted on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices,
                please contact us:
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
              <p className="text-gray-700 mt-4">
                We will respond to your request within a reasonable timeframe, typically within 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Data Protection Officer</h2>
              <p className="text-gray-700 mb-4">
                For any data protection concerns or to exercise your rights, you can contact our Data Protection Officer at{' '}
                <a href="mailto:simantaparidaux@gmail.com" className="text-blue-600 hover:text-blue-700">
                  simantaparidaux@gmail.com
                </a>
              </p>
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
