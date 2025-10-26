'use client';

import { motion } from 'framer-motion';
import type { Feature } from '@/types';
import { getFeatureCategoryById } from '@/lib/constants/feature-categories';

interface ImpactEffortGridProps {
  features: Feature[];
  votes?: Record<string, number>;
}

interface QuadrantInfo {
  title: string;
  description: string;
  emoji: string;
  recommendation: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const QUADRANTS: Record<string, QuadrantInfo> = {
  'quick-wins': {
    title: 'Quick Wins',
    description: 'High Impact, Low Effort',
    emoji: '🎯',
    recommendation: 'Do First',
    color: 'green',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    textColor: 'text-green-900',
  },
  'major-projects': {
    title: 'Major Projects',
    description: 'High Impact, High Effort',
    emoji: '🚀',
    recommendation: 'Plan & Execute',
    color: 'blue',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-900',
  },
  'fill-ins': {
    title: 'Fill Ins',
    description: 'Low Impact, Low Effort',
    emoji: '📝',
    recommendation: 'Do When Free',
    color: 'gray',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-900',
  },
  'time-sinks': {
    title: 'Time Sinks',
    description: 'Low Impact, High Effort',
    emoji: '⚠️',
    recommendation: 'Avoid or Defer',
    color: 'red',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    textColor: 'text-red-900',
  },
};

function getQuadrant(impact: number | null, effort: number | null): string {
  // Default to middle if values are missing
  const impactValue = impact ?? 5;
  const effortValue = effort ?? 5;

  const isHighImpact = impactValue > 5;
  const isLowEffort = effortValue <= 5;

  if (isHighImpact && isLowEffort) return 'quick-wins';
  if (isHighImpact && !isLowEffort) return 'major-projects';
  if (!isHighImpact && isLowEffort) return 'fill-ins';
  return 'time-sinks';
}

export function ImpactEffortGrid({ features, votes }: ImpactEffortGridProps) {
  // Filter features that have both impact and effort values
  const plottableFeatures = features.filter(
    f => f.impact !== null && f.effort !== null
  );

  const hasNoData = plottableFeatures.length === 0;

  // Group features by quadrant
  const featuresByQuadrant = plottableFeatures.reduce((acc, feature) => {
    const quadrant = getQuadrant(feature.impact, feature.effort);
    if (!acc[quadrant]) acc[quadrant] = [];
    acc[quadrant].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Impact vs Effort Matrix</h3>
            <p className="text-xs text-blue-700">
              Features are grouped by their strategic value. Focus on <strong>Quick Wins</strong> first, then plan for <strong>Major Projects</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      {hasNoData ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-medium">No Impact/Effort data available</p>
            <p className="text-xs mt-1">Features need Impact and Effort scores to appear on the grid</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quick Wins - Top Priority */}
          {(() => {
            const quadrant = QUADRANTS['quick-wins'];
            const quadrantFeatures = featuresByQuadrant['quick-wins'] || [];
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${quadrant.bgColor} border-2 ${quadrant.borderColor} rounded-xl p-5`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{quadrant.emoji}</span>
                    <div>
                      <h3 className={`font-bold ${quadrant.textColor}`}>{quadrant.title}</h3>
                      <p className="text-xs text-gray-600">{quadrant.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-white rounded-full text-green-700 border border-green-300">
                    {quadrant.recommendation}
                  </span>
                </div>
                {quadrantFeatures.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-4">No features in this quadrant</p>
                ) : (
                  <div className="space-y-2">
                    {quadrantFeatures.map((feature, idx) => {
                      const category = getFeatureCategoryById(feature.category);
                      const voteCount = votes?.[feature.id] ?? 0;
                      return (
                        <div
                          key={feature.id}
                          className="bg-white rounded-lg p-3 border border-green-200 hover:border-green-400 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {category && <span className="text-sm">{category.icon}</span>}
                                <p className="font-medium text-sm text-gray-900 truncate">{feature.title}</p>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span>Impact: {feature.impact}/10</span>
                                <span>•</span>
                                <span>Effort: {feature.effort}/10</span>
                              </div>
                            </div>
                            {voteCount > 0 && (
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                                {voteCount}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* Major Projects */}
          {(() => {
            const quadrant = QUADRANTS['major-projects'];
            const quadrantFeatures = featuresByQuadrant['major-projects'] || [];
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`${quadrant.bgColor} border-2 ${quadrant.borderColor} rounded-xl p-5`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{quadrant.emoji}</span>
                    <div>
                      <h3 className={`font-bold ${quadrant.textColor}`}>{quadrant.title}</h3>
                      <p className="text-xs text-gray-600">{quadrant.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-white rounded-full text-blue-700 border border-blue-300">
                    {quadrant.recommendation}
                  </span>
                </div>
                {quadrantFeatures.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-4">No features in this quadrant</p>
                ) : (
                  <div className="space-y-2">
                    {quadrantFeatures.map((feature) => {
                      const category = getFeatureCategoryById(feature.category);
                      const voteCount = votes?.[feature.id] ?? 0;
                      return (
                        <div
                          key={feature.id}
                          className="bg-white rounded-lg p-3 border border-blue-200 hover:border-blue-400 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {category && <span className="text-sm">{category.icon}</span>}
                                <p className="font-medium text-sm text-gray-900 truncate">{feature.title}</p>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span>Impact: {feature.impact}/10</span>
                                <span>•</span>
                                <span>Effort: {feature.effort}/10</span>
                              </div>
                            </div>
                            {voteCount > 0 && (
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                                {voteCount}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* Fill Ins */}
          {(() => {
            const quadrant = QUADRANTS['fill-ins'];
            const quadrantFeatures = featuresByQuadrant['fill-ins'] || [];
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`${quadrant.bgColor} border-2 ${quadrant.borderColor} rounded-xl p-5`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{quadrant.emoji}</span>
                    <div>
                      <h3 className={`font-bold ${quadrant.textColor}`}>{quadrant.title}</h3>
                      <p className="text-xs text-gray-600">{quadrant.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-white rounded-full text-gray-700 border border-gray-300">
                    {quadrant.recommendation}
                  </span>
                </div>
                {quadrantFeatures.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-4">No features in this quadrant</p>
                ) : (
                  <div className="space-y-2">
                    {quadrantFeatures.map((feature) => {
                      const category = getFeatureCategoryById(feature.category);
                      const voteCount = votes?.[feature.id] ?? 0;
                      return (
                        <div
                          key={feature.id}
                          className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-400 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {category && <span className="text-sm">{category.icon}</span>}
                                <p className="font-medium text-sm text-gray-900 truncate">{feature.title}</p>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span>Impact: {feature.impact}/10</span>
                                <span>•</span>
                                <span>Effort: {feature.effort}/10</span>
                              </div>
                            </div>
                            {voteCount > 0 && (
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center text-sm font-bold">
                                {voteCount}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* Time Sinks */}
          {(() => {
            const quadrant = QUADRANTS['time-sinks'];
            const quadrantFeatures = featuresByQuadrant['time-sinks'] || [];
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`${quadrant.bgColor} border-2 ${quadrant.borderColor} rounded-xl p-5`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{quadrant.emoji}</span>
                    <div>
                      <h3 className={`font-bold ${quadrant.textColor}`}>{quadrant.title}</h3>
                      <p className="text-xs text-gray-600">{quadrant.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 bg-white rounded-full text-red-700 border border-red-300">
                    {quadrant.recommendation}
                  </span>
                </div>
                {quadrantFeatures.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-4">No features in this quadrant</p>
                ) : (
                  <div className="space-y-2">
                    {quadrantFeatures.map((feature) => {
                      const category = getFeatureCategoryById(feature.category);
                      const voteCount = votes?.[feature.id] ?? 0;
                      return (
                        <div
                          key={feature.id}
                          className="bg-white rounded-lg p-3 border border-red-200 hover:border-red-400 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {category && <span className="text-sm">{category.icon}</span>}
                                <p className="font-medium text-sm text-gray-900 truncate">{feature.title}</p>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span>Impact: {feature.impact}/10</span>
                                <span>•</span>
                                <span>Effort: {feature.effort}/10</span>
                              </div>
                            </div>
                            {voteCount > 0 && (
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">
                                {voteCount}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
