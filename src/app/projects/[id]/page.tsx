'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { AppLayout } from '@/components/AppLayout';
import { CreateModal } from '@/components/CreateModal';
import { useToast } from '@/components/ui/Toast';
import { ROUTES } from '@/lib/constants';
import type { Project, Workshop } from '@/types';

interface WorkshopWithCount extends Workshop {
  sessionCount: number;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  const { showToast, ToastContainer } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [workshops, setWorkshops] = useState<WorkshopWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch project');
      }

      setProject(data.project);
      setWorkshops(data.project.workshops || []);
    } catch (error) {
      console.error('Error fetching project:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to load project',
        'error'
      );
      router.push(ROUTES.PROJECTS);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkshopClick = (workshopId: string) => {
    router.push(ROUTES.WORKSHOP_DETAIL(workshopId));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading project...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ToastContainer}

        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <button
                onClick={() => router.push(ROUTES.PROJECTS)}
                className="hover:text-primary transition-colors"
              >
                Projects
              </button>
            </li>
            <li>→</li>
            <li className="text-gray-900 font-medium">{project.title}</li>
          </ol>
        </nav>

        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {project.title}
              </h1>
              {project.description && (
                <p className="text-gray-600 text-lg mb-4">{project.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{workshops.length} workshops</span>
                <span>•</span>
                <span>
                  {workshops.reduce((sum, w) => sum + w.sessionCount, 0)} sessions
                </span>
                <span>•</span>
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
              size="lg"
            >
              + Add Workshop
            </Button>
          </div>
        </div>

        {/* Workshops List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Workshops</h2>

          {workshops.length === 0 ? (
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
                  Create your first workshop to start organizing sessions in this project.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshops.map((workshop) => (
                <motion.div
                  key={workshop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleWorkshopClick(workshop.id)}
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                      {workshop.title}
                    </h3>
                    {workshop.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {workshop.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm">
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
      </div>

      <CreateModal
        type="workshop"
        projectId={projectId}
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchProject(); // Refresh workshops list
        }}
      />
    </AppLayout>
  );
}
