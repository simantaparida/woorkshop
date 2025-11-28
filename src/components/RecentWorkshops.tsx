'use client';

import { Clock, MoreHorizontal, ArrowUpRight } from 'lucide-react';

const recentWorkshops = [
    {
        id: '1',
        title: 'Q4 Roadmap Planning',
        date: '2 hours ago',
        participants: 8,
        status: 'Completed',
    },
    {
        id: '2',
        title: 'Mobile App Redesign',
        date: 'Yesterday',
        participants: 12,
        status: 'In Progress',
    },
    {
        id: '3',
        title: 'Marketing Website Refresh',
        date: '3 days ago',
        participants: 5,
        status: 'Draft',
    },
];

export function RecentWorkshops() {
    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Workshops</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {recentWorkshops.map((workshop) => (
                        <div key={workshop.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {workshop.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {workshop.date} • {workshop.participants} participants
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${workshop.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        workshop.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {workshop.status}
                                </span>
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <button className="text-sm text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-1">
                        View all history <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
}
