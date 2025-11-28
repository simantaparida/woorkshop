'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { SessionProgress } from '@/components/SessionProgress';
import { Button } from '@/components/ui/Button';
import { Download, Copy, Check, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

interface RICEData {
    reach: number;
    impact: number;
    confidence: number;
    effort: number;
    effortUnit: string;
    score: number;
}

export default function SummaryPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.id as string;

    const [sessionData, setSessionData] = useState<any>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [framingData, setFramingData] = useState<Record<string, ProblemFraming>>({});
    const [votes, setVotes] = useState<Record<string, number>>({});
    const [prioritisation, setPrioritisation] = useState<any>(null);
    const [decisionNotes, setDecisionNotes] = useState('');
    const [expandedFraming, setExpandedFraming] = useState<Record<string, boolean>>({});
    const [copied, setCopied] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        // Load all data from localStorage
        const session = localStorage.getItem(`session_${sessionId}_data`);
        const itemsData = localStorage.getItem(`session_${sessionId}_items`);
        const framing = localStorage.getItem(`session_${sessionId}_framing`);
        const votesData = localStorage.getItem(`session_${sessionId}_votes`);
        const prioritisationData = localStorage.getItem(`session_${sessionId}_prioritisation`);
        const notes = localStorage.getItem(`session_${sessionId}_notes`);

        if (session) setSessionData(JSON.parse(session));
        if (itemsData) setItems(JSON.parse(itemsData));
        if (framing) setFramingData(JSON.parse(framing));
        if (votesData) setVotes(JSON.parse(votesData));
        if (prioritisationData) setPrioritisation(JSON.parse(prioritisationData));
        if (notes) setDecisionNotes(notes);
    }, [sessionId]);

    const handleSaveNotes = () => {
        localStorage.setItem(`session_${sessionId}_notes`, decisionNotes);
    };

    const handleCopyToClipboard = () => {
        const markdown = generateMarkdown();
        navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const element = document.getElementById('summary-content');
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft > 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }

            pdf.save(`session-summary-${sessionId}.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
        } finally {
            setExporting(false);
        }
    };

    const handleFinish = () => {
        router.push('/home');
    };

    const generateMarkdown = () => {
        let markdown = `# ${sessionData?.title || 'Session Summary'}\n\n`;

        if (sessionData?.description) {
            markdown += `${sessionData.description}\n\n`;
        }

        markdown += `**Created:** ${new Date(sessionData?.createdAt).toLocaleDateString()}\n\n`;
        markdown += `---\n\n`;

        // Items
        markdown += `## Items (${items.length})\n\n`;
        items.forEach((item, i) => {
            markdown += `${i + 1}. **${item.title}** [${item.tag}]\n`;
            if (item.description) {
                markdown += `   ${item.description}\n`;
            }
            markdown += `\n`;
        });

        // Problem Framing
        const framedItems = Object.keys(framingData);
        if (framedItems.length > 0) {
            markdown += `## Problem Framing (${framedItems.length} items)\n\n`;
            framedItems.forEach(itemId => {
                const item = items.find(i => i.id === itemId);
                const framing = framingData[itemId];
                if (item && framing) {
                    markdown += `### ${item.title}\n\n`;
                    if (framing.coreProblem) markdown += `**Core Problem:** ${framing.coreProblem}\n\n`;
                    if (framing.whoFaces) markdown += `**Who Faces It:** ${framing.whoFaces}\n\n`;
                    if (framing.whyMatters) markdown += `**Why It Matters:** ${framing.whyMatters}\n\n`;
                    if (framing.blockedOutcome) markdown += `**Blocked Outcome:** ${framing.blockedOutcome}\n\n`;
                }
            });
        }

        // Voting Results
        const sortedByVotes = [...items].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));
        if (Object.keys(votes).length > 0) {
            markdown += `## Voting Results\n\n`;
            sortedByVotes.forEach((item, i) => {
                const voteCount = votes[item.id] || 0;
                markdown += `${i + 1}. ${item.title} - **${voteCount} votes**\n`;
            });
            markdown += `\n`;
        }

        // Prioritisation
        if (prioritisation) {
            if (prioritisation.mode === 'rice') {
                markdown += `## RICE Prioritisation\n\n`;
                const sortedByScore = [...items].sort((a, b) => {
                    const scoreA = prioritisation.rice[a.id]?.score || 0;
                    const scoreB = prioritisation.rice[b.id]?.score || 0;
                    return scoreB - scoreA;
                });
                sortedByScore.forEach((item, i) => {
                    const rice = prioritisation.rice[item.id];
                    if (rice) {
                        markdown += `${i + 1}. **${item.title}** - Score: ${rice.score.toFixed(1)}\n`;
                        markdown += `   - Reach: ${rice.reach}, Impact: ${rice.impact}, Confidence: ${rice.confidence}%, Effort: ${rice.effort} ${rice.effortUnit}\n\n`;
                    }
                });
            } else if (prioritisation.mode === 'moscow') {
                markdown += `## MoSCoW Prioritisation\n\n`;
                ['must', 'should', 'could', 'wont'].forEach(category => {
                    const categoryItems = prioritisation.moscow[category] || [];
                    if (categoryItems.length > 0) {
                        markdown += `### ${category === 'wont' ? "Won't Have" : `${category} Have`} (${categoryItems.length})\n\n`;
                        categoryItems.forEach((itemId: string) => {
                            const item = items.find(i => i.id === itemId);
                            if (item) {
                                markdown += `- ${item.title}\n`;
                            }
                        });
                        markdown += `\n`;
                    }
                });
            }
        }

        // Decision Notes
        if (decisionNotes) {
            markdown += `## Final Decision\n\n${decisionNotes}\n`;
        }

        return markdown;
    };

    const sortedByVotes = [...items].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));

    const tagColors = {
        problem: { bg: 'bg-red-100', text: 'text-red-700' },
        idea: { bg: 'bg-blue-100', text: 'text-blue-700' },
        task: { bg: 'bg-green-100', text: 'text-green-700' },
    };

    return (
        <AppLayout>
            <SessionProgress currentStep={6} totalSteps={6} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Summary</h1>
                    <p className="text-gray-600">Review and export your session results</p>
                </div>

                {/* Export Actions */}
                <div className="flex gap-3 mb-8">
                    <Button
                        variant="secondary"
                        onClick={handleCopyToClipboard}
                        className="flex items-center gap-2"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleExportPDF}
                        disabled={exporting}
                        isLoading={exporting}
                        className="flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export as PDF
                    </Button>
                </div>

                {/* Summary Content */}
                <div id="summary-content" className="space-y-6 bg-white p-8 rounded-xl border border-gray-200">
                    {/* Session Overview */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{sessionData?.title}</h2>
                        {sessionData?.description && (
                            <p className="text-gray-600 mb-3">{sessionData.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Created: {sessionData?.createdAt && new Date(sessionData.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="capitalize">Type: {sessionData?.sessionType?.replace('_', ' ')}</span>
                        </div>
                    </div>

                    {/* Items Summary */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Items ({items.length})</h3>
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tagColors[item.tag].bg} ${tagColors[item.tag].text}`}>
                                        {item.tag}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{item.title}</p>
                                        {item.description && (
                                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Problem Framing Results */}
                    {Object.keys(framingData).length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Problem Framing ({Object.keys(framingData).length} items)
                            </h3>
                            <div className="space-y-3">
                                {Object.keys(framingData).map(itemId => {
                                    const item = items.find(i => i.id === itemId);
                                    const framing = framingData[itemId];
                                    const isExpanded = expandedFraming[itemId];

                                    if (!item || !framing) return null;

                                    return (
                                        <div key={itemId} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => setExpandedFraming(prev => ({ ...prev, [itemId]: !prev[itemId] }))}
                                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                            >
                                                <span className="font-semibold text-gray-900">{item.title}</span>
                                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </button>
                                            {isExpanded && (
                                                <div className="p-4 space-y-3 bg-white">
                                                    {framing.coreProblem && (
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-700">Core Problem:</p>
                                                            <p className="text-sm text-gray-600 mt-1">{framing.coreProblem}</p>
                                                        </div>
                                                    )}
                                                    {framing.whoFaces && (
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-700">Who Faces It:</p>
                                                            <p className="text-sm text-gray-600 mt-1">{framing.whoFaces}</p>
                                                        </div>
                                                    )}
                                                    {framing.whyMatters && (
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-700">Why It Matters:</p>
                                                            <p className="text-sm text-gray-600 mt-1">{framing.whyMatters}</p>
                                                        </div>
                                                    )}
                                                    {framing.blockedOutcome && (
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-700">Blocked Outcome:</p>
                                                            <p className="text-sm text-gray-600 mt-1">{framing.blockedOutcome}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Voting Results */}
                    {Object.keys(votes).length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Voting Results</h3>
                            <div className="space-y-2">
                                {sortedByVotes.map((item, index) => {
                                    const voteCount = votes[item.id] || 0;
                                    return (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-bold text-gray-400 w-8">{index + 1}.</span>
                                                <span className="font-medium text-gray-900">{item.title}</span>
                                            </div>
                                            <span className="text-lg font-bold text-blue-600">{voteCount} votes</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Prioritisation Results */}
                    {prioritisation && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {prioritisation.mode === 'rice' ? 'RICE' : 'MoSCoW'} Prioritisation
                            </h3>
                            {prioritisation.mode === 'rice' ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Item</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Reach</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Impact</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Confidence</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Effort</th>
                                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {[...items].sort((a, b) => {
                                                const scoreA = prioritisation.rice[a.id]?.score || 0;
                                                const scoreB = prioritisation.rice[b.id]?.score || 0;
                                                return scoreB - scoreA;
                                            }).map(item => {
                                                const rice = prioritisation.rice[item.id];
                                                if (!rice) return null;
                                                return (
                                                    <tr key={item.id}>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{item.title}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{rice.reach}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{rice.impact}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{rice.confidence}%</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{rice.effort} {rice.effortUnit}</td>
                                                        <td className="px-4 py-3 text-sm font-bold text-blue-600">{rice.score.toFixed(1)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['must', 'should', 'could', 'wont'].map(category => {
                                        const categoryItems = prioritisation.moscow[category] || [];
                                        if (categoryItems.length === 0) return null;
                                        return (
                                            <div key={category} className="border border-gray-200 rounded-lg p-4">
                                                <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                                                    {category === 'wont' ? "Won't Have" : `${category} Have`} ({categoryItems.length})
                                                </h4>
                                                <ul className="space-y-2">
                                                    {categoryItems.map((itemId: string) => {
                                                        const item = items.find(i => i.id === itemId);
                                                        if (!item) return null;
                                                        return (
                                                            <li key={itemId} className="text-sm text-gray-700">• {item.title}</li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Final Decision Notes */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Final Decision</h3>
                        <textarea
                            value={decisionNotes}
                            onChange={(e) => setDecisionNotes(e.target.value)}
                            onBlur={handleSaveNotes}
                            placeholder="What did we decide? Add your final notes here..."
                            rows={6}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Finish Button */}
                <div className="flex justify-center mt-8">
                    <Button
                        variant="primary"
                        onClick={handleFinish}
                        className="px-8 py-3 flex items-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Finish & Return Home
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
