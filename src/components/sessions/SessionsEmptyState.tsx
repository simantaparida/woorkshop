'use client';

import { FolderOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface SessionsEmptyStateProps {
  type: 'no-sessions' | 'no-results' | 'no-search-results';
  searchTerm?: string;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
}

export function SessionsEmptyState({
  type,
  searchTerm = '',
  onClearFilters,
  onClearSearch,
}: SessionsEmptyStateProps) {
  if (type === 'no-sessions') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions yet</h3>
        <p className="text-sm text-gray-600 mb-6">
          Create your first collaborative session to get started
        </p>
        <Link href="/tools">
          <Button>Create Session</Button>
        </Link>
      </div>
    );
  }

  if (type === 'no-search-results') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No sessions found for "{searchTerm}"
        </h3>
        <p className="text-sm text-gray-600 mb-6">Try a different search term</p>
        <Button variant="outline" onClick={onClearSearch}>
          Clear Search
        </Button>
      </div>
    );
  }

  // no-results (filters applied but no matches)
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No sessions match your filters
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Try adjusting your filters or search term
      </p>
      <Button variant="outline" onClick={onClearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}
