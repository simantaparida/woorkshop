'use client';

import { Search, Lightbulb, Vote, BarChart2, Grid2x2 } from 'lucide-react';
import type { SessionFilters, ToolType } from '@/types';

interface SessionsFiltersProps {
  filters: SessionFilters;
  onFiltersChange: (filters: SessionFilters) => void;
}

export function SessionsFilters({ filters, onFiltersChange }: SessionsFiltersProps) {
  const toolTypes: { value: ToolType | 'all'; label: string; icon?: any }[] = [
    { value: 'all', label: 'All Tools' },
    { value: 'problem-framing', label: 'Problem Framing', icon: Lightbulb },
    { value: 'voting-board', label: 'Voting Board', icon: Vote },
    { value: 'rice', label: 'RICE', icon: BarChart2 },
    { value: 'moscow', label: 'MoSCoW', icon: Grid2x2 },
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'playing', label: 'Playing' },
    { value: 'results', label: 'Results' },
    { value: 'completed', label: 'Completed' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'alphabetical', label: 'Alphabetical (A-Z)' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Tool Type Filter */}
      <select
        value={filters.toolType}
        onChange={(e) => onFiltersChange({ ...filters, toolType: e.target.value as ToolType | 'all' })}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {toolTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        value={filters.status}
        onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as any })}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search sessions..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Sort Dropdown */}
      <select
        value={filters.sortBy}
        onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as any })}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
