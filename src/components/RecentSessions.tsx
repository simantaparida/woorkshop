'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Vote, BarChart2, Grid2x2, Clock, ArrowRight, MoreVertical, Search, Lightbulb, Users, Radio } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface WorkshopSession {
    id: string;
    title: string;
    type: string;
    date: string;
    participants: number;
    activitiesCompleted: number;
    totalActivities: number;
    lastActivity: string;
    status: 'live' | 'paused' | 'completed';
    icon: any;
    color: string;
    bgColor: string;
}

// Mock data for workshops with facilitator-friendly indicators
const recentWorkshops: WorkshopSession[] = [
    {
        id: '1',
        title: 'Mobile App Redesign',
        type: 'Prioritisation',
        date: '2 hours ago',
        participants: 4,
        activitiesCompleted: 3,
        totalActivities: 5,
        lastActivity: 'Clustering',
        status: 'live',
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
        activitiesCompleted: 2,
        totalActivities: 4,
        lastActivity: 'Voting',
        status: 'paused',
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
        activitiesCompleted: 5,
        totalActivities: 5,
        lastActivity: 'Finalizing',
        status: 'completed',
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
                    <div className="divide-y divide-gray-100">
                        {sessions.map((session) => {
                            const Icon = session.icon || FileText;
                            const progressPercentage = session.totalActivities > 0 
                                ? (session.activitiesCompleted / session.totalActivities) * 100 
                                : 0;
                            
                            const getStatusBadge = () => {
                                switch (session.status) {
                                    case 'live':
                                        return (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                <Radio className="w-3 h-3 fill-current" />
                                                Live
                                            </span>
                                        );
                                    case 'paused':
                                        return (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                <Clock className="w-3 h-3" />
                                                Paused
                                            </span>
                                        );
                                    case 'completed':
                                        return (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                Completed
                                            </span>
                                        );
                                }
                            };

                            return (
                                <div key={session.id} className="group hover:bg-gray-50 transition-colors">
                                    <div className="px-6 py-4">
                                        <div className="flex items-start justify-between gap-4">
                                            {/* Left side: Icon and Title */}
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className={`w-10 h-10 ${session.bgColor || 'bg-gray-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                    <Icon className={`w-5 h-5 ${session.color || 'text-gray-600'}`} />
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    {/* Title and Status */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                            {session.title}
                                                        </h3>
                                                        {getStatusBadge()}
                                                    </div>
                                                    
                                                    {/* Progress Bar */}
                                                    <div className="mb-2">
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all ${
                                                                    session.status === 'completed' 
                                                                        ? 'bg-green-500' 
                                                                        : session.status === 'live'
                                                                        ? 'bg-blue-500'
                                                                        : 'bg-yellow-500'
                                                                }`}
                                                                style={{ width: `${progressPercentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Indicators */}
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                                        <span className="inline-flex items-center gap-1">
                                                            <span className="font-medium text-gray-900">
                                                                {session.activitiesCompleted}/{session.totalActivities}
                                                            </span>
                                                            <span>activities completed</span>
                                                        </span>
                                                        <span>·</span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            <span>{session.participants} participants</span>
                                                        </span>
                                                        <span>·</span>
                                                        <span>
                                                            Last activity: <span className="font-medium text-gray-900">{session.lastActivity}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Right side: Action Button */}
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                                >
                                                    {session.status === 'completed' ? 'View' : 'Resume'} 
                                                    <ArrowRight className="w-3 h-3 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
                    <Link href="/workshops" className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                        View All Workshops <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            )}
        </section>
    );
}
