'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ToolsCatalog } from '@/components/ToolsCatalog';
import { RecentSessions } from '@/components/RecentSessions';
import { RecentActivities } from '@/components/RecentActivities';
import { QuickActions } from '@/components/QuickActions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, Wrench, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [sessionCode, setSessionCode] = useState('');

  const handleJoinSession = () => {
    if (sessionCode.trim()) {
      router.push(`/session/${sessionCode.trim()}/lobby`);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Guest</h1>
            <p className="text-gray-500 mt-1">Ready to facilitate your next workshop?</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setShowJoinModal(true)}
            >
              <Users className="w-4 h-4" />
              Join Session
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => router.push('/tools')}
            >
              <Wrench className="w-4 h-4" />
              Browse Tools
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions onJoinSession={() => setShowJoinModal(true)} />

        {/* Facilitation Tools */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Facilitation Tools</h2>
              <p className="text-gray-500 mt-1">Structured frameworks for your workshops</p>
            </div>
            <Link
              href="/tools"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ToolsCatalog layout="grid" limit={4} />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Recent Sessions (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            <RecentSessions />
          </div>

          {/* Right Column: Activity Feed (1/3 width) */}
          <div className="space-y-8">
            <RecentActivities />
          </div>
        </div>

      </div>

      {/* Join Session Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl relative"
            >
              <button
                onClick={() => setShowJoinModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
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
    </AppLayout>
  );
}
