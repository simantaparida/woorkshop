'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { SessionProgress } from '@/components/SessionProgress';
import { Button } from '@/components/ui/Button';
import { Plus, Edit2, Trash2, GripVertical, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import Link from 'next/link';

interface Item {
    id: string;
    title: string;
    description: string;
    tag: 'problem' | 'idea' | 'task';
}

export default function ItemsPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.id as string;

    const [items, setItems] = useState<Item[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);

    // Load items from localStorage on mount
    useEffect(() => {
        const storedItems = localStorage.getItem(`session_${sessionId}_items`);
        if (storedItems) {
            setItems(JSON.parse(storedItems));
        }
    }, [sessionId]);

    const handleAddItem = (item: Omit<Item, 'id'>) => {
        const newItem = {
            ...item,
            id: `item_${Date.now()}`,
        };
        const updatedItems = [...items, newItem];
        setItems(updatedItems);
        // Persist to localStorage
        localStorage.setItem(`session_${sessionId}_items`, JSON.stringify(updatedItems));
        setIsModalOpen(false);
    };

    const handleEditItem = (item: Item) => {
        const updatedItems = items.map(i => i.id === item.id ? item : i);
        setItems(updatedItems);
        // Persist to localStorage
        localStorage.setItem(`session_${sessionId}_items`, JSON.stringify(updatedItems));
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleDeleteItem = (id: string) => {
        const updatedItems = items.filter(i => i.id !== id);
        setItems(updatedItems);
        // Persist to localStorage
        localStorage.setItem(`session_${sessionId}_items`, JSON.stringify(updatedItems));
    };

    const handleNext = () => {
        router.push(`/session/${sessionId}/problem-framing`);
    };

    const handleSkipToVoting = () => {
        router.push(`/session/${sessionId}/voting`);
    };

    const tagColors = {
        problem: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
        idea: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
        task: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    };

    return (
        <AppLayout>
            <SessionProgress currentStep={2} totalSteps={6} />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/home"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Add Items</h1>
                    <p className="text-gray-600">Add problems, ideas, or tasks to discuss in this session</p>
                </div>

                {/* Items List */}
                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
                        <p className="text-gray-500 mb-6">Start by adding your first item to the board</p>
                        <Button
                            variant="primary"
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add First Item
                        </Button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                            <Button
                                variant="secondary"
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </Button>
                        </div>

                        <Reorder.Group axis="y" values={items} onReorder={(newItems) => {
                            setItems(newItems);
                            localStorage.setItem(`session_${sessionId}_items`, JSON.stringify(newItems));
                        }} className="space-y-3">
                            {items.map((item) => (
                                <Reorder.Item key={item.id} value={item}>
                                    <motion.div
                                        layout
                                        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="cursor-grab active:cursor-grabbing pt-1">
                                                <GripVertical className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagColors[item.tag].bg} ${tagColors[item.tag].text} flex-shrink-0`}>
                                                        {item.tag}
                                                    </span>
                                                </div>
                                                {item.description && (
                                                    <p className="text-sm text-gray-600">{item.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </div>
                )}

                {/* Actions */}
                {items.length > 0 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleSkipToVoting}
                            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                        >
                            Skip to Voting
                        </button>
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            className="px-6 py-2.5 flex items-center gap-2"
                        >
                            Next: Problem Framing
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Add/Edit Item Modal */}
            {isModalOpen && (
                <ItemModal
                    item={editingItem}
                    onSave={editingItem ? handleEditItem : handleAddItem}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingItem(null);
                    }}
                />
            )}
        </AppLayout>
    );
}

// Item Modal Component
function ItemModal({
    item,
    onSave,
    onClose
}: {
    item: Item | null;
    onSave: (item: any) => void;
    onClose: () => void;
}) {
    const [title, setTitle] = useState(item?.title || '');
    const [description, setDescription] = useState(item?.description || '');
    const [tag, setTag] = useState<'problem' | 'idea' | 'task'>(item?.tag || 'problem');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (item) {
            onSave({ ...item, title, description, tag });
        } else {
            onSave({ title, description, tag });
        }
    };

    const tags = [
        { value: 'problem', label: 'Problem', color: 'red' },
        { value: 'idea', label: 'Idea', color: 'blue' },
        { value: 'task', label: 'Task', color: 'green' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
            >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {item ? 'Edit Item' : 'Add New Item'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter item title..."
                            required
                            autoFocus
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Description <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add more details..."
                            rows={3}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Tag *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {tags.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setTag(t.value as any)}
                                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${tag === t.value
                                            ? `border-${t.color}-600 bg-${t.color}-50 text-${t.color}-700`
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                        >
                            {item ? 'Save Changes' : 'Add Item'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
