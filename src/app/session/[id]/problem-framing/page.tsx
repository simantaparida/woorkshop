'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { SessionProgress } from '@/components/SessionProgress';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Item {
    id: string;
    title: string;
    description: string;
    tag: 'problem' | 'idea' | 'task';
}

interface ProblemFraming {
    coreProblem: string;
    whoFaces: string;
    whyMatters: string;
    blockedOutcome: string;
}

export default function ProblemFramingPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.id as string;

    const [items, setItems] = useState<Item[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [framingData, setFramingData] = useState<Record<string, ProblemFraming>>({});

    // Form state for current item
    const [coreProblem, setCoreProblem] = useState('');
    const [whoFaces, setWhoFaces] = useState('');
    const [whyMatters, setWhyMatters] = useState('');
    const [blockedOutcome, setBlockedOutcome] = useState('');

    // Load items and framing data from localStorage
    useEffect(() => {
        const storedItems = localStorage.getItem(`session_${sessionId}_items`);
        if (storedItems) {
            const parsedItems = JSON.parse(storedItems);
            setItems(parsedItems);
            // Auto-select first item if none selected
            if (parsedItems.length > 0 && !selectedItemId) {
                setSelectedItemId(parsedItems[0].id);
            }
        }

        const storedFraming = localStorage.getItem(`session_${sessionId}_framing`);
        if (storedFraming) {
            setFramingData(JSON.parse(storedFraming));
        }
    }, [sessionId]);

    // Load form data when item is selected
    useEffect(() => {
        if (selectedItemId && framingData[selectedItemId]) {
            const data = framingData[selectedItemId];
            setCoreProblem(data.coreProblem);
            setWhoFaces(data.whoFaces);
            setWhyMatters(data.whyMatters);
            setBlockedOutcome(data.blockedOutcome);
        } else {
            // Clear form for new item
            setCoreProblem('');
            setWhoFaces('');
            setWhyMatters('');
            setBlockedOutcome('');
        }
    }, [selectedItemId, framingData]);

    const handleSave = () => {
        if (!selectedItemId) return;

        const newFramingData = {
            ...framingData,
            [selectedItemId]: {
                coreProblem,
                whoFaces,
                whyMatters,
                blockedOutcome,
            },
        };
        setFramingData(newFramingData);
        localStorage.setItem(`session_${sessionId}_framing`, JSON.stringify(newFramingData));
    };

    const handleSelectItem = (itemId: string) => {
        // Save current item before switching
        if (selectedItemId && (coreProblem || whoFaces || whyMatters || blockedOutcome)) {
            handleSave();
        }
        setSelectedItemId(itemId);
    };

    const handleNext = () => {
        // Save current item
        if (selectedItemId && (coreProblem || whoFaces || whyMatters || blockedOutcome)) {
            handleSave();
        }
        router.push(`/session/${sessionId}/voting`);
    };

    const handleSkip = () => {
        router.push(`/session/${sessionId}/voting`);
    };

    const framedCount = Object.keys(framingData).length;
    const selectedItem = items.find(item => item.id === selectedItemId);

    const tagColors = {
        problem: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
        idea: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
        task: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    };

    return (
        <AppLayout>
            <SessionProgress currentStep={3} totalSteps={6} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href={`/session/${sessionId}/items`}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Items
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Problem Framing</h1>
                    <p className="text-gray-600">
                        Define the problem before jumping to solutions • {framedCount} of {items.length} framed
                    </p>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 mb-4">No items to frame</p>
                        <Link href={`/session/${sessionId}/items`}>
                            <Button variant="primary">Add Items First</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Item List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 sticky top-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                                {items.map((item) => {
                                    const isSelected = selectedItemId === item.id;
                                    const isFramed = !!framingData[item.id];
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelectItem(item.id)}
                                            className={`w-full text-left p-3 rounded-lg transition-all ${
                                                isSelected
                                                    ? 'bg-blue-50 border-2 border-blue-600'
                                                    : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <span className="font-medium text-sm text-gray-900">{item.title}</span>
                                                {isFramed && (
                                                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                )}
                                            </div>
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tagColors[item.tag].bg} ${tagColors[item.tag].text}`}>
                                                {item.tag}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right: Framing Form */}
                        <div className="lg:col-span-2">
                            {selectedItem ? (
                                <motion.div
                                    key={selectedItemId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
                                >
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedItem.title}</h2>
                                        {selectedItem.description && (
                                            <p className="text-gray-600 text-sm">{selectedItem.description}</p>
                                        )}
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                1. What is the core problem?
                                            </label>
                                            <textarea
                                                value={coreProblem}
                                                onChange={(e) => setCoreProblem(e.target.value)}
                                                placeholder="Describe the fundamental problem..."
                                                rows={3}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                2. Who faces this problem?
                                            </label>
                                            <textarea
                                                value={whoFaces}
                                                onChange={(e) => setWhoFaces(e.target.value)}
                                                placeholder="Which users or groups are affected..."
                                                rows={3}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                3. Why does it matter?
                                            </label>
                                            <textarea
                                                value={whyMatters}
                                                onChange={(e) => setWhyMatters(e.target.value)}
                                                placeholder="What's the impact if we don't solve this..."
                                                rows={3}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                4. What outcome is blocked?
                                            </label>
                                            <textarea
                                                value={blockedOutcome}
                                                onChange={(e) => setBlockedOutcome(e.target.value)}
                                                placeholder="What can't users achieve because of this..."
                                                rows={3}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-colors"
                                            />
                                        </div>

                                        <Button
                                            variant="secondary"
                                            onClick={handleSave}
                                            className="w-full"
                                        >
                                            Save Framing
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                    <p className="text-gray-500">Select an item to start framing</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                {items.length > 0 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleSkip}
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Skip Problem Framing
                        </button>
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            disabled={framedCount === 0}
                            className="px-6 py-2.5 flex items-center gap-2"
                        >
                            Next: Voting
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
