'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { validateFeatureTitle, validateEffortImpact } from '@/lib/utils/validation';

interface FeatureInput {
  id: string;
  title: string;
  description: string;
  effort: string;
  impact: string;
}

interface FeatureFormProps {
  features: FeatureInput[];
  onChange: (features: FeatureInput[]) => void;
  maxFeatures?: number;
}

export function FeatureForm({ features, onChange, maxFeatures = 10 }: FeatureFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addFeature = () => {
    if (features.length < maxFeatures) {
      onChange([
        ...features,
        {
          id: Math.random().toString(36).substring(7),
          title: '',
          description: '',
          effort: '',
          impact: '',
        },
      ]);
    }
  };

  const removeFeature = (id: string) => {
    onChange(features.filter((f) => f.id !== id));
    const newErrors = { ...errors };
    delete newErrors[`title-${id}`];
    delete newErrors[`effort-${id}`];
    delete newErrors[`impact-${id}`];
    setErrors(newErrors);
  };

  const updateFeature = (id: string, field: keyof FeatureInput, value: string) => {
    onChange(
      features.map((f) =>
        f.id === id ? { ...f, [field]: value } : f
      )
    );

    // Clear error for this field
    const errorKey = `${field}-${id}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const validateField = (id: string, field: keyof FeatureInput, value: string) => {
    let error: string | null = null;

    if (field === 'title') {
      error = validateFeatureTitle(value);
    } else if (field === 'effort' || field === 'impact') {
      const numValue = value === '' ? null : parseInt(value, 10);
      error = validateEffortImpact(numValue);
    }

    if (error) {
      setErrors({ ...errors, [`${field}-${id}`]: error });
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
          >
            {/* Header Row: Number, Title, Remove Button */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white text-sm font-bold flex items-center justify-center shadow-sm">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Feature name (e.g., Dark mode support)"
                  value={feature.title}
                  onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
                  onBlur={(e) => validateField(feature.id, 'title', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                />
                {errors[`title-${feature.id}`] && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors[`title-${feature.id}`]}
                  </p>
                )}
              </div>

              {features.length > 1 && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFeature(feature.id)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Remove feature"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              )}
            </div>

            {/* Description Row */}
            <div className="mb-3">
              <textarea
                placeholder="Add a brief description to help voters understand this feature (optional)"
                value={feature.description}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    updateFeature(feature.id, 'description', e.target.value);
                  }
                }}
                maxLength={500}
                rows={2}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all resize-none"
              />
              {feature.description && (
                <p className="mt-1 text-xs text-gray-400 text-right">
                  {feature.description.length}/500 characters
                </p>
              )}
            </div>

            {/* Effort & Impact Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Effort
                </label>
                <select
                  value={feature.effort}
                  onChange={(e) => updateFeature(feature.id, 'effort', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="">Select effort (0-10)</option>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} - {num === 0 ? 'Minimal' : num <= 3 ? 'Low' : num <= 6 ? 'Medium' : num <= 8 ? 'High' : 'Very High'}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-gray-500">How much work is required?</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Impact
                </label>
                <select
                  value={feature.impact}
                  onChange={(e) => updateFeature(feature.id, 'impact', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="">Select impact (0-10)</option>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} - {num === 0 ? 'Minimal' : num <= 3 ? 'Low' : num <= 6 ? 'Medium' : num <= 8 ? 'High' : 'Very High'}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-gray-500">What value will it bring?</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Feature Button */}
      <motion.button
        type="button"
        onClick={addFeature}
        disabled={features.length >= maxFeatures}
        whileHover={{ scale: features.length >= maxFeatures ? 1 : 1.02 }}
        whileTap={{ scale: features.length >= maxFeatures ? 1 : 0.98 }}
        className="w-full py-4 border-2 border-dashed border-primary/40 bg-primary/5 rounded-xl text-sm font-semibold text-primary hover:bg-primary/10 hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-50 disabled:text-gray-400 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Feature ({features.length}/{maxFeatures})
      </motion.button>

      {features.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50/30 border-2 border-dashed border-gray-300 rounded-xl"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-700 mb-2">No features added yet</p>
          <p className="text-sm text-gray-500">Click "Add Feature" above to get started</p>
        </motion.div>
      )}
    </div>
  );
}
