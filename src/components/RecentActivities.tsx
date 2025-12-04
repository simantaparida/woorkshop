'use client';

import { useState } from 'react';
import { Plus, Edit3, Layers, Sparkles, BarChart2, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import { useRecentActivities } from '@/lib/hooks/useRecentActivities';
import { formatRelativeTime } from '@/lib/utils/helpers';
import type { ActivityEntry } from '@/types';

const DEFAULT_ITEMS_TO_SHOW = 3;

// Map activity type to icon and colors
const getActivityConfig = (type: ActivityEntry['type']) => {
    const configs = {
        player_joined: { icon: Plus, color: 'text-blue-600', bgColor: 'bg-blue-100' },
        statement_submitted: { icon: Edit3, color: 'text-purple-600', bgColor: 'bg-purple-100' },
        pin_added: { icon: Layers, color: 'text-green-600', bgColor: 'bg-green-100' },
        vote_cast: { icon: BarChart2, color: 'text-pink-600', bgColor: 'bg-pink-100' },
        finalization: { icon: Sparkles, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    };
    return configs[type] || configs.player_joined;
};

export function RecentActivities() {
    const [isExpanded, setIsExpanded] = useState(false);
    const { user } = useUser();
    const { activities, loading, error } = useRecentActivities(user?.id || null, 10);

    const displayedActivities = isExpanded ? activities : activities.slice(0, DEFAULT_ITEMS_TO_SHOW);
    const hasMoreActivities = activities.length > DEFAULT_ITEMS_TO_SHOW;

    // Loading state
    if (loading) {
        return (
            <section>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Workshop Timeline</h2>
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
                        <h2 className="text-lg font-semibold text-gray-900">Workshop Timeline</h2>
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
                {/* Header with collapse toggle */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Workshop Timeline</h2>
                    {hasMoreActivities && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                        >
                            {isExpanded ? (
                                <>
                                    Show less
                                    <ChevronUp className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Show more ({activities.length - DEFAULT_ITEMS_TO_SHOW} more)
                                    <ChevronDown className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Activities list */}
                <div className="p-4">
                    {displayedActivities.length > 0 ? (
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
