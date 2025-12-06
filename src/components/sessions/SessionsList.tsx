'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { SessionCard } from './SessionCard';
import { DeleteSessionModal } from './DeleteSessionModal';
import { SessionsEmptyState } from './SessionsEmptyState';
import { useDeleteSession } from '@/lib/hooks/useDeleteSession';
import type { SessionListItem } from '@/types';

interface SessionsListProps {
  sessions: SessionListItem[];
  loading: boolean;
  onRefetch: () => void;
  onClearFilters: () => void;
  onClearSearch: () => void;
  hasFiltersApplied: boolean;
  searchTerm: string;
}

export function SessionsList({
  sessions,
  loading,
  onRefetch,
  onClearFilters,
  onClearSearch,
  hasFiltersApplied,
  searchTerm,
}: SessionsListProps) {
  const [sessionToDelete, setSessionToDelete] = useState<SessionListItem | null>(null);
  const { deleteSession, isDeleting } = useDeleteSession();

  const getUserFriendlyError = (error: string): string => {
    if (error.includes('Unauthorized')) {
      return 'You do not have permission to delete this session.';
    }
    if (error.includes('Session not found')) {
      return 'This session no longer exists.';
    }
    if (error.includes('Network error')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.includes('Internal server error')) {
      return 'Server error occurred. Please try again later.';
    }
    return error.length < 100 ? error : 'Failed to delete session. Please try again.';
  };

  const handleDelete = async () => {
    if (!sessionToDelete) return;

    const sessionId = sessionToDelete.id;
    const result = await deleteSession(sessionId);

    if (result.success) {
      toast.success('Session deleted successfully');
      setSessionToDelete(null);

      // Force immediate refetch to update the list
      await onRefetch();
    } else {
      const errorMessage = result.error || 'Failed to delete session. Please try again.';
      const userMessage = getUserFriendlyError(errorMessage);
      toast.error(userMessage);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty states
  if (sessions.length === 0) {
    if (searchTerm) {
      return (
        <SessionsEmptyState
          type="no-search-results"
          searchTerm={searchTerm}
          onClearSearch={onClearSearch}
        />
      );
    }

    if (hasFiltersApplied) {
      return (
        <SessionsEmptyState
          type="no-results"
          onClearFilters={onClearFilters}
        />
      );
    }

    return <SessionsEmptyState type="no-sessions" />;
  }

  // Sessions grid
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onDelete={(id) => {
              const session = sessions.find((s) => s.id === id);
              if (session) setSessionToDelete(session);
            }}
          />
        ))}
      </div>

      {/* Delete confirmation modal */}
      <DeleteSessionModal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleDelete}
        sessionTitle={sessionToDelete?.title || ''}
        participantCount={sessionToDelete?.participantCount || 0}
        isDeleting={isDeleting}
      />
    </>
  );
}
