'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MEDAL_EMOJI } from '@/lib/constants';
import { getLinkTypeIcon } from '@/lib/utils/link-metadata';
import type { FeatureWithVotes } from '@/types';

interface ResultsChartProps {
  results: FeatureWithVotes[];
}

export function ResultsChart({ results }: ResultsChartProps) {
  // Prepare data for chart
  const chartData = results.map((feature, index) => ({
    name: feature.title.length > 30 ? feature.title.substring(0, 30) + '...' : feature.title,
    fullName: feature.title,
    points: feature.total_points,
    rank: index + 1,
  }));

  const maxPoints = Math.max(...results.map(r => r.total_points), 1);

  // Colors for top 3
  const getBarColor = (index: number) => {
    if (index === 0) return '#fbbf24'; // Gold
    if (index === 1) return '#9ca3af'; // Silver
    if (index === 2) return '#cd7f32'; // Bronze
    return '#2563eb'; // Primary blue
  };

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Results Overview</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ value: 'Points', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-gray-900 mb-1">
                        {data.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{data.points}</span> points
                      </p>
                      <p className="text-sm text-gray-500">
                        Rank #{data.rank}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="points" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ranked List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Rankings</h3>
        <div className="space-y-3">
          {results.map((feature, index) => {
            const rank = index + 1;
            const medal = MEDAL_EMOJI[rank as keyof typeof MEDAL_EMOJI];

            return (
              <div
                key={feature.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  rank <= 3
                    ? 'bg-gradient-to-r from-yellow-50 to-white border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank */}
                  <div className="text-2xl font-bold text-gray-400 w-8">
                    {medal || `#${rank}`}
                  </div>

                  {/* Feature Details */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {feature.title}
                    </h4>
                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                      {feature.effort !== null && (
                        <span>Effort: {feature.effort}/10</span>
                      )}
                      {feature.impact !== null && (
                        <span>Impact: {feature.impact}/10</span>
                      )}
                      <span>{feature.vote_count} votes</span>
                    </div>
                    {/* Reference Links */}
                    {feature.reference_links && feature.reference_links.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {feature.reference_links.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:border-primary hover:text-primary transition-colors"
                            title={link.title}
                          >
                            <img
                              src={link.favicon}
                              alt=""
                              className="w-3 h-3"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <span>{getLinkTypeIcon(link.type)}</span>
                            <span className="max-w-[120px] truncate">{link.title}</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {feature.total_points}
                  </div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
