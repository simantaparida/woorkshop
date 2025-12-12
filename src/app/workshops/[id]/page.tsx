'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { AppLayout } from '@/components/AppLayout';
import { CreateModal } from '@/components/CreateModal';
import { useToast } from '@/components/ui/Toast';
import { ROUTES } from '@/lib/constants';
import { getToolById } from '@/lib/tools/registry';
import { Users, Radio, Clock, ArrowRight } from 'lucide-react';
import type { Workshop, Session } from '@/types';

interface SessionWithProgress extends Session {
  participantCount?: number;
  activitiesCompleted?: number;
  totalActivities?: number;
  lastActivity?: string;
}

interface WorkshopWithContext extends Workshop {
  sessions?: SessionWithProgress[];
}

export default function WorkshopDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workshopId = params?.id as string;
  const { showToast, ToastContainer } = useToast();

  const [workshop, setWorkshop] = useState<WorkshopWithContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (workshopId) {
      fetchWorkshop();
    }
  }, [workshopId]);

  const fetchWorkshop = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workshops/${workshopId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch workshop');
      }

      setWorkshop(data.workshop);
    } catch (error) {
      console.error('Error fetching workshop:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to load workshop',
        'error'
      );
      router.push(ROUTES.WORKSHOPS);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(ROUTES.LOBBY(sessionId));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading workshop...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!workshop) {
    return null;
  }

  const sessions = workshop.sessions || [];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ToastContainer}

        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <button
                onClick={() => router.push(ROUTES.WORKSHOPS)}
                className="hover:text-primary transition-colors"
              >
                Workshops
              </button>
            </li>
            <li>→</li>
            <li className="text-gray-900 font-medium">{workshop.title}</li>
          </ol>
        </nav>

        {/* Workshop Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {workshop.title}
              </h1>
              {workshop.description && (
                <p className="text-gray-600 text-lg mb-4">{workshop.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{sessions.length} sessions</span>
                <span>•</span>
                <span>Created {new Date(workshop.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
              size="lg"
            >
              + Add Session
            </Button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sessions</h2>

          {sessions.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No sessions yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first session in this workshop.
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="primary"
                >
                  Create Session
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-gray-100">
                {sessions.map((session) => {
                  const tool = getToolById(session.tool_type as any);
                  const activitiesCompleted = session.activitiesCompleted || 1;
                  const totalActivities = session.totalActivities || 3;
                  const participantCount = session.participantCount || 0;
                  const progressPercentage = totalActivities > 0 
                    ? (activitiesCompleted / totalActivities) * 100 
                    : 0;
                  
                  // Determine status badge
                  const getStatusBadge = () => {
                    if (session.status === 'playing') {
                      return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <Radio className="w-3 h-3 fill-current" />
                          Live
                        </span>
                      );
                    } else if (session.status === 'open') {
                      return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          <Clock className="w-3 h-3" />
                          Paused
                        </span>
                      );
                    } else {
                      return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          Completed
                        </span>
                      );
                    }
                  };

                  return (
                    <div
                      key={session.id}
                      className="group hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleSessionClick(session.id)}
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                          {/* Left side: Icon and Details */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 text-xs font-semibold">
                                {tool?.name?.charAt(0) || 'S'}
                              </span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              {/* Title and Status */}
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {session.title}
                                </h3>
                                {getStatusBadge()}
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                  {tool?.name || session.tool_type}
                                </span>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="mb-2">
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all ${
                                      session.status === 'results' 
                                        ? 'bg-green-500' 
                                        : session.status === 'playing'
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
                                    {activitiesCompleted}/{totalActivities}
                                  </span>
                                  <span>activities completed</span>
                                </span>
                                <span>·</span>
                                <span className="inline-flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{participantCount} {participantCount === 1 ? 'participant' : 'participants'}</span>
                                </span>
                                {session.lastActivity && (
                                  <>
                                    <span>·</span>
                                    <span>
                                      Last activity: <span className="font-medium text-gray-900">{session.lastActivity}</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Right side: Action Button */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSessionClick(session.id);
                              }}
                            >
                              {session.status === 'results' ? 'View' : 'Resume'} 
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateModal
        type="session"
        workshopId={workshopId}
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchWorkshop(); // Refresh sessions list
        }}
      />
    </AppLayout>
  );
}
