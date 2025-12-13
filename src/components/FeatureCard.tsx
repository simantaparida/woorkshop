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
  const [showLimitTooltip, setShowLimitTooltip] = useState(false);

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
    } else if (remainingPoints === 0 && !disabled) {
      setShowLimitTooltip(true);
      setTimeout(() => setShowLimitTooltip(false), 2000);
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

      // Show tooltip if trying to add more than available
      if (amount > remainingPoints) {
        setShowLimitTooltip(true);
        setTimeout(() => setShowLimitTooltip(false), 2000);
      }

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
      // Clamp value to available points (current points + remaining points)
      const maxAllowed = points + remainingPoints;
      const clampedValue = Math.min(value, maxAllowed);

      // Show tooltip if user tried to exceed limit
      if (value > maxAllowed) {
        setShowLimitTooltip(true);
        setTimeout(() => setShowLimitTooltip(false), 2000);
      }

      onPointsChange(feature.id, clampedValue);
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
                max={100}
                disabled={disabled}
                showValue={false}
                remainingPoints={remainingPoints}
                showTooltip={showLimitTooltip}
                tooltipContent={
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Only {remainingPoints} points remaining!</span>
                  </div>
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrement}
                disabled={disabled || points === 0}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base font-semibold transition-colors"
              >
                −
              </button>
              <input
                type="text"
                value={localPoints}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                disabled={disabled}
                className="w-16 text-lg font-semibold text-gray-900 text-center border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <button
                onClick={handleIncrement}
                disabled={disabled || remainingPoints === 0}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base font-semibold transition-colors"
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
        </div>

        {/* Optional Note Section - Always Visible */}
        <div className="border-t border-gray-200 pt-3">
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
        </div>
      </div>
    </Card>
  );
}
