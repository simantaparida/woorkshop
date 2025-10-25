'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { TEMPLATES } from '@/lib/constants/templates';
import { getActiveSessions, type ActiveSession } from '@/lib/utils/helpers';
import type { Session } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface ActiveSessionWithData extends ActiveSession {
  projectName?: string;
  hostName?: string;
  status?: string;
}

export default function CreateLandingPage() {
  const router = useRouter();
  const [recentSessions, setRecentSessions] = useState<ActiveSessionWithData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load active sessions from localStorage and fetch session data
    async function loadSessions() {
      const activeSessions = getActiveSessions();

      // Fetch session data for each active session
      const sessionsWithData = await Promise.all(
        activeSessions.map(async (session) => {
          try {
            const { data, error } = await supabase
              .from('sessions')
              .select('project_name, host_name, status')
              .eq('id', session.sessionId)
              .single();

            if (error) throw error;

            return {
              ...session,
              projectName: data.project_name,
              hostName: data.host_name,
              status: data.status,
            };
          } catch (error) {
            console.error(`Failed to load session ${session.sessionId}:`, error);
            return session;
          }
        })
      );

      setRecentSessions(sessionsWithData);
      setLoading(false);
    }

    loadSessions();
  }, []);

  const handleCreateBlank = () => {
    router.push('/create/new');
  };

  const handleSelectTemplate = (templateId: string) => {
    router.push(`/create/new?template=${templateId}`);
  };

  const handleOpenSession = (sessionId: string) => {
    router.push(`/session/${sessionId}/lobby`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="font-semibold text-lg text-gray-900">UX Works</span>
            </div>

            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Start a new session
          </h1>
          <p className="text-gray-600">
            Choose a template or start from scratch
          </p>
        </div>

        {/* Cards Grid - Smaller cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
          {/* Blank Session Card */}
          <motion.button
            onClick={handleCreateBlank}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all text-left group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-3 group-hover:from-primary/10 group-hover:to-primary/20 transition-all">
              <svg className="w-6 h-6 text-gray-400 group-hover:text-primary transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="font-semibold text-sm text-gray-900 mb-0.5">Blank session</h3>
            <p className="text-xs text-gray-500">Start from scratch</p>
          </motion.button>

          {/* Template Cards */}
          {TEMPLATES.map((template) => (
            <motion.button
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all text-left group"
            >
              <div className="text-3xl mb-3">{template.icon}</div>
              <h3 className="font-semibold text-sm text-gray-900 mb-0.5">{template.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{template.description}</p>
              <p className="text-xs text-gray-400">{template.features.length} features</p>
            </motion.button>
          ))}
        </div>

        {/* Active Sessions */}
        {recentSessions.length > 0 && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Active Sessions
              </h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Project Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Host
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentSessions.map((session) => (
                      <motion.tr
                        key={session.sessionId}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                        className="group cursor-pointer"
                        onClick={() => handleOpenSession(session.sessionId)}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <motion.div
                              className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <span className="font-medium text-gray-900">
                              {session.projectName || 'Untitled Session'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {session.hostName || 'Unknown'}
                            </span>
                            {session.isHost && (
                              <span className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {session.status === 'open' && (
                            <span className="inline-flex items-center text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">
                              Waiting
                            </span>
                          )}
                          {session.status === 'playing' && (
                            <span className="inline-flex items-center text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                              In Progress
                            </span>
                          )}
                          {session.status === 'results' && (
                            <span className="inline-flex items-center text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                              Completed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSession(session.sessionId);
                            }}
                            className="transition-opacity"
                          >
                            {session.status === 'results' ? 'View Results →' : 'Resume →'}
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!loading && recentSessions.length === 0 && (
          <div className="text-center py-12 bg-white border-2 border-dashed border-gray-300 rounded-xl">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-500 mb-1">No recent sessions</p>
            <p className="text-sm text-gray-400">Create your first session to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
