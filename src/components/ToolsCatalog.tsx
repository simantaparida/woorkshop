'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FACILITATION_TOOLS, TOOL_CATEGORIES, type FacilitationTool } from '@/lib/constants/tools';
import { FileText, Vote, BarChart2, Grid2x2, LucideIcon } from 'lucide-react';

interface ToolsCatalogProps {
  layout?: 'grid' | 'list';
  featured?: string[]; // tool slugs to highlight
  limit?: number; // max number of tools to show
}

// Map icon names to actual Lucide components
const iconMap: Record<string, LucideIcon> = {
  'FileText': FileText,
  'Vote': Vote,
  'BarChart2': BarChart2,
  'Grid2x2': Grid2x2,
};

const categoryColorMap = {
  prioritization: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100'
  },
  ideation: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100'
  },
  analysis: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    iconBg: 'bg-green-100'
  },
  voting: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    iconBg: 'bg-orange-100'
  }
} as const;

export function ToolsCatalog({ layout = 'grid', featured, limit }: ToolsCatalogProps) {
  // Filter and limit tools
  let tools = FACILITATION_TOOLS;

  if (featured && featured.length > 0) {
    tools = tools.filter(tool => featured.includes(tool.slug));
  }

  if (limit && limit > 0) {
    tools = tools.slice(0, limit);
  }

  if (tools.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No facilitation tools available</p>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="space-y-3">
        {tools.map((tool, index) => (
          <ToolCardList key={tool.id} tool={tool} index={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {tools.map((tool, index) => (
        <ToolCard key={tool.id} tool={tool} index={index} />
      ))}
    </div>
  );
}

function ToolCard({ tool, index }: { tool: FacilitationTool; index: number }) {
  const Icon = iconMap[tool.icon] || FileText;
  const colors = categoryColorMap[tool.category];
  const categoryInfo = TOOL_CATEGORIES[tool.category];
  const isComingSoon = tool.comingSoon === true;

  const cardContent = (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 transition-all h-full relative ${
      isComingSoon 
        ? 'opacity-75 cursor-not-allowed' 
        : 'hover:border-blue-500 hover:shadow-md group'
    }`}>
      {/* Coming Soon Badge */}
      {isComingSoon && (
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
          Coming Soon
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${colors.iconBg} rounded-lg flex items-center justify-center transition-transform ${
          isComingSoon ? '' : 'group-hover:scale-110'
        }`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
          {categoryInfo.label}
        </span>
      </div>

      <h3 className={`text-sm font-semibold text-gray-900 mb-1.5 transition-colors ${
        isComingSoon ? '' : 'group-hover:text-blue-600'
      }`}>
        {tool.name}
      </h3>
      <p className="text-xs text-gray-600 line-clamp-2">
        {tool.description}
      </p>
    </div>
  );

  if (isComingSoon) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="cursor-not-allowed"
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={tool.route}
        className="block"
      >
        {cardContent}
      </Link>
    </motion.div>
  );
}

function ToolCardList({ tool, index }: { tool: FacilitationTool; index: number }) {
  const Icon = iconMap[tool.icon] || FileText;
  const colors = categoryColorMap[tool.category];
  const categoryInfo = TOOL_CATEGORIES[tool.category];
  const isComingSoon = tool.comingSoon === true;

  const cardContent = (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 transition-all flex items-center gap-4 relative ${
      isComingSoon 
        ? 'opacity-75 cursor-not-allowed' 
        : 'hover:border-blue-500 hover:shadow-md group'
    }`}>
      {/* Coming Soon Badge */}
      {isComingSoon && (
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
          Coming Soon
        </div>
      )}

      <div className={`w-10 h-10 ${colors.iconBg} rounded-lg flex items-center justify-center transition-transform flex-shrink-0 ${
        isComingSoon ? '' : 'group-hover:scale-110'
      }`}>
        <Icon className={`w-5 h-5 ${colors.text}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`text-sm font-semibold text-gray-900 transition-colors ${
            isComingSoon ? '' : 'group-hover:text-blue-600'
          }`}>
            {tool.name}
          </h3>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
            {categoryInfo.label}
          </span>
        </div>
        <p className="text-xs text-gray-600">
          {tool.description}
        </p>
      </div>

      <div className="text-xs text-gray-500 flex-shrink-0">
        {tool.steps} steps
      </div>
    </div>
  );

  if (isComingSoon) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="cursor-not-allowed"
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={tool.route}
        className="block"
      >
        {cardContent}
      </Link>
    </motion.div>
  );
}
