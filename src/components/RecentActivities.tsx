'use client';

import { useState } from 'react';
import { Plus, Edit3, Layers, Sparkles, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';

const activities = [
    {
        id: 1,
        text: 'You added 14 pain points to Mobile Redesign',
        time: '10m ago',
        icon: Plus,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        id: 2,
        text: 'Sarah reframed a problem statement',
        time: '1h ago',
        icon: Edit3,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    {
        id: 3,
        text: 'Mike clustered 8 notes',
        time: '2h ago',
        icon: Layers,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    {
        id: 4,
        text: 'AI grouped similar insights',
        time: '3h ago',
        icon: Sparkles,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
    },
    {
        id: 5,
        text: 'You created a RICE prioritization session',
        time: '5h ago',
        icon: BarChart2,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
    },
];

const DEFAULT_ITEMS_TO_SHOW = 3;

export function RecentActivities() {
    const [isExpanded, setIsExpanded] = useState(false);
    const displayedActivities = isExpanded ? activities : activities.slice(0, DEFAULT_ITEMS_TO_SHOW);
    const hasMoreActivities = activities.length > DEFAULT_ITEMS_TO_SHOW;

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
                            {displayedActivities.map((activity, index) => (
                                <div key={activity.id} className="flex gap-3 relative">
                                    {index !== displayedActivities.length - 1 && (
                                        <div className="absolute left-4 top-8 bottom-[-16px] w-0.5 bg-gray-100" />
                                    )}
                                    <div className={`w-8 h-8 ${activity.bgColor} rounded-full flex items-center justify-center flex-shrink-0 z-10`}>
                                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900">
                                            {activity.text}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
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
