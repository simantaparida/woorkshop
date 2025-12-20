'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Vote, Users, Grid2x2, Download } from 'lucide-react';
import Image from 'next/image';

interface Tool {
  title: string;
  description: string;
  icon: typeof Vote;
  image: string;
}

const tools: Tool[] = [
  {
    title: 'From Opinions to Data',
    description: '"Feature A scores 85/100. Feature B scores 42. Ship A first." Turn subjective debates into objective numbers.',
    icon: Vote,
    image: '/images/tool-1.jpg',
  },
  {
    title: 'Force Real Trade-offs',
    description: 'When everyone gets 100 points total, priorities get real. No more "everything is high priority."',
    icon: Users,
    image: '/images/tool-2.jpg',
  },
  {
    title: 'Democratize Decision-Making',
    description: 'Everyone votes simultaneously. No anchoring bias. No loud voices dominating. Just data.',
    icon: Grid2x2,
    image: '/images/tool-3.jpg',
  },
  {
    title: 'Don\'t End at a Decision',
    description: 'Export to CSV. Import to Jira. Move forward. From session to shipped in minutes.',
    icon: Download,
    image: '/images/tool-4.jpg',
  },
];

export function ValueProps() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [selectedTool, setSelectedTool] = useState<number | null>(null);

  // Show subtitles after headline appears
  useEffect(() => {
    if (!isInView) return;

    const timer = setTimeout(() => {
      setShowSubtitles(true);
    }, 600);

    return () => {
      clearTimeout(timer);
    };
  }, [isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section ref={ref} className="relative py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section - Centered */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-12"
        >
          {/* Small Label */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-clarity bg-green-50 rounded-full border border-green-200">
              The Solution
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6"
          >
            Structure beats chaos.
            <br />
            Every single time.
          </motion.h2>

          {/* Subtitles in same line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={showSubtitles ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 text-lg text-gray-500"
          >
            <span>Not rigid process.</span>
            <span>Not heavy frameworks.</span>
          </motion.div>
        </motion.div>

        {/* Tools Grid - 2 Columns */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid lg:grid-cols-2 gap-12 items-start"
        >
          {/* Left Column - Tools List */}
          <div className="space-y-5">
            <h3 className="text-xl font-bold text-gray-900 mb-6">My tools</h3>
            {tools.map((tool, index) => (
              <motion.div
                key={tool.title}
                variants={itemVariants}
                onClick={() => setSelectedTool(index)}
                className="flex items-start gap-3 group cursor-pointer"
              >
                {/* Circle Icon */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedTool === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105'
                }`}>
                  <tool.icon className="w-4 h-4" />
                </div>

                {/* Text */}
                <div className="flex-1 pt-0.5">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-snug">
                    {tool.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column - UI Preview */}
          <motion.div
            variants={itemVariants}
            className="lg:sticky lg:top-24"
          >
            {selectedTool !== null ? (
              <div className="w-full bg-gray-50 rounded-2xl border-2 border-gray-200 overflow-hidden">
                <Image
                  src={tools[selectedTool].image}
                  alt={`${tools[selectedTool].title} preview`}
                  width={800}
                  height={600}
                  quality={90}
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="w-full aspect-[4/3] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <span className="font-medium text-sm">Click a tool to preview</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
