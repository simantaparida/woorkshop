'use client';

import { motion } from 'framer-motion';
import { Plus, Rocket, Map, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';

const templates = [
    {
        id: 'blank',
        title: 'Blank session',
        description: 'Start from scratch',
        icon: Plus,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        features: null,
    },
    {
        id: 'sprint',
        title: 'Sprint Planning',
        description: 'Prioritize features for your next development cycle',
        icon: Rocket,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        features: '5 features',
    },
    {
        id: 'roadmap',
        title: 'Product Roadmap',
        description: 'Vote on features for your product roadmap',
        icon: Map,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        features: '6 features',
    },
    {
        id: 'design',
        title: 'Design Priorities',
        description: 'Prioritize design improvements and UX fixes',
        icon: Palette,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        features: '6 features',
    },
];

export function TemplateRecommendations() {
    const router = useRouter();

    return (
        <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((template) => (
                    <motion.div
                        key={template.id}
                        whileHover={{ y: -2 }}
                        onClick={() => router.push(template.id === 'blank' ? '/create' : `/create?template=${template.id}`)}
                        className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full flex flex-col"
                    >
                        <div className={`w-12 h-12 ${template.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <template.icon className={`w-6 h-6 ${template.color}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg">{template.title}</h3>
                        <p className="text-sm text-gray-500 mb-4 flex-1">{template.description}</p>
                        {template.features && (
                            <span className="text-xs font-medium text-gray-400">
                                {template.features}
                            </span>
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
