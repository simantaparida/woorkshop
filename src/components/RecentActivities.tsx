'use client';

import { MessageSquare, UserPlus, CheckCircle, FileText } from 'lucide-react';

const activities = [
    {
        id: 1,
        user: 'Sarah Chen',
        action: 'completed voting in',
        target: 'Q4 Roadmap',
        time: '10m ago',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    {
        id: 2,
        user: 'Mike Ross',
        action: 'joined',
        target: 'Mobile Redesign',
        time: '1h ago',
        icon: UserPlus,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        id: 3,
        user: 'You',
        action: 'created',
        target: 'Sprint 42',
        time: '2h ago',
        icon: FileText,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    {
        id: 4,
        user: 'Alex Kim',
        action: 'commented on',
        target: 'Dark Mode',
        time: '4h ago',
        icon: MessageSquare,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
    },
];

export function RecentActivities() {
    return (
        <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="space-y-6">
                    {activities.map((activity, index) => (
                        <div key={activity.id} className="flex gap-3 relative">
                            {index !== activities.length - 1 && (
                                <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-gray-100" />
                            )}
                            <div className={`w-8 h-8 ${activity.bgColor} rounded-full flex items-center justify-center flex-shrink-0 z-10`}>
                                <activity.icon className={`w-4 h-4 ${activity.color}`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-900">
                                    <span className="font-medium">{activity.user}</span>{' '}
                                    <span className="text-gray-500">{activity.action}</span>{' '}
                                    <span className="font-medium">{activity.target}</span>
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
