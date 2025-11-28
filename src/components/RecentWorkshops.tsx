'use client';

import { BarChart2, Vote, Search, Lightbulb, FileSearch, ArrowRight, MoreVertical } from 'lucide-react';

const recentWorkshops = [
    {
        id: '1',
        title: 'Mobile App Redesign',
        type: 'Prioritisation',
        date: '2 hours ago',
        participants: 8,
        icon: BarChart2,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
    },
    {
        id: '2',
        title: 'Q4 Feature Planning',
        type: 'Voting',
        date: 'Yesterday',
        participants: 12,
        icon: Vote,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
    },
    {
        id: '3',
        title: 'User Onboarding Issues',
        type: 'Problem Framing',
        date: '2 days ago',
        participants: 6,
        icon: Search,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
    },
    {
        id: '4',
        title: 'Customer Pain Points',
        type: 'Discovery',
        date: '3 days ago',
        participants: 5,
        icon: Lightbulb,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
    },
];

export function RecentWorkshops() {
    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Workshops</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                </button>
            </div>
            <div className="bg-white rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                Workshop
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                Type
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                Date
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                Participants
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">

                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentWorkshops.map((workshop) => (
                            <tr key={workshop.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
                                <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 ${workshop.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                            <workshop.icon className={`w-4 h-4 ${workshop.color}`} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {workshop.title}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-2.5">
                                    <span className={`text-sm font-medium ${workshop.color}`}>
                                        {workshop.type}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5">
                                    <span className="text-sm text-gray-500">
                                        {workshop.date}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5">
                                    <span className="text-sm text-gray-500">
                                        {workshop.participants}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
