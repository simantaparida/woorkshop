'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Vote, BarChart2, Grid2x2, Clock, ArrowRight, MoreVertical, Search, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// Mock data for workshops (from RecentWorkshops.tsx)
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
];

// Mock data for tool sessions (from RecentToolSessions.tsx)
// In a real app, this would come from the database
const recentToolSessions: any[] = [];

type TabType = 'all' | 'workshops' | 'tools';

export function RecentSessions() {
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const getFilteredSessions = () => {
        switch (activeTab) {
            case 'workshops':
                return recentWorkshops;
            case 'tools':
                return recentToolSessions;
            default:
                return [...recentWorkshops, ...recentToolSessions].sort((a, b) => {
                    // Simple mock sort, in reality would parse dates
                    return 0;
                });
        }
    };

    const sessions = getFilteredSessions();

    return (
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-gray-900">Recent Sessions</h2>

                    <div className="flex p-1 bg-gray-100 rounded-lg self-start sm:self-auto">
                        {(['all', 'workshops', 'tools'] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                {sessions.length > 0 ? (
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sessions.map((session) => {
                                const Icon = session.icon || FileText;
                                return (
                                    <tr key={session.id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 ${session.bgColor || 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                                                    <Icon className={`w-4 h-4 ${session.color || 'text-gray-600'}`} />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{session.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {session.type || 'Tool Session'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {session.date || 'Recently'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                Resume <ArrowRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900">No sessions found</h3>
                        <p className="text-sm text-gray-500 mt-1">Get started by creating a new workshop</p>
                    </div>
                )}
            </div>

            {sessions.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
                    <Link href="/projects" className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                        View All Sessions <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            )}
        </section>
    );
}
