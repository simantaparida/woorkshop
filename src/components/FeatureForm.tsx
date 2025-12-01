'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { validateFeatureTitle } from '@/lib/utils/validation';
import { createReferenceLink, isValidUrl, getLinkTypeIcon } from '@/lib/utils/link-metadata';
import type { ReferenceLink } from '@/types';

interface FeatureInput {
  id: string;
  title: string;
  description: string;
  referenceLinks: ReferenceLink[];
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
          referenceLinks: [],
        },
      ]);
    }
  };

  const removeFeature = (id: string) => {
    onChange(features.filter((f) => f.id !== id));
    const newErrors = { ...errors };
    delete newErrors[`title-${id}`];
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
    }

    if (error) {
      setErrors({ ...errors, [`${field}-${id}`]: error });
    }
  };

  const addReferenceLink = (featureId: string, url: string) => {
    if (!url.trim() || !isValidUrl(url)) return;

    const link = createReferenceLink(url);
    onChange(
      features.map((f) =>
        f.id === featureId
          ? { ...f, referenceLinks: [...(f.referenceLinks || []), link] }
          : f
      )
    );
  };

  const removeReferenceLink = (featureId: string, linkIndex: number) => {
    onChange(
      features.map((f) =>
        f.id === featureId
          ? {
              ...f,
              referenceLinks: f.referenceLinks.filter((_, i) => i !== linkIndex),
            }
          : f
      )
    );
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative bg-gradient-to-br from-white to-gray-50/50 border-2 border-gray-200/80 rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all duration-300 group overflow-hidden"
          >
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Content */}
            <div className="relative">
              {/* Header Row: Number, Title, Remove Button */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary via-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-sm ring-2 ring-white mt-0.5">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    placeholder="✨ Feature title (e.g., Dark mode toggle)"
                    value={feature.title}
                    onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
                    onBlur={(e) => validateField(feature.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 bg-white/80 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white shadow-sm transition-all"
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
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 mt-0.5 shadow-sm"
                    title="Remove feature"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                )}
              </div>

              {/* Description Row */}
              <div className="mb-3 ml-10">
                <textarea
                  placeholder="💭 Brief description (optional)"
                  value={feature.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      updateFeature(feature.id, 'description', e.target.value);
                    }
                  }}
                  maxLength={500}
                  rows={2}
                  className="w-full px-3 py-2 bg-white/80 border-2 border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white shadow-sm transition-all resize-none"
                />
              </div>

              {/* Reference Links Section */}
              <div className="mt-3 pt-3 border-t border-gray-200/60 ml-10">
                <label className="flex items-center gap-1 text-xs font-semibold text-gray-700 mb-2">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Reference Links (Optional)
                </label>

                {/* Existing Links */}
                {feature.referenceLinks && feature.referenceLinks.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {feature.referenceLinks.map((link, linkIndex) => (
                      <div
                        key={linkIndex}
                        className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg border border-blue-200/50 group hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <img
                          src={link.favicon}
                          alt=""
                          className="w-3.5 h-3.5 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="text-sm flex-shrink-0">{getLinkTypeIcon(link.type)}</span>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-xs font-medium text-gray-700 hover:text-blue-600 truncate"
                        >
                          {link.title}
                        </a>
                        <button
                          type="button"
                          onClick={() => removeReferenceLink(feature.id, linkIndex)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                          title="Remove link"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Link Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="🔗 Paste URL (Jira, Figma, etc.)"
                    className="flex-1 px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-all"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.currentTarget;
                        addReferenceLink(feature.id, input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      if (input && input.value) {
                        addReferenceLink(feature.id, input.value);
                        input.value = '';
                      }
                    }}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm hover:shadow flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                </div>
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
        whileHover={{ scale: features.length >= maxFeatures ? 1 : 1.01 }}
        whileTap={{ scale: features.length >= maxFeatures ? 1 : 0.98 }}
        className="relative w-full py-3.5 border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/5 via-blue-500/5 to-indigo-500/5 rounded-xl text-sm font-bold text-primary hover:bg-primary/10 hover:border-primary hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-50 disabled:text-gray-400 flex items-center justify-center gap-2 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="relative z-10">Add Feature ({features.length}/{maxFeatures})</span>
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
