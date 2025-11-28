'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { SessionProgress } from '@/components/SessionProgress';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft, RotateCcw, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Item {
    id: string;
    title: string;
    description: string;
    tag: 'problem' | 'idea' | 'task';
}

const TOTAL_VOTES = 5;

export default function VotingPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.id as string;

    const [items, setItems] = useState<Item[]>([]);
    const [votes, setVotes] = useState<Record<string, number>>({});
    const [showResults, setShowResults] = useState(false);

    // Load items and votes from localStorage
    useEffect(() => {
        const storedItems = localStorage.getItem(`session_${sessionId}_items`);
        if (storedItems) {
            const parsedItems = JSON.parse(storedItems);
            setItems(parsedItems);

            // Initialize votes
            const initialVotes: Record<string, number> = {};
            parsedItems.forEach((item: Item) => {
                initialVotes[item.id] = 0;
            });

            // Load saved votes if any
            const storedVotes = localStorage.getItem(`session_${sessionId}_votes`);
            if (storedVotes) {
                const parsedVotes = JSON.parse(storedVotes);
                setVotes({ ...initialVotes, ...parsedVotes });
            } else {
                setVotes(initialVotes);
            }
        }
    }, [sessionId]);

    const remainingVotes = TOTAL_VOTES - Object.values(votes).reduce((sum, count) => sum + count, 0);

    const handleVote = (itemId: string) => {
        if (remainingVotes > 0) {
            const newVotes = {
                ...votes,
                [itemId]: votes[itemId] + 1,
            };
            setVotes(newVotes);
            localStorage.setItem(`session_${sessionId}_votes`, JSON.stringify(newVotes));
        }
    };

    const handleRemoveVote = (itemId: string) => {
        if (votes[itemId] > 0) {
            const newVotes = {
                ...votes,
                [itemId]: votes[itemId] - 1,
            };
            setVotes(newVotes);
            localStorage.setItem(`session_${sessionId}_votes`, JSON.stringify(newVotes));
        }
    };

    const handleClearVotes = () => {
        const clearedVotes: Record<string, number> = {};
        items.forEach(item => {
            clearedVotes[item.id] = 0;
        });
        setVotes(clearedVotes);
        localStorage.setItem(`session_${sessionId}_votes`, JSON.stringify(clearedVotes));
    };

    const handleEndVoting = () => {
        setShowResults(true);
    };

    const handleNext = () => {
        router.push(`/session/${sessionId}/prioritisation`);
    };

    const handleSkip = () => {
        router.push(`/session/${sessionId}/prioritisation`);
    };

    // Sort items by votes for results view
    const sortedItems = [...items].sort((a, b) => votes[b.id] - votes[a.id]);

    const tagColors = {
        problem: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
        idea: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
        task: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    };

    return (
        <AppLayout>
            <SessionProgress currentStep={4} totalSteps={6} />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href={`/session/${sessionId}/problem-framing`}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Problem Framing
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Dot Voting</h1>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600">
                            Vote on the items that matter most
                        </p>
                        {!showResults && (
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Votes Remaining</p>
                                    <p className="text-2xl font-bold text-blue-600">{remainingVotes} / {TOTAL_VOTES}</p>
                                </div>
                                {Object.values(votes).some(v => v > 0) && (
                                    <Button
                                        variant="ghost"
                                        onClick={handleClearVotes}
                                        className="flex items-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Clear All
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 mb-4">No items to vote on</p>
                        <Link href={`/session/${sessionId}/items`}>
                            <Button variant="primary">Add Items First</Button>
                        </Link>
                    </div>
                ) : !showResults ? (
                    <>
                        {/* Voting Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {items.map((item, index) => {
                                const itemVotes = votes[item.id] || 0;
                                const hasVotes = itemVotes > 0;

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`bg-white rounded-xl border-2 p-5 transition-all ${
                                            hasVotes
                                                ? 'border-blue-600 shadow-lg'
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tagColors[item.tag].bg} ${tagColors[item.tag].text}`}>
                                                {item.tag}
                                            </span>
                                            {hasVotes && (
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: itemVotes }).map((_, i) => (
                                                        <div key={i} className="w-2 h-2 rounded-full bg-blue-600" />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                        {item.description && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="primary"
                                                onClick={() => handleVote(item.id)}
                                                disabled={remainingVotes === 0}
                                                className="flex-1"
                                            >
                                                Vote
                                            </Button>
                                            {hasVotes && (
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handleRemoveVote(item.id)}
                                                    className="px-3"
                                                >
                                                    −
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* End Voting Button */}
                        <div className="flex justify-center">
                            <Button
                                variant="primary"
                                onClick={handleEndVoting}
                                disabled={Object.values(votes).every(v => v === 0)}
                                className="px-8 py-3"
                            >
                                End Voting & See Results
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Results View */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Voting Results</h2>
                            <div className="space-y-4">
                                {sortedItems.map((item, index) => {
                                    const itemVotes = votes[item.id] || 0;
                                    const percentage = (itemVotes / TOTAL_VOTES) * 100;
                                    const isTop = index < 3 && itemVotes > 0;

                                    return (
                                        <div key={item.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {isTop && (
                                                        <Crown className={`w-5 h-5 ${
                                                            index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-600'
                                                        }`} />
                                                    )}
                                                    <span className="font-semibold text-gray-900">{item.title}</span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${tagColors[item.tag].bg} ${tagColors[item.tag].text}`}>
                                                        {item.tag}
                                                    </span>
                                                </div>
                                                <span className="text-lg font-bold text-gray-900">{itemVotes} votes</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button
                                variant="secondary"
                                onClick={() => setShowResults(false)}
                            >
                                Back to Voting
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleNext}
                                className="px-6 flex items-center gap-2"
                            >
                                Next: Prioritisation
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                )}

                {/* Actions */}
                {items.length > 0 && !showResults && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleSkip}
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Skip Voting
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
