'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { getLinkTypeIcon } from '@/lib/utils/link-metadata';
import type { Feature } from '@/types';

interface FeatureCardProps {
  feature: Feature;
  points: number;
  note?: string;
  remainingPoints: number;
  onPointsChange: (featureId: string, points: number) => void;
  onNoteChange?: (featureId: string, note: string) => void;
  disabled?: boolean;
}

export function FeatureCard({
  feature,
  points,
  note = '',
  remainingPoints,
  onPointsChange,
  onNoteChange,
  disabled = false,
}: FeatureCardProps) {
  const [localPoints, setLocalPoints] = useState(points.toString());
  const [localNote, setLocalNote] = useState(note);
  const [showNoteField, setShowNoteField] = useState(!!note);

  useEffect(() => {
    setLocalPoints(points.toString());
  }, [points]);

  useEffect(() => {
    setLocalNote(note);
    setShowNoteField(!!note);
  }, [note]);

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

  const handleNoteChange = (value: string) => {
    setLocalNote(value);
    if (onNoteChange) {
      onNoteChange(feature.id, value);
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
          {/* Reference Links */}
          {feature.reference_links && feature.reference_links.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {feature.reference_links.map((link, linkIndex) => (
                <a
                  key={linkIndex}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 hover:border-primary hover:text-primary transition-colors"
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
                  <span className="max-w-[100px] truncate">{link.title}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
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

        {/* Optional Note Section */}
        {points > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-gray-200 pt-3"
          >
            {!showNoteField ? (
              <button
                onClick={() => setShowNoteField(true)}
                disabled={disabled}
                className="text-sm text-primary hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Add note (why you gave this score)
              </button>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 flex items-center justify-between">
                  <span>Why did you give this score? (optional)</span>
                  <button
                    onClick={() => {
                      setShowNoteField(false);
                      setLocalNote('');
                      if (onNoteChange) onNoteChange(feature.id, '');
                    }}
                    disabled={disabled}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </label>
                <textarea
                  value={localNote}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  disabled={disabled}
                  placeholder="e.g., High impact on user retention but requires significant backend work..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 text-right">
                  {localNote.length}/500 characters
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Card>
  );
}
