'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { SessionProgress } from '@/components/SessionProgress';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft, Settings2 } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import Link from 'next/link';
import { REACH_PRESETS, IMPACT_OPTIONS, calculateRICEScore, normalizeToHours, type EffortUnit } from '@/types';

interface Item {
    id: string;
    title: string;
    description: string;
    tag: 'problem' | 'idea' | 'task';
}

interface RICEData {
    reach: number;
    impact: number;
    confidence: number;
    effort: number;
    effortUnit: EffortUnit;
    score: number;
}

interface MoSCoWData {
    must: string[];
    should: string[];
    could: string[];
    wont: string[];
}

type Mode = 'rice' | 'moscow';

export default function PrioritisationPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.id as string;

    const [items, setItems] = useState<Item[]>([]);
    const [mode, setMode] = useState<Mode>('rice');
    const [limitsEnabled, setLimitsEnabled] = useState(false);

    // RICE state
    const [riceData, setRiceData] = useState<Record<string, RICEData>>({});
    const [customReach, setCustomReach] = useState<Record<string, number>>({});

    // MoSCoW state
    const [moscowData, setMoscowData] = useState<MoSCoWData>({
        must: [],
        should: [],
        could: [],
        wont: [],
    });

    // Load data from localStorage
    useEffect(() => {
        const storedItems = localStorage.getItem(`session_${sessionId}_items`);
        if (storedItems) {
            const parsedItems = JSON.parse(storedItems);
            setItems(parsedItems);

            // Initialize RICE data
            const initialRice: Record<string, RICEData> = {};
            parsedItems.forEach((item: Item) => {
                initialRice[item.id] = {
                    reach: 100,
                    impact: 3,
                    confidence: 80,
                    effort: 1,
                    effortUnit: 'weeks' as EffortUnit,
                    score: 0,
                };
            });

            // Load saved data if any
            const storedPrioritisation = localStorage.getItem(`session_${sessionId}_prioritisation`);
            if (storedPrioritisation) {
                const parsed = JSON.parse(storedPrioritisation);
                if (parsed.mode) {
                    setMode(parsed.mode);
                }
                if (parsed.rice) {
                    setRiceData({ ...initialRice, ...parsed.rice });
                }
                if (parsed.moscow) {
                    setMoscowData(parsed.moscow);
                } else {
                    // Initialize MoSCoW with all items in "could"
                    setMoscowData({
                        must: [],
                        should: [],
                        could: parsedItems.map((item: Item) => item.id),
                        wont: [],
                    });
                }
                if (parsed.limitsEnabled !== undefined) {
                    setLimitsEnabled(parsed.limitsEnabled);
                }
            } else {
                setRiceData(initialRice);
                // Initialize MoSCoW
                setMoscowData({
                    must: [],
                    should: [],
                    could: parsedItems.map((item: Item) => item.id),
                    wont: [],
                });
            }
        }
    }, [sessionId]);

    // Calculate RICE scores when data changes
    useEffect(() => {
        const updated = { ...riceData };
        let changed = false;

        Object.keys(updated).forEach(itemId => {
            const data = updated[itemId];
            const effortHours = normalizeToHours(data.effort, data.effortUnit);
            const newScore = calculateRICEScore(data.reach, data.impact, data.confidence, effortHours);
            if (data.score !== newScore) {
                updated[itemId] = { ...data, score: newScore };
                changed = true;
            }
        });

        if (changed) {
            setRiceData(updated);
        }
    }, [riceData]);

    // Save to localStorage
    const savePrioritisation = () => {
        const data = {
            mode,
            rice: riceData,
            moscow: moscowData,
            limitsEnabled,
        };
        localStorage.setItem(`session_${sessionId}_prioritisation`, JSON.stringify(data));
    };

    useEffect(() => {
        savePrioritisation();
    }, [riceData, moscowData, mode, limitsEnabled]);

    const handleRICEChange = (itemId: string, field: keyof RICEData, value: number | string) => {
        setRiceData(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [field]: value,
            },
        }));
    };

    const handleNext = () => {
        router.push(`/session/${sessionId}/summary`);
    };

    // Get sorted items by RICE score
    const sortedRiceItems = [...items].sort((a, b) => {
        const scoreA = riceData[a.id]?.score || 0;
        const scoreB = riceData[b.id]?.score || 0;
        return scoreB - scoreA;
    });

    const tagColors = {
        problem: { bg: 'bg-red-100', text: 'text-red-700' },
        idea: { bg: 'bg-blue-100', text: 'text-blue-700' },
        task: { bg: 'bg-green-100', text: 'text-green-700' },
    };

    const categoryColors = {
        must: { bg: 'bg-red-50', border: 'border-red-200', title: 'text-red-700' },
        should: { bg: 'bg-orange-50', border: 'border-orange-200', title: 'text-orange-700' },
        could: { bg: 'bg-yellow-50', border: 'border-yellow-200', title: 'text-yellow-700' },
        wont: { bg: 'bg-gray-50', border: 'border-gray-200', title: 'text-gray-700' },
    };

    const getScoreColor = (score: number) => {
        if (score >= 50) return 'text-green-600 bg-green-50';
        if (score >= 20) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <AppLayout>
            <SessionProgress currentStep={5} totalSteps={6} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href={`/session/${sessionId}/voting`}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Voting
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Prioritisation</h1>
                    <p className="text-gray-600">Choose a framework to prioritize your items</p>
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setMode('rice')}
                            className={`px-6 py-2 rounded-md font-medium transition-all ${
                                mode === 'rice'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            RICE Framework
                        </button>
                        <button
                            onClick={() => setMode('moscow')}
                            className={`px-6 py-2 rounded-md font-medium transition-all ${
                                mode === 'moscow'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            MoSCoW Method
                        </button>
                    </div>

                    {mode === 'moscow' && (
                        <div className="flex items-center gap-3 ml-auto">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={limitsEnabled}
                                    onChange={(e) => setLimitsEnabled(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Enforce Limits</span>
                            </label>
                            {limitsEnabled && (
                                <span className="text-xs text-gray-500">(Max 3 in Must Have)</span>
                            )}
                        </div>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 mb-4">No items to prioritize</p>
                        <Link href={`/session/${sessionId}/items`}>
                            <Button variant="primary">Add Items First</Button>
                        </Link>
                    </div>
                ) : mode === 'rice' ? (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Item</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">Reach</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">Impact</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Confidence</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">Effort</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {sortedRiceItems.map((item, index) => {
                                        const data = riceData[item.id];
                                        if (!data) return null;

                                        const isCustomReach = data.reach === -1;

                                        return (
                                            <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{item.title}</p>
                                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${tagColors[item.tag].bg} ${tagColors[item.tag].text}`}>
                                                            {item.tag}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {!isCustomReach ? (
                                                        <select
                                                            value={data.reach}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                handleRICEChange(item.id, 'reach', val);
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            {REACH_PRESETS.map(preset => (
                                                                <option key={preset.value} value={preset.value}>
                                                                    {preset.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="number"
                                                                value={customReach[item.id] || data.reach}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 0;
                                                                    setCustomReach(prev => ({ ...prev, [item.id]: val }));
                                                                    handleRICEChange(item.id, 'reach', val);
                                                                }}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="Enter number"
                                                            />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={data.impact}
                                                        onChange={(e) => handleRICEChange(item.id, 'impact', parseInt(e.target.value))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        {IMPACT_OPTIONS.map(option => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={data.confidence}
                                                            onChange={(e) => handleRICEChange(item.id, 'confidence', parseInt(e.target.value) || 0)}
                                                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-600">%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.5"
                                                            value={data.effort}
                                                            onChange={(e) => handleRICEChange(item.id, 'effort', parseFloat(e.target.value) || 0)}
                                                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                        <select
                                                            value={data.effortUnit}
                                                            onChange={(e) => handleRICEChange(item.id, 'effortUnit', e.target.value)}
                                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="hours">Hours</option>
                                                            <option value="days">Days</option>
                                                            <option value="weeks">Weeks</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-3 py-1 rounded-lg font-bold text-lg ${getScoreColor(data.score)}`}>
                                                        {data.score.toFixed(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(Object.keys(categoryColors) as Array<keyof typeof categoryColors>).map(category => {
                            const categoryItems = moscowData[category];
                            const canAddMore = !limitsEnabled || category !== 'must' || categoryItems.length < 3;

                            return (
                                <div key={category} className={`rounded-xl border-2 ${categoryColors[category].border} ${categoryColors[category].bg} p-4`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`font-bold text-lg capitalize ${categoryColors[category].title}`}>
                                            {category === 'wont' ? "Won't Have" : `${category} Have`}
                                        </h3>
                                        <span className="text-sm font-semibold text-gray-600">
                                            {categoryItems.length}
                                        </span>
                                    </div>

                                    <Reorder.Group
                                        axis="y"
                                        values={categoryItems}
                                        onReorder={(newOrder) => {
                                            setMoscowData(prev => ({
                                                ...prev,
                                                [category]: newOrder,
                                            }));
                                        }}
                                        className="space-y-2 min-h-[200px]"
                                    >
                                        {categoryItems.map(itemId => {
                                            const item = items.find(i => i.id === itemId);
                                            if (!item) return null;

                                            return (
                                                <Reorder.Item key={itemId} value={itemId}>
                                                    <motion.div
                                                        layout
                                                        className="bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                                                        whileDrag={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                                    >
                                                        <p className="font-medium text-sm text-gray-900 mb-1">{item.title}</p>
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tagColors[item.tag].bg} ${tagColors[item.tag].text}`}>
                                                            {item.tag}
                                                        </span>
                                                    </motion.div>
                                                </Reorder.Item>
                                            );
                                        })}
                                    </Reorder.Group>

                                    {categoryItems.length === 0 && (
                                        <div className="text-center py-8 text-gray-400 text-sm">
                                            Drag items here
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Actions */}
                {items.length > 0 && (
                    <div className="flex items-center justify-end mt-8 pt-6 border-t border-gray-200">
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            className="px-6 py-2.5 flex items-center gap-2"
                        >
                            Next: Summary
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
