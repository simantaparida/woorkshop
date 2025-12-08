'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Vote, BarChart2, Grid2x2, Clock, ArrowRight, Lightbulb, Users, Radio, ExternalLink, Trash2, Eye, Link2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { useUser } from '@/lib/hooks/useUser';
import { useWorkshopSessions } from '@/lib/hooks/useWorkshopSessions';
import { useDeleteSession } from '@/lib/hooks/useDeleteSession';
import { DeleteSessionModal } from '@/components/sessions/DeleteSessionModal';
import { getToolById } from '@/lib/tools/registry';
import type { ToolType, WorkshopSessionData } from '@/types';

type TabType = 'all' | 'workshops' | 'tools';

// Map tool type to icon
const getToolIcon = (toolType: ToolType) => {
  const iconMap = {
    'voting-board': Vote,
    'problem-framing': Lightbulb,
    'rice': BarChart2,
    'moscow': Grid2x2,
  };
  return iconMap[toolType] || FileText;
};

// Map tool type to colors
const getToolColors = (toolType: ToolType) => {
  const colorMap = {
    'voting-board': { color: 'text-blue-600', bgColor: 'bg-blue-50' },
    'problem-framing': { color: 'text-green-600', bgColor: 'bg-green-50' },
    'rice': { color: 'text-purple-600', bgColor: 'bg-purple-50' },
    'moscow': { color: 'text-orange-600', bgColor: 'bg-orange-50' },
  };
  return colorMap[toolType] || { color: 'text-gray-600', bgColor: 'bg-gray-50' };
};

export function RecentSessions() {
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [sessionToDelete, setSessionToDelete] = useState<WorkshopSessionData | null>(null);
    const { user } = useUser();
    const { sessions: workshopSessions, loading, error, refetch } = useWorkshopSessions(user?.id || null);
    const { deleteSession, isDeleting } = useDeleteSession();

    // Limit to 5 sessions for display
    const sessions = workshopSessions.slice(0, 5);
    const hasMoreSessions = workshopSessions.length > 5;

    const getSessionUrl = (session: WorkshopSessionData) => {
        if (session.tool_type === 'voting-board') {
            return `/session/${session.id}`;
        } else if (session.tool_type === 'problem-framing') {
            return `/tools/problem-framing/${session.id}/join`;
        }
        return `/session/${session.id}`;
    };

    const copyLink = (session: WorkshopSessionData) => {
        const url = window.location.origin + getSessionUrl(session);
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    };

    const getUserFriendlyError = (error: string): string => {
        if (error.includes('Unauthorized')) {
            return 'You do not have permission to delete this session.';
        }
        if (error.includes('Session not found')) {
            return 'This session no longer exists.';
        }
        if (error.includes('Network error')) {
            return 'Network error. Please check your connection and try again.';
        }
        if (error.includes('Internal server error')) {
            return 'Server error occurred. Please try again later.';
        }
        return error.length < 100 ? error : 'Failed to delete session. Please try again.';
    };

    const handleDelete = async () => {
        if (!sessionToDelete) return;

        const result = await deleteSession(sessionToDelete.id);

        if (result.success) {
            toast.success('Session deleted successfully');
            setSessionToDelete(null);

            // Force immediate refetch to update the list
            refetch();
        } else {
            const errorMessage = result.error || 'Failed to delete session. Please try again.';
            const userMessage = getUserFriendlyError(errorMessage);
            toast.error(userMessage);
        }
    };

    // Loading state
    if (loading) {
        return (
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Recent Sessions</h2>
                </div>
                <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-20 bg-gray-100 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Recent Sessions</h2>
                </div>
                <div className="p-6">
                    <p className="text-red-600 text-sm">Error loading sessions: {error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-gray-900">Recent Sessions</h2>
                </div>
            </div>

            {/* Fixed height container for exactly 5 sessions */}
            <div className="overflow-x-auto" style={{ minHeight: sessions.length === 0 ? 'auto' : '520px' }}>
                {sessions.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {sessions.map((session) => {
                            const Icon = getToolIcon(session.tool_type);
                            const { color, bgColor } = getToolColors(session.tool_type);
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
                                                <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                    <Icon className={`w-5 h-5 ${color}`} />
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
                                                            <span>{session.participantCount} participants</span>
                                                        </span>
                                                        <span>·</span>
                                                        <span>
                                                            Last activity: <span className="font-medium text-gray-900">{session.lastActivity}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Right side: Action Buttons */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Tooltip content={session.status === 'completed' ? 'View Session' : 'Resume Session'}>
                                                    <Link
                                                        href={getSessionUrl(session)}
                                                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900"
                                                    >
                                                        {session.status === 'completed' ? (
                                                            <Eye className="w-4 h-4" />
                                                        ) : (
                                                            <ExternalLink className="w-4 h-4" />
                                                        )}
                                                    </Link>
                                                </Tooltip>
                                                <Tooltip content="Copy Link">
                                                    <button
                                                        onClick={() => copyLink(session)}
                                                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900"
                                                    >
                                                        <Link2 className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip content="Delete Session">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSessionToDelete(session);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-red-100 transition-colors text-gray-600 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </Tooltip>
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
                        <p className="text-sm text-gray-500 mt-1">Get started by creating a new session</p>
                    </div>
                )}
            </div>

            {/* Always show "View All" button when there are sessions */}
            {sessions.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
                    <Link href="/sessions" className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                        View All <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            )}

            {/* Delete confirmation modal */}
            <DeleteSessionModal
                isOpen={!!sessionToDelete}
                onClose={() => setSessionToDelete(null)}
                onConfirm={handleDelete}
                sessionTitle={sessionToDelete?.title || ''}
                participantCount={sessionToDelete?.participantCount || 0}
                isDeleting={isDeleting}
            />
        </section>
    );
}
