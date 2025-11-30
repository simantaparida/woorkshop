'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { AppLayout } from '@/components/AppLayout';
import { CreateModal } from '@/components/CreateModal';
import { useToast } from '@/components/ui/Toast';
import { ROUTES } from '@/lib/constants';
import type { Workshop, Project } from '@/types';

interface WorkshopWithContext extends Workshop {
  sessionCount: number;
  project?: {
    id: string;
    title: string;
  } | null;
}

export default function WorkshopsPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();

  const [workshops, setWorkshops] = useState<WorkshopWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workshops');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch workshops');
      }

      setWorkshops(data.workshops || []);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to load workshops',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWorkshopClick = (workshopId: string) => {
    router.push(ROUTES.WORKSHOP_DETAIL(workshopId));
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ToastContainer />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workshops</h1>
            <p className="text-gray-600 mt-2">
              Browse and manage your workshops
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            size="lg"
          >
            + Create Workshop
          </Button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading workshops...</p>
            </div>
          </div>
        ) : workshops.length === 0 ? (
          /* Empty State */
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No workshops yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first workshop to organize facilitation sessions.
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                variant="primary"
              >
                Create Workshop
              </Button>
            </div>
          </div>
        ) : (
          /* Workshops Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop) => (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                onClick={() => handleWorkshopClick(workshop.id)}
              >
                <div className="p-6">
                  {/* Project Badge if workshop is in a project */}
                  {workshop.project && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          />
                        </svg>
                        {workshop.project.title}
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {workshop.title}
                  </h3>

                  {workshop.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {workshop.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4 mt-4">
                    <span className="text-gray-500">
                      {workshop.sessionCount}{' '}
                      {workshop.sessionCount === 1 ? 'session' : 'sessions'}
                    </span>
                    <span className="text-primary font-medium hover:underline">
                      View →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CreateModal
        type="workshop"
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchWorkshops(); // Refresh workshops list
        }}
      />
    </AppLayout>
  );
}
