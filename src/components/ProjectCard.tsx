import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatTimeRemaining, isSessionExpired } from '@/lib/constants/session-durations';

interface ProjectCardProps {
    project: {
        sessionId: string;
        projectName?: string;
        hostName?: string;
        status?: string;
        expiresAt?: string | null;
        isHost?: boolean;
    };
    onOpen: (sessionId: string) => void;
    onDelete: (e: React.MouseEvent) => void;
}

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
    const isExpired = project.expiresAt ? isSessionExpired(project.expiresAt) : false;

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'open': return 'bg-yellow-100 text-yellow-700';
            case 'playing': return 'bg-green-100 text-green-700';
            case 'results': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'open': return 'Waiting';
            case 'playing': return 'In Progress';
            case 'results': return 'Completed';
            default: return 'Unknown';
        }
    };

    return (
        <Card
            hover
            className="group relative flex flex-col h-full"
            onClick={() => onOpen(project.sessionId)}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <motion.div
                        className="w-3 h-3 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 shadow-sm"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <h3 className="font-semibold text-gray-900 truncate max-w-[200px]" title={project.projectName}>
                        {project.projectName || 'Untitled Project'}
                    </h3>
                </div>
                {project.isHost && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
                        Host
                    </span>
                )}
            </div>

            <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Host</span>
                    <span className="text-gray-900 font-medium truncate max-w-[120px]">
                        {project.hostName || 'Unknown'}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Expires</span>
                    {project.expiresAt ? (
                        <span className={`flex items-center gap-1 text-xs font-medium ${isExpired ? 'text-red-600' : 'text-amber-600'
                            }`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTimeRemaining(project.expiresAt)}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-400">No limit</span>
                    )}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpen(project.sessionId);
                    }}
                >
                    {project.status === 'results' ? 'View Results' : 'Resume'}
                </Button>
                <button
                    onClick={onDelete}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Project"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </Card>
    );
}
