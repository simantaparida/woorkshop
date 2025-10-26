'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { FeatureWithVotes } from '@/types';
import { getFeatureCategoryById } from '@/lib/constants/feature-categories';

interface EffortImpactScatterProps {
  results: FeatureWithVotes[];
}

function getQuadrantInfo(effort: number, impact: number) {
  const isHighImpact = impact > 5;
  const isLowEffort = effort <= 5;

  if (isHighImpact && isLowEffort) {
    return { label: 'Quick Wins', color: 'bg-green-500', textColor: 'text-green-700' };
  }
  if (isHighImpact && !isLowEffort) {
    return { label: 'Major Projects', color: 'bg-blue-500', textColor: 'text-blue-700' };
  }
  if (!isHighImpact && isLowEffort) {
    return { label: 'Fill Ins', color: 'bg-gray-500', textColor: 'text-gray-700' };
  }
  return { label: 'Time Sinks', color: 'bg-red-500', textColor: 'text-red-700' };
}

function getBubbleSize(totalPoints: number, maxPoints: number): number {
  // Scale from 20 to 60 pixels
  const minSize = 20;
  const maxSize = 60;
  const normalized = totalPoints / maxPoints;
  return minSize + (normalized * (maxSize - minSize));
}

export function EffortImpactScatter({ results }: EffortImpactScatterProps) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  // Filter features that have both effort and impact
  const plottableFeatures = results.filter(
    (f) => f.effort !== null && f.impact !== null
  );

  if (plottableFeatures.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm font-medium">No Effort/Impact data available</p>
          <p className="text-xs mt-1">Features need Effort and Impact scores to appear on the scatter plot</p>
        </div>
      </div>
    );
  }

  const maxPoints = Math.max(...plottableFeatures.map((f) => f.total_points));

  // Chart dimensions
  const chartWidth = 600;
  const chartHeight = 500;
  const padding = 60;
  const plotWidth = chartWidth - padding * 2;
  const plotHeight = chartHeight - padding * 2;

  // Calculate positions (effort on X, impact on Y)
  const getX = (effort: number) => padding + (effort / 10) * plotWidth;
  const getY = (impact: number) => chartHeight - padding - (impact / 10) * plotHeight;

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-sm font-semibold text-purple-900 mb-1">Multi-Dimensional Analysis</h3>
            <p className="text-xs text-purple-700">
              Bubble size represents total votes. Position shows effort vs impact trade-offs. Hover for details.
            </p>
          </div>
        </div>
      </div>

      {/* Scatter Plot */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-center">
          <svg
            width={chartWidth}
            height={chartHeight}
            className="overflow-visible"
            style={{ maxWidth: '100%', height: 'auto' }}
          >
            {/* Background quadrants */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f3f4f6" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Quadrant backgrounds */}
            {/* Bottom-left: Fill Ins */}
            <rect
              x={padding}
              y={chartHeight - padding - plotHeight / 2}
              width={plotWidth / 2}
              height={plotHeight / 2}
              fill="#f9fafb"
              opacity="0.5"
            />
            {/* Bottom-right: Time Sinks */}
            <rect
              x={padding + plotWidth / 2}
              y={chartHeight - padding - plotHeight / 2}
              width={plotWidth / 2}
              height={plotHeight / 2}
              fill="#fef2f2"
              opacity="0.5"
            />
            {/* Top-left: Quick Wins */}
            <rect
              x={padding}
              y={padding}
              width={plotWidth / 2}
              height={plotHeight / 2}
              fill="#f0fdf4"
              opacity="0.5"
            />
            {/* Top-right: Major Projects */}
            <rect
              x={padding + plotWidth / 2}
              y={padding}
              width={plotWidth / 2}
              height={plotHeight / 2}
              fill="#eff6ff"
              opacity="0.5"
            />

            {/* Grid */}
            <rect x={padding} y={padding} width={plotWidth} height={plotHeight} fill="url(#grid)" />

            {/* Axes */}
            <line
              x1={padding}
              y1={chartHeight - padding}
              x2={chartWidth - padding}
              y2={chartHeight - padding}
              stroke="#9ca3af"
              strokeWidth="2"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={chartHeight - padding}
              stroke="#9ca3af"
              strokeWidth="2"
            />

            {/* Midpoint lines */}
            <line
              x1={padding + plotWidth / 2}
              y1={padding}
              x2={padding + plotWidth / 2}
              y2={chartHeight - padding}
              stroke="#d1d5db"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            <line
              x1={padding}
              y1={chartHeight - padding - plotHeight / 2}
              x2={chartWidth - padding}
              y2={chartHeight - padding - plotHeight / 2}
              stroke="#d1d5db"
              strokeWidth="1"
              strokeDasharray="5,5"
            />

            {/* Axis labels */}
            <text
              x={chartWidth / 2}
              y={chartHeight - 20}
              textAnchor="middle"
              className="text-sm font-semibold fill-gray-700"
            >
              Effort →
            </text>
            <text
              x={20}
              y={chartHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90, 20, ${chartHeight / 2})`}
              className="text-sm font-semibold fill-gray-700"
            >
              Impact →
            </text>

            {/* Tick labels */}
            {[0, 2, 4, 6, 8, 10].map((val) => (
              <g key={`x-${val}`}>
                <text
                  x={getX(val)}
                  y={chartHeight - padding + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {val}
                </text>
                <text
                  x={padding - 20}
                  y={getY(val) + 4}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {val}
                </text>
              </g>
            ))}

            {/* Quadrant labels */}
            <text
              x={padding + plotWidth / 4}
              y={padding + 20}
              textAnchor="middle"
              className="text-xs font-semibold fill-green-700"
            >
              Quick Wins
            </text>
            <text
              x={padding + (3 * plotWidth) / 4}
              y={padding + 20}
              textAnchor="middle"
              className="text-xs font-semibold fill-blue-700"
            >
              Major Projects
            </text>
            <text
              x={padding + plotWidth / 4}
              y={chartHeight - padding - 10}
              textAnchor="middle"
              className="text-xs font-semibold fill-gray-700"
            >
              Fill Ins
            </text>
            <text
              x={padding + (3 * plotWidth) / 4}
              y={chartHeight - padding - 10}
              textAnchor="middle"
              className="text-xs font-semibold fill-red-700"
            >
              Time Sinks
            </text>

            {/* Data points */}
            {plottableFeatures.map((feature, index) => {
              const x = getX(feature.effort!);
              const y = getY(feature.impact!);
              const size = getBubbleSize(feature.total_points, maxPoints);
              const quadrant = getQuadrantInfo(feature.effort!, feature.impact!);
              const category = getFeatureCategoryById(feature.category);
              const isHovered = hoveredFeature === feature.id;

              return (
                <g key={feature.id}>
                  {/* Bubble */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={size / 2}
                    className={quadrant.color}
                    opacity={isHovered ? 0.9 : 0.6}
                    stroke={isHovered ? '#1f2937' : '#fff'}
                    strokeWidth={isHovered ? 3 : 2}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05, type: 'spring' }}
                    onMouseEnter={() => setHoveredFeature(feature.id)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Vote count label */}
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white pointer-events-none"
                  >
                    {feature.total_points}
                  </text>

                  {/* Tooltip on hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={x + size / 2 + 10}
                        y={y - 40}
                        width="200"
                        height="80"
                        rx="8"
                        fill="white"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                        filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                      />
                      <text
                        x={x + size / 2 + 20}
                        y={y - 20}
                        className="text-sm font-semibold fill-gray-900"
                      >
                        {feature.title.length > 20
                          ? feature.title.substring(0, 20) + '...'
                          : feature.title}
                      </text>
                      {category && (
                        <text
                          x={x + size / 2 + 20}
                          y={y - 5}
                          className="text-xs fill-gray-600"
                        >
                          {category.icon} {category.label}
                        </text>
                      )}
                      <text
                        x={x + size / 2 + 20}
                        y={y + 15}
                        className="text-xs fill-gray-700"
                      >
                        {feature.total_points} pts • {feature.vote_count} votes
                      </text>
                      <text
                        x={x + size / 2 + 20}
                        y={y + 30}
                        className="text-xs fill-gray-600"
                      >
                        Effort: {feature.effort} • Impact: {feature.impact}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-700">Quick Wins</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-700">Major Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
            <span className="text-xs text-gray-700">Fill Ins</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-700">Time Sinks</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            <strong>Bubble size:</strong> Larger bubbles = more total votes received
          </p>
        </div>
      </div>
    </div>
  );
}
