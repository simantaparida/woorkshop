'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft, Crown, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Item {
    id: string;
    title: string;
    description: string;
}

const TOTAL_POINTS = 100;

export default function VotingBoardSessionPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.id as string;

    const [items, setItems] = useState<Item[]>([]);
    const [points, setPoints] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [sessionData, setSessionData] = useState<any>(null);
    const [votingStarted, setVotingStarted] = useState(false);
    const [participantName, setParticipantName] = useState('');
    const [hasEnteredName, setHasEnteredName] = useState(false);

    // Add item form
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    const [isAddingItem, setIsAddingItem] = useState(false);

    // Load session data and items
    useEffect(() => {
        const storedData = localStorage.getItem(`voting_${sessionId}_data`);
        if (storedData) {
            setSessionData(JSON.parse(storedData));
        }

        const storedItems = localStorage.getItem(`voting_${sessionId}_items`);
        if (storedItems) {
            const parsedItems = JSON.parse(storedItems);
            setItems(parsedItems);

            // Initialize points
            const initialPoints: Record<string, number> = {};
            parsedItems.forEach((item: Item) => {
                initialPoints[item.id] = 0;
            });

            const storedPoints = localStorage.getItem(`voting_${sessionId}_points`);
            if (storedPoints) {
                const parsedPoints = JSON.parse(storedPoints);
                setPoints({ ...initialPoints, ...parsedPoints });
            } else {
                setPoints(initialPoints);
            }

            const isSubmitted = localStorage.getItem(`voting_${sessionId}_submitted`) === 'true';
            setSubmitted(isSubmitted);

            // Check if voting was started
            const hasStarted = localStorage.getItem(`voting_${sessionId}_started`) === 'true';
            setVotingStarted(hasStarted);

            // Load participant name
            const storedName = localStorage.getItem(`voting_${sessionId}_participant_name`);
            if (storedName) {
                setParticipantName(storedName);
                setHasEnteredName(true);
            }
        }
    }, [sessionId]);

    const handleAddItem = () => {
        if (newItemTitle.trim()) {
            const newItem: Item = {
                id: `item_${Date.now()}`,
                title: newItemTitle.trim(),
                description: newItemDescription.trim(),
            };

            const updatedItems = [...items, newItem];
            setItems(updatedItems);
            localStorage.setItem(`voting_${sessionId}_items`, JSON.stringify(updatedItems));

            // Initialize points for new item
            setPoints({ ...points, [newItem.id]: 0 });

            // Reset form
            setNewItemTitle('');
            setNewItemDescription('');
            setIsAddingItem(false);
        }
    };

    const handleDeleteItem = (itemId: string) => {
        const updatedItems = items.filter(item => item.id !== itemId);
        setItems(updatedItems);
        localStorage.setItem(`voting_${sessionId}_items`, JSON.stringify(updatedItems));

        // Remove points for deleted item
        const { [itemId]: _, ...remainingPoints } = points;
        setPoints(remainingPoints);
    };

    const handleStartVoting = () => {
        if (items.length > 0) {
            setVotingStarted(true);
            setShowResults(false);
            setSubmitted(false);
            localStorage.setItem(`voting_${sessionId}_started`, 'true');
        }
    };

    const totalAllocated = Object.values(points).reduce((sum, count) => sum + count, 0);
    const remainingPoints = TOTAL_POINTS - totalAllocated;
    const canSubmit = totalAllocated === TOTAL_POINTS && !submitted;

    const handlePointChange = (itemId: string, value: string) => {
        if (submitted) return;

        const numValue = parseInt(value) || 0;
        const clampedValue = Math.max(0, Math.min(100, numValue));

        const newPoints = {
            ...points,
            [itemId]: clampedValue,
        };
        setPoints(newPoints);
        localStorage.setItem(`voting_${sessionId}_points`, JSON.stringify(newPoints));
    };

    const handleIncrement = (itemId: string) => {
        if (submitted || remainingPoints <= 0) return;

        const newPoints = {
            ...points,
            [itemId]: (points[itemId] || 0) + 1,
        };
        setPoints(newPoints);
        localStorage.setItem(`voting_${sessionId}_points`, JSON.stringify(newPoints));
    };

    const handleDecrement = (itemId: string) => {
        if (submitted || points[itemId] <= 0) return;

        const newPoints = {
            ...points,
            [itemId]: points[itemId] - 1,
        };
        setPoints(newPoints);
        localStorage.setItem(`voting_${sessionId}_points`, JSON.stringify(newPoints));
    };

    const handleSubmit = () => {
        if (canSubmit) {
            setSubmitted(true);
            localStorage.setItem(`voting_${sessionId}_submitted`, 'true');
        }
    };

    const handleEndScoring = () => {
        setShowResults(true);
    };

    const sortedItems = [...items].sort((a, b) => points[b.id] - points[a.id]);

    // Show participant name entry if voting has started but user hasn't entered name
    if (votingStarted && !hasEnteredName) {
        return (
            <AppLayout>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Join Voting Session
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {sessionData?.title || 'Voting Board'}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    value={participantName}
                                    onChange={(e) => setParticipantName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && participantName.trim()) {
                                            setHasEnteredName(true);
                                            localStorage.setItem(`voting_${sessionId}_participant_name`, participantName.trim());
                                        }
                                    }}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                                    autoFocus
                                />
                            </div>

                            <Button
                                variant="primary"
                                onClick={() => {
                                    if (participantName.trim()) {
                                        setHasEnteredName(true);
                                        localStorage.setItem(`voting_${sessionId}_participant_name`, participantName.trim());
                                    }
                                }}
                                disabled={!participantName.trim()}
                                className="w-full py-3"
                            >
                                Join Session
                            </Button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Show items management view
    if (items.length === 0 || !votingStarted) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <Link
                            href="/tools"
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Tools
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {sessionData?.title || 'Voting Board'}
                        </h1>
                        {sessionData?.description && (
                            <p className="text-gray-600 mb-4">{sessionData.description}</p>
                        )}

                        {/* Share Link */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                            <p className="text-sm font-medium text-blue-900 mb-2">Share this link with participants:</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/voting-board/${sessionId}`}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-mono"
                                />
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/voting-board/${sessionId}`);
                                        alert('Link copied to clipboard!');
                                    }}
                                    className="whitespace-nowrap"
                                >
                                    Copy Link
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Items to Vote On</h2>

                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg mb-3"
                            >
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                                    {item.description && (
                                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-red-600 hover:text-red-700 p-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}

                        {isAddingItem ? (
                            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                                <input
                                    type="text"
                                    value={newItemTitle}
                                    onChange={(e) => setNewItemTitle(e.target.value)}
                                    placeholder="Item title *"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    autoFocus
                                />
                                <textarea
                                    value={newItemDescription}
                                    onChange={(e) => setNewItemDescription(e.target.value)}
                                    placeholder="Description (optional)"
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        variant="primary"
                                        onClick={handleAddItem}
                                        disabled={!newItemTitle.trim()}
                                        className="flex-1"
                                    >
                                        Add Item
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setIsAddingItem(false);
                                            setNewItemTitle('');
                                            setNewItemDescription('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingItem(true)}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Item
                            </button>
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="flex justify-end">
                            <Button
                                variant="primary"
                                onClick={handleStartVoting}
                                className="px-6 flex items-center gap-2"
                            >
                                Start Voting
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </AppLayout>
        );
    }

    // Show voting/results view
    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Link
                        href="/tools"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Tools
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {sessionData?.title || 'Voting Board'}
                    </h1>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600">
                                Allocate 100 points across items to indicate effort scoring
                            </p>
                            {participantName && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Voting as: <span className="font-medium text-gray-700">{participantName}</span>
                                </p>
                            )}
                        </div>
                        {!showResults && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Points Remaining</p>
                                <p className={`text-2xl font-bold ${remainingPoints === 0 ? 'text-green-600' :
                                    remainingPoints < 0 ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                                    {remainingPoints} / {TOTAL_POINTS}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {!showResults && !submitted && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-blue-900 font-medium">Each participant gets 100 points to distribute</p>
                            <p className="text-sm text-blue-700 mt-1">Allocate points across items based on effort. You must use exactly 100 points to submit.</p>
                        </div>
                    </div>
                )}

                {submitted && !showResults && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
                        <p className="text-green-900 font-medium">✓ Scores Submitted</p>
                        <p className="text-sm text-green-700 mt-1">Waiting for others to complete their scoring...</p>
                    </div>
                )}

                {!showResults ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {items.map((item, index) => {
                                const itemPoints = points[item.id] || 0;
                                const hasPoints = itemPoints > 0;

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`bg-white rounded-xl border-2 p-5 transition-all ${submitted
                                            ? 'border-gray-200 opacity-75'
                                            : hasPoints
                                                ? 'border-blue-600 shadow-lg'
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900 flex-1">{item.title}</h3>
                                            {hasPoints && (
                                                <span className="text-lg font-bold text-blue-600 ml-2">
                                                    {itemPoints} pts
                                                </span>
                                            )}
                                        </div>

                                        {item.description && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDecrement(item.id)}
                                                disabled={submitted || itemPoints <= 0}
                                                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg font-bold"
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={itemPoints}
                                                onChange={(e) => handlePointChange(item.id, e.target.value)}
                                                disabled={submitted}
                                                className="flex-1 h-10 text-center border-2 border-gray-300 rounded-lg font-semibold text-lg focus:border-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                            <button
                                                onClick={() => handleIncrement(item.id)}
                                                disabled={submitted || remainingPoints <= 0}
                                                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {!submitted && totalAllocated > 0 && totalAllocated !== TOTAL_POINTS && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
                                <p className="text-yellow-900 font-medium">
                                    {remainingPoints > 0
                                        ? `You have ${remainingPoints} points remaining. Allocate all 100 points to submit.`
                                        : `You've allocated ${Math.abs(remainingPoints)} too many points. Total must equal 100.`
                                    }
                                </p>
                            </div>
                        )}

                        {!submitted && (
                            <div className="flex justify-center mb-6">
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={!canSubmit}
                                    className="px-8 py-3"
                                >
                                    {totalAllocated === TOTAL_POINTS ? 'Submit Scores' : `Submit (${totalAllocated}/100 points)`}
                                </Button>
                            </div>
                        )}

                        {submitted && (
                            <div className="flex justify-center">
                                <Button
                                    variant="primary"
                                    onClick={handleEndScoring}
                                    className="px-8 py-3"
                                >
                                    End Scoring & See Results
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Scoring Results</h2>
                            <div className="space-y-4">
                                {sortedItems.map((item, index) => {
                                    const itemPoints = points[item.id] || 0;
                                    const percentage = (itemPoints / TOTAL_POINTS) * 100;
                                    const isTop = index < 3 && itemPoints > 0;

                                    return (
                                        <div key={item.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {isTop && (
                                                        <Crown className={`w-5 h-5 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-600'
                                                            }`} />
                                                    )}
                                                    <span className="font-semibold text-gray-900">{item.title}</span>
                                                </div>
                                                <span className="text-lg font-bold text-gray-900">{itemPoints} points</span>
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

                            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                                <span>Total Participants: 1</span>
                                <span>Completed: {new Date().toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button
                                variant="secondary"
                                onClick={() => setShowResults(false)}
                            >
                                Back to Scoring
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => router.push('/tools')}
                                className="px-6 flex items-center gap-2"
                            >
                                Done
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
