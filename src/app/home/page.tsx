'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AppLayout } from '@/components/AppLayout';
import { TEMPLATES } from '@/lib/constants/templates';
import { getActiveSessions, type ActiveSession } from '@/lib/utils/helpers';
import { formatTimeRemaining, isSessionExpired } from '@/lib/constants/session-durations';
import type { Session } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface ActiveSessionWithData extends ActiveSession {
  projectName?: string;
  hostName?: string;
  status?: string;
  expiresAt?: string | null;
}

export default function HomePage() {
  const router = useRouter();
  const [recentSessions, setRecentSessions] = useState<ActiveSessionWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ActiveSessionWithData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
              .select('project_name, host_name, status, expires_at')
              .eq('id', session.sessionId)
              .single();

            if (error) throw error;

            return {
              ...session,
              projectName: data.project_name,
              hostName: data.host_name,
              status: data.status,
              expiresAt: data.expires_at,
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

  const handleDeleteClick = (session: ActiveSessionWithData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete(session);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/session/${sessionToDelete.sessionId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken: sessionToDelete.hostToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete session');
      }

      // Remove from localStorage
      localStorage.removeItem(`host_token_${sessionToDelete.sessionId}`);
      localStorage.removeItem(`player_id_${sessionToDelete.sessionId}`);

      // Remove from recentSessions
      setRecentSessions(prev => prev.filter(s => s.sessionId !== sessionToDelete.sessionId));

      // Close modal
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Start a new session
          </h2>
          <p className="text-gray-600">
            Choose a template or start from scratch
          </p>
        </div>

        {/* Cards Grid - Smaller cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
          {/* Blank Session Card */}
          <motion.button
            onClick={handleCreateBlank}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-blue-600 hover:shadow-md transition-all text-left group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-3 group-hover:from-blue-50 group-hover:to-blue-100 transition-all">
              <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-blue-600 hover:shadow-md transition-all text-left group"
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

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Project Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Host
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Expires
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
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
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4">
                          {session.expiresAt ? (
                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                              isSessionExpired(session.expiresAt)
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatTimeRemaining(session.expiresAt)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">No limit</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSession(session.sessionId);
                              }}
                              className="transition-opacity"
                            >
                              {session.status === 'results' ? 'View Results' : 'Resume'}
                            </Button>
                            <button
                              onClick={(e) => handleDeleteClick(session, e)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete session"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSessionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Session?"
        message={
          sessionToDelete
            ? `This will permanently delete "${sessionToDelete.projectName || 'this session'}" and all related data. This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        type="danger"
      />
    </AppLayout>
  );
}
