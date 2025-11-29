'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NewVotingBoardPage() {
    const router = useRouter();
    const [title, setTitle] = useState('Untitled Voting Session');
    const [description, setDescription] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        // Create session on mount
        const tempId = `voting_${Date.now()}`;
        setSessionId(tempId);
    }, []);

    const handleContinue = () => {
        if (sessionId) {
            // Save session data to localStorage
            const sessionData = {
                id: sessionId,
                title,
                description,
                type: 'voting-board',
                createdAt: new Date().toISOString(),
            };
            localStorage.setItem(`voting_${sessionId}_data`, JSON.stringify(sessionData));

            // Navigate to voting board
            router.push(`/voting-board/${sessionId}`);
        }
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href="/tools"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Tools
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Voting Board</h1>
                    <p className="text-gray-600">Set up a 100-point effort scoring session</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6"
                >
                    {/* Session Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Session Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Q1 Feature Prioritization"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Description <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What are you voting on? Add context for participants..."
                            rows={4}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-colors"
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Add items to vote on</li>
                            <li>• Each participant gets 100 points to distribute</li>
                            <li>• See ranked results based on total points</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <Link
                            href="/tools"
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Cancel
                        </Link>
                        <Button
                            variant="primary"
                            onClick={handleContinue}
                            disabled={!title.trim()}
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
