'use client';

import { useState } from 'react';
import { Plus, Edit3, Layers, Sparkles, BarChart2, CheckCircle, PlayCircle, FileUp, UserPlus } from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import { useRecentActivities } from '@/lib/hooks/useRecentActivities';
import { formatRelativeTime } from '@/lib/utils/helpers';
import type { ActivityEntry } from '@/types';

const ITEMS_PER_PAGE = 10;

// Map activity type to icon and colors
const getActivityConfig = (type: ActivityEntry['type']) => {
    const configs = {
        player_joined: { icon: Plus, color: 'text-blue-600', bgColor: 'bg-blue-100' },
        participant_joined: { icon: UserPlus, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
        statement_submitted: { icon: Edit3, color: 'text-purple-600', bgColor: 'bg-purple-100' },
        pin_added: { icon: Layers, color: 'text-green-600', bgColor: 'bg-green-100' },
        vote_cast: { icon: BarChart2, color: 'text-pink-600', bgColor: 'bg-pink-100' },
        finalization: { icon: Sparkles, color: 'text-orange-600', bgColor: 'bg-orange-100' },
        session_created: { icon: PlayCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
        session_completed: { icon: CheckCircle, color: 'text-teal-600', bgColor: 'bg-teal-100' },
        attachment_uploaded: { icon: FileUp, color: 'text-slate-600', bgColor: 'bg-slate-100' },
    };
    return configs[type] || configs.player_joined;
};

export function RecentActivities() {
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useUser();
    const { activities, loading, error } = useRecentActivities(user?.id || null, 100); // Fetch more to enable pagination

    const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const displayedActivities = activities.slice(startIndex, endIndex);

    // Loading state
    if (loading) {
        return (
            <section>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse flex gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                    </div>
                    <div className="p-4">
                        <p className="text-red-600 text-sm">Error loading activities: {error}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                </div>

                {/* Activities list */}
                <div className="p-4">
                    {displayedActivities.length > 0 ? (
                        <>
                            <div className="space-y-4">
                                {displayedActivities.map((activity, index) => {
                                    const config = getActivityConfig(activity.type);
                                    const Icon = config.icon;
                                    return (
                                        <div key={activity.id} className="flex gap-3 relative">
                                            {index !== displayedActivities.length - 1 && (
                                                <div className="absolute left-4 top-8 bottom-[-16px] w-0.5 bg-gray-100" />
                                            )}
                                            <div className={`w-8 h-8 ${config.bgColor} rounded-full flex items-center justify-center flex-shrink-0 z-10`}>
                                                <Icon className={`w-4 h-4 ${config.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900">
                                                    {activity.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(activity.timestamp)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination controls */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                                    <div className="text-sm text-gray-500">
                                        Showing {startIndex + 1}-{Math.min(endIndex, activities.length)} of {activities.length} activities
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                                            currentPage === pageNum
                                                                ? 'bg-blue-600 text-white'
                                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 text-sm text-gray-500">
                            No recent activity
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
