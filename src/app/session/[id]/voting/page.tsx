'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { SessionProgress } from '@/components/SessionProgress';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft, Crown, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Item {
    id: string;
    title: string;
    description: string;
    tag: 'problem' | 'idea' | 'task';
}

const TOTAL_POINTS = 100;

export default function VotingBoardPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.id as string;

    const [items, setItems] = useState<Item[]>([]);
    const [points, setPoints] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Load items and points from localStorage
    useEffect(() => {
        const storedItems = localStorage.getItem(`session_${sessionId}_items`);
        if (storedItems) {
            const parsedItems = JSON.parse(storedItems);
            setItems(parsedItems);

            // Initialize points
            const initialPoints: Record<string, number> = {};
            parsedItems.forEach((item: Item) => {
                initialPoints[item.id] = 0;
            });

            // Load saved points if any
            const storedPoints = localStorage.getItem(`session_${sessionId}_points`);
            if (storedPoints) {
                const parsedPoints = JSON.parse(storedPoints);
                setPoints({ ...initialPoints, ...parsedPoints });
            } else {
                setPoints(initialPoints);
            }

            // Check if already submitted
            const isSubmitted = localStorage.getItem(`session_${sessionId}_submitted`) === 'true';
            setSubmitted(isSubmitted);
        }
    }, [sessionId]);

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
        localStorage.setItem(`session_${sessionId}_points`, JSON.stringify(newPoints));
    };

    const handleIncrement = (itemId: string) => {
        if (submitted || remainingPoints <= 0) return;

        const newPoints = {
            ...points,
            [itemId]: (points[itemId] || 0) + 1,
        };
        setPoints(newPoints);
        localStorage.setItem(`session_${sessionId}_points`, JSON.stringify(newPoints));
    };

    const handleDecrement = (itemId: string) => {
        if (submitted || points[itemId] <= 0) return;

        const newPoints = {
            ...points,
            [itemId]: points[itemId] - 1,
        };
        setPoints(newPoints);
        localStorage.setItem(`session_${sessionId}_points`, JSON.stringify(newPoints));
    };

    const handleSubmit = () => {
        if (canSubmit) {
            setSubmitted(true);
            localStorage.setItem(`session_${sessionId}_submitted`, 'true');
        }
    };

    const handleEndScoring = () => {
        setShowResults(true);
    };

    const handleNext = () => {
        router.push(`/session/${sessionId}/prioritisation`);
    };

    const handleSkip = () => {
        router.push(`/session/${sessionId}/prioritisation`);
    };

    // Sort items by points for results view
    const sortedItems = [...items].sort((a, b) => points[b.id] - points[a.id]);

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
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Voting Board</h1>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600">
                            Allocate 100 points across items to indicate effort scoring
                        </p>
                        {!showResults && (
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Points Remaining</p>
                                    <p className={`text-2xl font-bold ${remainingPoints === 0 ? 'text-green-600' :
                                            remainingPoints < 0 ? 'text-red-600' : 'text-blue-600'
                                        }`}>
                                        {remainingPoints} / {TOTAL_POINTS}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Note */}
                {!showResults && !submitted && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-blue-900 font-medium">Each participant gets 100 points to distribute</p>
                            <p className="text-sm text-blue-700 mt-1">Allocate points across items based on effort. You must use exactly 100 points to submit.</p>
                        </div>
                    </div>
                )}

                {/* Submitted State */}
                {submitted && !showResults && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
                        <p className="text-green-900 font-medium">✓ Scores Submitted</p>
                        <p className="text-sm text-green-700 mt-1">Waiting for others to complete their scoring...</p>
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 mb-4">No items to score</p>
                        <Link href={`/session/${sessionId}/items`}>
                            <Button variant="primary">Add Items First</Button>
                        </Link>
                    </div>
                ) : !showResults ? (
                    <>
                        {/* Scoring Grid */}
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
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tagColors[item.tag].bg} ${tagColors[item.tag].text}`}>
                                                {item.tag}
                                            </span>
                                            {hasPoints && (
                                                <span className="text-lg font-bold text-blue-600">
                                                    {itemPoints} pts
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
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

                        {/* Validation Message */}
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

                        {/* Submit Button */}
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

                        {/* Facilitator: End Scoring Button */}
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
                        {/* Results View */}
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
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${tagColors[item.tag].bg} ${tagColors[item.tag].text}`}>
                                                        {item.tag}
                                                    </span>
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

                            {/* Summary Info */}
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
                {items.length > 0 && !showResults && !submitted && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleSkip}
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Skip Voting Board
                        </button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
