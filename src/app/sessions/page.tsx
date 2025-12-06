'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { SessionsFilters } from '@/components/sessions/SessionsFilters';
import { SessionsList } from '@/components/sessions/SessionsList';
import { useUser } from '@/lib/hooks/useUser';
import { useSessions } from '@/lib/hooks/useSessions';
import type { SessionFilters } from '@/types';

export default function SessionsPage() {
  const { user } = useUser();
  const [filters, setFilters] = useState<SessionFilters>({
    toolType: 'all',
    status: 'all',
    search: '',
    sortBy: 'newest',
  });

  const { sessions, loading, error, refetch } = useSessions(user?.id || null, filters);

  const handleClearFilters = () => {
    setFilters({
      toolType: 'all',
      status: 'all',
      search: '',
      sortBy: 'newest',
    });
  };

  const handleClearSearch = () => {
    setFilters({
      ...filters,
      search: '',
    });
  };

  const hasFiltersApplied =
    filters.toolType !== 'all' ||
    filters.status !== 'all' ||
    filters.sortBy !== 'newest';

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sessions</h1>
          <p className="text-gray-600">
            Manage all your collaborative sessions in one place
          </p>
        </div>

        {/* Filters */}
        <SessionsFilters filters={filters} onFiltersChange={setFilters} />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Sessions List */}
        <SessionsList
          sessions={sessions}
          loading={loading}
          onRefetch={refetch}
          onClearFilters={handleClearFilters}
          onClearSearch={handleClearSearch}
          hasFiltersApplied={hasFiltersApplied}
          searchTerm={filters.search}
        />
      </div>
    </AppLayout>
  );
}
