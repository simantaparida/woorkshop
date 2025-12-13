'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Slider } from './ui/Slider';
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
    }
  };

  const handleInputBlur = () => {
    const numValue = localPoints === '' ? 0 : parseInt(localPoints, 10);
    const maxAllowed = points + remainingPoints;
    const clampedValue = Math.min(numValue, maxAllowed);
    onPointsChange(feature.id, clampedValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setLocalPoints(points.toString());
      e.currentTarget.blur();
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

  const handleQuickAdd = (amount: number) => {
    if (!disabled) {
      const newPoints = Math.min(points + amount, points + remainingPoints);
      onPointsChange(feature.id, newPoints);
    }
  };

  const handleClear = () => {
    if (!disabled) {
      onPointsChange(feature.id, 0);
    }
  };

  const handleSliderChange = (value: number) => {
    if (!disabled) {
      onPointsChange(feature.id, value);
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
          {(() => {
            // Handle both array and string (JSON) formats, and null/undefined
            let links = feature.reference_links;
            
            // Debug logging
            if (links != null) {
              console.log(`FeatureCard "${feature.title}":`, {
                reference_links: links,
                type: typeof links,
                isArray: Array.isArray(links),
                length: Array.isArray(links) ? links.length : 'N/A'
              });
            }
            
            // If null or undefined, return empty
            if (links == null) {
              return null;
            }
            
            // If it's a string, try to parse it
            if (typeof links === 'string') {
              try {
                links = JSON.parse(links);
                console.log(`FeatureCard "${feature.title}": Parsed JSON string to:`, links);
              } catch (e) {
                console.warn(`FeatureCard "${feature.title}": Failed to parse reference_links JSON:`, e, 'Raw value:', links);
                return null;
              }
            }
            
            // Ensure it's an array and has items
            if (!Array.isArray(links)) {
              console.warn(`FeatureCard "${feature.title}": reference_links is not an array:`, links);
              return null;
            }
            
            if (links.length === 0) {
              return null;
            }
            
            // Filter out any invalid links (must have url)
            const validLinks = links.filter((link: any) => {
              const isValid = link && typeof link === 'object' && link.url;
              if (!isValid) {
                console.warn(`FeatureCard "${feature.title}": Invalid link filtered out:`, link);
              }
              return isValid;
            });
            
            if (validLinks.length === 0) {
              console.warn(`FeatureCard "${feature.title}": No valid links after filtering`);
              return null;
            }
            
            console.log(`FeatureCard "${feature.title}": Rendering ${validLinks.length} valid links`);
            
            return (
              <div className="flex flex-wrap gap-2 mt-2">
                {validLinks.map((link: any, linkIndex: number) => (
                  <a
                    key={linkIndex}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 hover:border-primary hover:text-primary transition-colors"
                    title={link.title || link.url}
                  >
                    {link.favicon && (
                      <img
                        src={link.favicon}
                        alt=""
                        className="w-3 h-3"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    {link.type && <span>{getLinkTypeIcon(link.type)}</span>}
                    <span className="max-w-[100px] truncate">{link.title || link.url}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Points Allocator - Hybrid Approach */}
        <div className="space-y-3">
          {/* Slider with Points Display */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative pt-4">
              <Slider
                key={`slider-${feature.id}`}
                value={points}
                onChange={handleSliderChange}
                min={0}
                max={Math.min(100, points + remainingPoints)}
                disabled={disabled}
                showValue={false}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={localPoints}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                disabled={disabled}
                className="w-20 text-3xl font-bold text-gray-900 text-right border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <span className="text-sm text-gray-500 font-medium">pts</span>
              <button
                onClick={handleDecrement}
                disabled={disabled || points === 0}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-semibold transition-colors"
              >
                −
              </button>
              <button
                onClick={handleIncrement}
                disabled={disabled || remainingPoints === 0}
                className="w-9 h-9 rounded-lg bg-primary hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-semibold text-white transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium mr-1">Quick:</span>
            <button
              onClick={() => handleQuickAdd(5)}
              disabled={disabled || remainingPoints < 5}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              +5
            </button>
            <button
              onClick={() => handleQuickAdd(10)}
              disabled={disabled || remainingPoints < 10}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              +10
            </button>
            <button
              onClick={() => handleQuickAdd(25)}
              disabled={disabled || remainingPoints < 25}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              +25
            </button>
            {points > 0 && (
              <button
                onClick={handleClear}
                disabled={disabled}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-auto"
              >
                Clear
              </button>
            )}
          </div>

          {/* Enhanced Visual Progress Bar */}
          {points > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{points}% of total budget</span>
                <span className="font-medium">{points}/100 pts</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${points}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                />
              </div>
            </motion.div>
          )}
        </div>

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
