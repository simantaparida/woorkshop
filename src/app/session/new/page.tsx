'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { SessionProgress } from '@/components/SessionProgress';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft, Edit2, FileText, Vote, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NewSessionPage() {
    const router = useRouter();
    const [title, setTitle] = useState('Untitled Workshop');
    const [description, setDescription] = useState('');
    const [sessionType, setSessionType] = useState<'problem_framing' | 'voting' | 'prioritisation'>('problem_framing');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        // Create session on mount
        const tempId = `session_${Date.now()}`;
        setSessionId(tempId);
    }, []);

    const handleAddItems = () => {
        if (sessionId) {
            // Save session data to localStorage
            const sessionData = {
                id: sessionId,
                title,
                description,
                sessionType,
                createdAt: new Date().toISOString(),
            };
            localStorage.setItem(`session_${sessionId}_data`, JSON.stringify(sessionData));

            // Navigate to items page
            router.push(`/session/${sessionId}/items`);
        }
    };

    const sessionTypes = [
        {
            value: 'problem_framing',
            label: 'Problem Framing',
            icon: FileText,
            description: 'Define problems before solutions'
        },
        {
            value: 'voting',
            label: 'Voting',
            icon: Vote,
            description: 'Voting Board (100-point scoring)'
        },
        {
            value: 'prioritisation',
            label: 'Prioritisation',
            icon: BarChart2,
            description: 'RICE or MoSCoW framework'
        },
    ];

    return (
        <AppLayout>
            <SessionProgress currentStep={1} totalSteps={6} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb Navigation */}
                <div className="mb-6">
                    <Link
                        href="/home"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Session</h1>
                    <p className="text-gray-600">Set up your workshop session and start collaborating</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-8"
                >
                    {/* Session Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Session Title *
                        </label>
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={() => setIsEditingTitle(false)}
                                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                                autoFocus
                                className="w-full text-2xl font-semibold text-gray-900 border-2 border-blue-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <div
                                onClick={() => setIsEditingTitle(true)}
                                className="flex items-center gap-3 cursor-pointer group px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                            >
                                <h2 className="text-2xl font-semibold text-gray-900 flex-1">{title}</h2>
                                <Edit2 className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Description <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this session about? Add context for participants..."
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-colors"
                        />
                    </div>

                    {/* Session Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Session Type *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {sessionTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected = sessionType === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        onClick={() => setSessionType(type.value as any)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                            ? 'border-blue-600 bg-blue-50 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'
                                                }`}>
                                                <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-semibold mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                    {type.label}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {type.description}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                        <Link
                            href="/home"
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Cancel
                        </Link>
                        <Button
                            variant="primary"
                            onClick={handleAddItems}
                            className="px-6 py-2.5 flex items-center gap-2"
                        >
                            Continue to Add Items
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}
