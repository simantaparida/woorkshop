'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FeatureForm } from '@/components/FeatureForm';
import { useToast } from '@/components/ui/Toast';
import { validateSessionName, validateFeatures, sanitizeString } from '@/lib/utils/validation';
import { copyToClipboard, getSessionLink } from '@/lib/utils/helpers';
import { ROUTES } from '@/lib/constants';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { TEMPLATES } from '@/lib/constants/templates';

interface FeatureInput {
  id: string;
  title: string;
  description: string;
  effort: string;
  impact: string;
}

export default function CreateSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, ToastContainer } = useToast();
  const { trackEvent } = useAnalytics();

  const [hostName, setHostName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [features, setFeatures] = useState<FeatureInput[]>([
    { id: '1', title: '', description: '', effort: '', impact: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load template if template parameter is present
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId) {
      const template = TEMPLATES.find(t => t.id === templateId);
      if (template) {
        setProjectName(template.name);
        setFeatures(template.features.map((f, index) => ({
          id: String(index + 1),
          title: f.title,
          description: f.description || '',
          effort: f.effort ? String(f.effort) : '',
          impact: f.impact ? String(f.impact) : '',
        })));
      }
    }
  }, [searchParams]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!hostName.trim()) {
      newErrors.hostName = 'Your name is required';
    }

    const projectError = validateSessionName(projectName);
    if (projectError) {
      newErrors.projectName = projectError;
    }

    const validFeatures = features.filter((f) => f.title.trim().length > 0);
    const featuresError = validateFeatures(validFeatures);
    if (featuresError) {
      newErrors.features = featuresError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    setLoading(true);

    try {
      const validFeatures = features
        .filter((f) => f.title.trim().length > 0)
        .map((f) => ({
          title: sanitizeString(f.title),
          description: f.description.trim() ? sanitizeString(f.description) : undefined,
          effort: f.effort ? parseInt(f.effort, 10) : undefined,
          impact: f.impact ? parseInt(f.impact, 10) : undefined,
        }));

      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: sanitizeString(hostName),
          projectName: sanitizeString(projectName),
          features: validFeatures,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      // Store host token and player ID
      localStorage.setItem(`host_token_${data.sessionId}`, data.hostToken);
      localStorage.setItem(`player_id_${data.sessionId}`, data.playerId);

      // Copy link to clipboard
      const sessionLink = getSessionLink(data.sessionId);
      await copyToClipboard(sessionLink);
      showToast('Session created! Link copied to clipboard', 'success');

      trackEvent('session_created', {
        featureCount: validFeatures.length,
      });

      // Redirect to lobby
      setTimeout(() => {
        router.push(ROUTES.LOBBY(data.sessionId));
      }, 500);
    } catch (error) {
      console.error('Error creating session:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to create session',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {ToastContainer}

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button */}
            <button
              onClick={() => router.push(ROUTES.CREATE)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="font-semibold text-lg text-gray-900">UX Works</span>
            </div>

            {/* Progress Indicator */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2 text-primary font-medium">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</div>
                <span>Setup</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">2</div>
                <span>Share</span>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">3</div>
                <span>Vote</span>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => router.push(ROUTES.HOME)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Back Button */}
            <button
              onClick={() => router.push(ROUTES.HOME)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* Page Header with Actions */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Create Session
                </h1>
                <p className="text-gray-600">
                  Set up your prioritization session in a few simple steps
                </p>
              </div>

              {/* Action Buttons - Top Right */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(ROUTES.HOME)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  onClick={handleSubmit}
                >
                  Create Session →
                </Button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Session Details - Full Width, Side by Side Fields */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Session Details</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Your Name"
                    placeholder="e.g., Alice Johnson"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    error={errors.hostName}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be shown to participants as the session host
                  </p>
                </div>

                <div>
                  <Input
                    label="Project Name"
                    placeholder="e.g., Mobile App Redesign"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    error={errors.projectName}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Give your session a clear, descriptive name
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Features Section - Full Width Below */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Features to Prioritize</h2>
                </div>
                <span className="text-sm text-gray-500">
                  {features.filter(f => f.title.trim()).length} / 10 features
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Add features you want your team to vote on (max 10). Effort and impact ratings are optional.
              </p>

              <FeatureForm features={features} onChange={setFeatures} />

              {errors.features && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.features}
                  </p>
                </motion.div>
              )}
            </motion.div>

            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}
