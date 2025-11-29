'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/Button';
import { getActiveSessions } from '@/lib/utils/helpers';
import { motion } from 'framer-motion';
import { User, Clock, Award, Zap, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const [hostName, setHostName] = useState('Guest User');
    const [stats, setStats] = useState({
        hosted: 0,
        participated: 0,
        total: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        // Load user info
        const savedName = localStorage.getItem('default_host_name');
        if (savedName) setHostName(savedName);

        // Calculate stats from local storage sessions
        const sessions = getActiveSessions();
        const hostedCount = sessions.filter(s => s.isHost).length;

        setStats({
            hosted: hostedCount,
            participated: sessions.length - hostedCount,
            total: sessions.length
        });

        setRecentActivity(sessions.slice(0, 5));
    }, []);

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
                        {hostName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{hostName}</h1>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 self-center md:self-auto">
                                Free Plan
                            </span>
                        </div>
                        <p className="text-gray-500 mb-6">Product Designer • Joined November 2025</p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <Link href="/settings">
                                <Button variant="secondary" size="sm">
                                    Edit Profile
                                </Button>
                            </Link>
                            <Link href="/projects/new">
                                <Button size="sm">
                                    <Zap className="w-4 h-4 mr-2" />
                                    New Project
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="bg-gray-50 rounded-xl p-6 min-w-[200px] border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Total Sessions</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                        <div className="text-xs text-green-600 flex items-center mt-2">
                            <Award className="w-3 h-3 mr-1" />
                            Top 10% Facilitator
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard
                        icon={User}
                        label="Hosted Sessions"
                        value={stats.hosted}
                        color="blue"
                    />
                    <StatCard
                        icon={Users}
                        label="Participated"
                        value={stats.participated}
                        color="purple"
                    />
                    <StatCard
                        icon={Clock}
                        label="Hours Facilitated"
                        value={Math.round(stats.hosted * 1.5)} // Mock calculation
                        color="orange"
                    />
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                        <Link href="/projects" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((session) => (
                                <div key={session.sessionId} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.isHost ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                        }`}>
                                        {session.isHost ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">
                                            {session.isHost ? 'Hosted' : 'Joined'} a session
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            ID: {session.sessionId.substring(0, 8)}...
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-400 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Today
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No recent activity found. Start a project to see stats here!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
        >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorStyles[color as keyof typeof colorStyles]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
            </div>
        </motion.div>
    );
}

import { Users } from 'lucide-react';
