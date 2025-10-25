'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import type { Feature } from '@/types';

interface FeatureCardProps {
  feature: Feature;
  points: number;
  remainingPoints: number;
  onPointsChange: (featureId: string, points: number) => void;
  disabled?: boolean;
}

export function FeatureCard({
  feature,
  points,
  remainingPoints,
  onPointsChange,
  disabled = false,
}: FeatureCardProps) {
  const [localPoints, setLocalPoints] = useState(points.toString());

  useEffect(() => {
    setLocalPoints(points.toString());
  }, [points]);

  const handleChange = (value: string) => {
    // Allow empty string or valid numbers
    if (value === '' || /^\d+$/.test(value)) {
      setLocalPoints(value);
      const numValue = value === '' ? 0 : parseInt(value, 10);
      onPointsChange(feature.id, numValue);
    }
  };

  const handleIncrement = () => {
    if (remainingPoints > 0 && !disabled) {
      const newPoints = points + 1;
      onPointsChange(feature.id, newPoints);
    }
  };

  const handleDecrement = () => {
    if (points > 0 && !disabled) {
      const newPoints = points - 1;
      onPointsChange(feature.id, newPoints);
    }
  };

  return (
    <Card className="relative">
      <div className="flex flex-col gap-4">
        {/* Feature Info */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {feature.title}
          </h3>
          {feature.description && (
            <p className="text-sm text-gray-600 mb-2 leading-relaxed">
              {feature.description}
            </p>
          )}
          {(feature.effort !== null || feature.impact !== null) && (
            <div className="flex gap-4 text-sm text-gray-600">
              {feature.effort !== null && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Effort:</span>
                  <span className="text-gray-900">{feature.effort}/10</span>
                </span>
              )}
              {feature.impact !== null && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Impact:</span>
                  <span className="text-gray-900">{feature.impact}/10</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Points Allocator */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDecrement}
            disabled={disabled || points === 0}
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-semibold transition-colors"
          >
            −
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={localPoints}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
              className="w-full text-center text-2xl font-bold py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
              pts
            </div>
          </div>

          <button
            onClick={handleIncrement}
            disabled={disabled || remainingPoints === 0}
            className="w-10 h-10 rounded-lg bg-primary hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-semibold text-white transition-colors"
          >
            +
          </button>
        </div>

        {/* Visual progress bar */}
        {points > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-2 bg-gray-100 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${points}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-primary rounded-full"
            />
          </motion.div>
        )}
      </div>
    </Card>
  );
}
