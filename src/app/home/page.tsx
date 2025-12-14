'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ToolsCatalog } from '@/components/ToolsCatalog';
import { RecentSessions } from '@/components/RecentSessions';
import { RecentActivities } from '@/components/RecentActivities';
import { CreateModal } from '@/components/CreateModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, Plus, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/lib/hooks/useUser';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateWorkshopModal, setShowCreateWorkshopModal] = useState(false);
  const [sessionCode, setSessionCode] = useState('');

  const handleJoinSession = () => {
    if (sessionCode.trim()) {
      router.push(`/session/${sessionCode.trim()}/lobby`);
    }
  };

  // Get user display name
  const userName = userLoading ? '...' : (user?.name || 'Guest');

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 md:space-y-8">

        {/* Header Section */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back, {userName}</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Build structured agendas, run activities, and guide your team through productive product workshops.</p>
        </div>

        {/* Facilitation Tools */}
        <section>
          <ToolsCatalog layout="grid" limit={4} />
        </section>

        {/* Recent Sessions - Full Width */}
        <RecentSessions />

        {/* Recent Activity - Full Width */}
        <RecentActivities />

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

      {/* Create Workshop Modal */}
      <CreateModal
        type="workshop"
        isOpen={showCreateWorkshopModal}
        onClose={() => {
          setShowCreateWorkshopModal(false);
        }}
      />
    </AppLayout>
  );
}
