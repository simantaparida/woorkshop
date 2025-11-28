'use client';

import { motion } from 'framer-motion';
import { Plus, Search, Vote, BarChart2, ListFilter, Lightbulb, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

const templates = [
    {
        id: 'blank',
        title: 'Blank Workshop',
        description: 'Start with an empty canvas.',
        icon: Plus,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        features: null,
    },
    {
        id: 'problem-framing',
        title: 'Problem Framing',
        description: 'Define the problem before jumping to solutions.',
        icon: Search,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        features: 'Template',
    },
    {
        id: 'voting-board',
        title: 'Voting Board',
        description: 'Dot voting for ideas, pain points or concepts.',
        icon: Vote,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        features: 'Template',
    },
    {
        id: 'rice',
        title: 'RICE Prioritisation',
        description: 'Rank ideas using Reach, Impact, Confidence, Effort.',
        icon: BarChart2,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        features: 'Template',
    },
    {
        id: 'moscow',
        title: 'MoSCoW Prioritisation',
        description: 'Must / Should / Could / Won’t.',
        icon: ListFilter,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        features: 'Template',
    },
    {
        id: 'pain-solution',
        title: 'Pain → Solution Mapping',
        description: 'Turn user frustrations into structured solution opportunities.',
        icon: Lightbulb,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        features: 'Template',
    },
];

export function TemplateRecommendations() {
    const router = useRouter();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const updateArrowVisibility = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
            // Update arrow visibility after scroll
            setTimeout(updateArrowVisibility, 300);
        }
    };

    return (
        <section className="relative">
            {/* Scroll Buttons */}
            {showLeftArrow && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y/1/2 -ml-4 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}
            {showRightArrow && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y/1/2 -mr-4 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}

            {/* Carousel Container */}
            <div
                ref={scrollContainerRef}
                onScroll={updateArrowVisibility}
                className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {templates.map((template) => (
                    <motion.div
                        key={template.id}
                        whileHover={{ y: -2 }}
                        onClick={() => router.push(template.id === 'blank' ? '/projects/new' : `/projects/new?template=${template.id}`)}
                        className="min-w-[240px] w-[240px] h-[160px] p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                    >
                        <div className={`w-10 h-10 ${template.bgColor} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <template.icon className={`w-5 h-5 ${template.color}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1 text-base">{template.title}</h3>
                        <p className="text-sm text-gray-500 mb-3 flex-1 leading-snug line-clamp-2">{template.description}</p>
                        {template.features && (
                            <span className="text-xs font-medium text-gray-400">
                                {template.features}
                            </span>
                        )}
                    </motion.div>
                ))}

                {/* View All Card */}
                <motion.div
                    whileHover={{ y: -2 }}
                    onClick={() => router.push('/templates')}
                    className="min-w-[240px] w-[240px] h-[160px] p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group flex flex-col items-center justify-center text-center"
                >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">View All Templates</h3>
                    <p className="text-sm text-gray-500">Browse our full collection</p>
                </motion.div>
            </div>
        </section>
    );
}
