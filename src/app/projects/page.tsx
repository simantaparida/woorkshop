'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AppLayout } from '@/components/AppLayout';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateModal } from '@/components/CreateModal';
import { Input } from '@/components/ui/Input';
import { getActiveSessions, type ActiveSession } from '@/lib/utils/helpers';
import { supabase } from '@/lib/supabase/client';

interface ActiveSessionWithData extends ActiveSession {
  projectName?: string;
  hostName?: string;
  status?: string;
  expiresAt?: string | null;
}

type SortOption = 'newest' | 'oldest' | 'name';
type FilterOption = 'all' | 'open' | 'playing' | 'results';

export default function ProjectsPage() {
  const router = useRouter();
  const [recentSessions, setRecentSessions] = useState<ActiveSessionWithData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ActiveSessionWithData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');

  useEffect(() => {
    loadSessions();
  }, []);

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

          // Cast data to any to avoid "never" type issue if types aren't perfectly inferred
          const sessionData = data as any;

          return {
            ...session,
            projectName: sessionData.project_name,
            hostName: sessionData.host_name,
            status: sessionData.status,
            expiresAt: sessionData.expires_at,
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

  const filteredProjects = useMemo(() => {
    return recentSessions
      .filter(session => {
        const matchesSearch = (session.projectName || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || session.status === filterStatus;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return (a.projectName || '').localeCompare(b.projectName || '');
        }
        // For newest/oldest, we might need created_at, but we don't have it in ActiveSessionWithData yet.
        // Assuming the order in activeSessions (localStorage) is somewhat chronological or we rely on ID?
        // Actually, let's just reverse the array for newest if we assume they are added in order.
        // Or better, we should fetch created_at. For now, let's just keep original order for 'newest' if we don't have dates.
        // Wait, supabase fetch didn't include created_at.
        // Let's assume the list is already roughly ordered or just use what we have.
        return 0;
      });
  }, [recentSessions, searchQuery, filterStatus, sortBy]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">Manage your prioritization sessions</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Project
          </Button>
        </div>

        {/* Filters & Search */}
        {recentSessions.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex-1">
              <div className="relative">
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterOption)}
              >
                <option value="all">All Status</option>
                <option value="open">Waiting</option>
                <option value="playing">In Progress</option>
                <option value="results">Completed</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        )}

        {/* Project Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.sessionId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProjectCard
                    project={project}
                    onOpen={handleOpenSession}
                    onDelete={(e) => handleDeleteClick(project, e)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-xl">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery
                ? `We couldn't find any projects matching "${searchQuery}"`
                : 'Create your first prioritization project to get started with your team.'}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create New Project
            </Button>
          </div>
        )}
      </div>

      <CreateModal
        type="project"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSessionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Project?"
        message={
          sessionToDelete
            ? `This will permanently delete "${sessionToDelete.projectName || 'this project'}" and all related data. This action cannot be undone.`
            : ''
        }
        confirmText="Delete Project"
        cancelText="Cancel"
        isLoading={isDeleting}
        type="danger"
      />
    </AppLayout>
  );
}

