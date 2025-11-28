'use client';

import { Plus, Edit3, Layers, Sparkles, BarChart2 } from 'lucide-react';

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

export function RecentActivities() {
    return (
        <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="space-y-4">
                    {activities.map((activity, index) => (
                        <div key={activity.id} className="flex gap-3 relative">
                            {index !== activities.length - 1 && (
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
            </div>
        </section>
    );
}
