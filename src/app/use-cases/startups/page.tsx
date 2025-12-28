'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/Navbar';
import { ROUTES, APP_NAME } from '@/lib/constants';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

export default function StartupsPage() {
  const router = useRouter();
  const { trackEvent } = useAnalytics();

  const handleCTAClick = () => {
    trackEvent('startups_cta_clicked');
    router.push(ROUTES.CREATE);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - More Visual */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        <div className="absolute inset-0 opacity-40" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-6">
                <span className="text-2xl">🚀</span>
                <span className="text-sm font-medium text-orange-800">For Startups</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Ship Fast. <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Don't Guess.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Stop building the wrong thing. Use <span className="font-semibold text-gray-900">100-Point Voting</span>, <span className="font-semibold text-gray-900">RICE</span>, or <span className="font-semibold text-gray-900">MoSCoW</span> to align your team on what actually matters—before you write a single line of code.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>No setup time</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Instant results</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Team alignment</span>
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleCTAClick}
                className="text-lg px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Start Free Session
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Startup Session</div>
                    <div className="text-sm text-gray-500">5 participants</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">User Authentication</span>
                      <span className="text-orange-600 font-bold">35 pts</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Mobile App</span>
                      <span className="text-blue-600 font-bold">28 pts</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-400 to-indigo-400 h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Analytics Dashboard</span>
                      <span className="text-green-600 font-bold">22 pts</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full" style={{ width: '22%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Payment Integration</span>
                      <span className="text-purple-600 font-bold">15 pts</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-orange-400 rounded-full animate-pulse"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visual Stats Section */}
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
              Why Startups Choose Woorkshop
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              You don't have time for 2-hour alignment meetings. Get consensus in minutes, not days.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "10",
                unit: "min",
                title: "From Chaos to Clarity",
                description: "Create session, invite team, vote, see results. Your runway is too short for slow decisions.",
                color: "from-orange-400 to-red-400"
              },
              {
                number: "100%",
                unit: "consensus",
                title: "Kill Analysis Paralysis",
                description: "Everyone votes simultaneously. No HiPPO bias. No endless Slack threads. Just data.",
                color: "from-blue-400 to-indigo-400"
              },
              {
                number: "$0",
                unit: "cost",
                title: "Free While Bootstrapping",
                description: "No credit card. No demo call. No sales pitch. Start a session in 60 seconds and ship smarter.",
                color: "from-green-400 to-emerald-400"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className={`w-32 h-32 mx-auto bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center text-white shadow-lg`}>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stat.number}</div>
                      <div className="text-sm opacity-90">{stat.unit}</div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{stat.title}</h3>
                <p className="text-gray-600 leading-relaxed">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Use Cases */}
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
              Real Startup Scenarios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From pre-seed to Series A, these are the moments when alignment matters most.
            </p>
          </motion.div>

          <div className="space-y-16">
            {[
              {
                title: "Sprint Planning That Doesn't Suck",
                description: "Everyone shows up with different priorities. 30 minutes later, you leave with a ranked backlog the whole team bought into. No feature creep. No mid-sprint surprises.",
                visual: (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
                      <div className="w-8 h-8 bg-blue-400 rounded-full"></div>
                      <div className="w-8 h-8 bg-green-400 rounded-full"></div>
                      <div className="text-sm text-gray-500">+2 more</div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-orange-200 rounded w-3/4"></div>
                      <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                      <div className="h-4 bg-green-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ),
                icon: "🏃‍♂️"
              },
              {
                title: "MVP Scope Definition",
                description: "You have 10 feature ideas and 3 months of runway. Use RICE scoring to rank by reach, impact, confidence, and effort. Ship what moves the needle, cut the rest.",
                visual: (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📱</span>
                      </div>
                      <div className="h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">💳</span>
                      </div>
                      <div className="h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                      </div>
                      <div className="h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🔔</span>
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-500">Vote on features</div>
                  </div>
                ),
                icon: "💡"
              },
              {
                title: "Co-Founder Alignment",
                description: "CEO wants marketing features. CTO wants infrastructure. Product wants UX polish. Run a 100-point vote and let the team decide—before it becomes a political fight.",
                visual: (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        MVP
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-orange-300 rounded-full" style={{ width: '90%' }}></div>
                      <div className="h-3 bg-orange-200 rounded-full" style={{ width: '70%' }}></div>
                      <div className="h-3 bg-orange-100 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                ),
                icon: "🎯"
              }
            ].map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{useCase.icon}</span>
                    <h3 className="text-3xl font-bold text-gray-900">{useCase.title}</h3>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">{useCase.description}</p>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  {useCase.visual}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Testimonial */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-12 border border-orange-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200 to-red-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            
            <div className="relative">
              <div className="mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Building in Public
                </h2>
                <p className="text-gray-600">
                  Real usage data. Unfiltered feedback. Help us get it right.
                </p>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-orange-200">
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
                  <div className="text-[10px] md:text-xs text-gray-600">Faster than your standup</div>
                </div>
              </div>

              {/* What Startups Are Saying */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">What startups are saying</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-orange-600 font-bold">•</div>
                    <div className="text-gray-700 text-sm leading-relaxed">
                      "Killed our 2-hour sprint planning. Now it's 20 minutes and everyone's aligned."
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-orange-600 font-bold">•</div>
                    <div className="text-gray-700 text-sm leading-relaxed">
                      "We use this before every investor meeting to align on our roadmap story"
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-orange-600 font-bold">•</div>
                    <div className="text-gray-700 text-sm leading-relaxed">
                      "Would pay for Slack integration and automated reminders"
                    </div>
                  </div>
                </div>
                <a
                  href="https://forms.gle/SUSxNsiB8V7qWQTn9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1"
                >
                  Share your feedback
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visual CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute inset-0" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Stop debating. Start building.
            </h2>
            <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
              Create your first session in 60 seconds. No signup, no credit card, no sales call. Just alignment.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCTAClick}
              className="text-lg px-10 py-4 bg-white text-orange-600 hover:bg-gray-50 shadow-lg hover:shadow-xl"
            >
              Start Free Session
            </Button>
            <p className="text-sm text-orange-100 mt-6">
              Join startups shipping smarter, not louder
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
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
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
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="mailto:simantaparidaux@gmail.com"
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-orange-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
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
