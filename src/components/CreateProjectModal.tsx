import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { sanitizeString } from '@/lib/utils/validation';
import { copyToClipboard, getSessionLink } from '@/lib/utils/helpers';
import { ROUTES } from '@/lib/constants';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        projectName: '',
        hostName: '',
        firstFeature: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.projectName.trim()) newErrors.projectName = 'Project name is required';
        if (!formData.hostName.trim()) newErrors.hostName = 'Host name is required';
        if (!formData.firstFeature.trim()) newErrors.firstFeature = 'At least one feature is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const response = await fetch('/api/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hostName: sanitizeString(formData.hostName),
                    projectName: sanitizeString(formData.projectName),
                    features: [{
                        title: sanitizeString(formData.firstFeature),
                        description: '',
                        effort: undefined,
                        impact: undefined
                    }],
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create session');
            }

            // Store host token and player ID
            localStorage.setItem(`host_token_${data.sessionId}`, data.hostToken);
            localStorage.setItem(`player_id_${data.sessionId}`, data.playerId);

            // Copy link to clipboard
            const sessionLink = getSessionLink(data.sessionId);
            await copyToClipboard(sessionLink);
            showToast('Project created! Link copied to clipboard', 'success');

            // Redirect to lobby
            router.push(ROUTES.LOBBY(data.sessionId));
            onClose();

        } catch (error) {
            console.error('Error creating session:', error);
            showToast(
                error instanceof Error ? error.message : 'Failed to create session',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Project Name"
                                    placeholder="e.g., Q4 Roadmap"
                                    value={formData.projectName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                                    error={errors.projectName}
                                    autoFocus
                                />

                                <Input
                                    label="Your Name"
                                    placeholder="e.g., Alex"
                                    value={formData.hostName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hostName: e.target.value }))}
                                    error={errors.hostName}
                                />

                                <Input
                                    label="First Feature to Prioritize"
                                    placeholder="e.g., User Authentication"
                                    value={formData.firstFeature}
                                    onChange={(e) => setFormData(prev => ({ ...prev, firstFeature: e.target.value }))}
                                    error={errors.firstFeature}
                                />

                                <div className="flex gap-3 justify-end mt-8 pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isLoading={loading}
                                    >
                                        Create Project
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
