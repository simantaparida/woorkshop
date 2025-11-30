'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { AppLayout } from '@/components/AppLayout';
import { CreateModal } from '@/components/CreateModal';
import { useToast } from '@/components/ui/Toast';
import { ROUTES } from '@/lib/constants';
import { getToolById } from '@/lib/tools/registry';
import type { Workshop, Session } from '@/types';

interface WorkshopWithContext extends Workshop {
  project?: {
    id: string;
    title: string;
  } | null;
  sessions?: Session[];
}

export default function WorkshopDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workshopId = params?.id as string;
  const { showToast, ToastContainer } = useToast();

  const [workshop, setWorkshop] = useState<WorkshopWithContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (workshopId) {
      fetchWorkshop();
    }
  }, [workshopId]);

  const fetchWorkshop = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workshops/${workshopId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch workshop');
      }

      setWorkshop(data.workshop);
    } catch (error) {
      console.error('Error fetching workshop:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to load workshop',
        'error'
      );
      router.push(ROUTES.WORKSHOPS);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(ROUTES.LOBBY(sessionId));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading workshop...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!workshop) {
    return null;
  }

  const sessions = workshop.sessions || [];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ToastContainer />

        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            {workshop.project ? (
              <>
                <li>
                  <button
                    onClick={() => router.push(ROUTES.PROJECTS)}
                    className="hover:text-primary transition-colors"
                  >
                    Projects
                  </button>
                </li>
                <li>→</li>
                <li>
                  <button
                    onClick={() => router.push(ROUTES.PROJECT_DETAIL(workshop.project!.id))}
                    className="hover:text-primary transition-colors"
                  >
                    {workshop.project.title}
                  </button>
                </li>
                <li>→</li>
              </>
            ) : (
              <>
                <li>
                  <button
                    onClick={() => router.push(ROUTES.WORKSHOPS)}
                    className="hover:text-primary transition-colors"
                  >
                    Workshops
                  </button>
                </li>
                <li>→</li>
              </>
            )}
            <li className="text-gray-900 font-medium">{workshop.title}</li>
          </ol>
        </nav>

        {/* Workshop Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {workshop.title}
              </h1>
              {workshop.description && (
                <p className="text-gray-600 text-lg mb-4">{workshop.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{sessions.length} sessions</span>
                <span>•</span>
                <span>Created {new Date(workshop.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
              size="lg"
            >
              + Add Session
            </Button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sessions</h2>

          {sessions.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No sessions yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first session in this workshop.
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="primary"
                >
                  Create Session
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => {
                const tool = getToolById(session.tool_type);
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleSessionClick(session.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-medium text-primary bg-primary-50 px-2 py-1 rounded">
                          {tool?.name || session.tool_type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          session.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                          session.status === 'playing' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                        {session.title}
                      </h3>
                      {session.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {session.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4 mt-4">
                        <span className="text-gray-500">
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-primary font-medium hover:underline">
                          Open →
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateModal
        type="session"
        workshopId={workshopId}
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchWorkshop(); // Refresh sessions list
        }}
      />
    </AppLayout>
  );
}
