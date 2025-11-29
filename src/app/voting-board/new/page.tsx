'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FeatureForm } from '@/components/FeatureForm';
import { AppLayout } from '@/components/AppLayout';
import { useToast } from '@/components/ui/Toast';
import { validateSessionName, validateFeatures, sanitizeString } from '@/lib/utils/validation';
import { copyToClipboard, getSessionLink } from '@/lib/utils/helpers';
import { ROUTES } from '@/lib/constants';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

interface FeatureInput {
  id: string;
  title: string;
  description: string;
  effort: string;
  impact: string;
}

export default function NewVotingBoardPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const { trackEvent } = useAnalytics();

  const [hostName, setHostName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [features, setFeatures] = useState<FeatureInput[]>([
    { id: '1', title: '', description: '', effort: '', impact: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      showToast('Voting Board created! Link copied to clipboard', 'success');

      trackEvent('voting_board_created', {
        featureCount: validFeatures.length,
      });

      // Redirect to lobby
      setTimeout(() => {
        router.push(ROUTES.LOBBY(data.sessionId));
      }, 500);
    } catch (error) {
      console.error('Error creating voting board:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to create voting board',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      {ToastContainer}

      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Page Header with Actions */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => router.push('/tools')}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Tools
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Voting Board
              </h1>
              <p className="text-gray-600">
                Set up a 100-point effort scoring session for your team
              </p>
            </div>

            {/* Action Buttons - Top Right */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/tools')}
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
                Create Voting Board →
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
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    label="Voting Board Name"
                    placeholder="e.g., Q1 Feature Prioritization"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    error={errors.projectName}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Give your voting session a clear, descriptive name
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
                  <h2 className="text-lg font-semibold text-gray-900">Items to Vote On</h2>
                </div>
                <span className="text-sm text-gray-500">
                  {features.filter(f => f.title.trim()).length} / 10 items
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Add items you want your team to vote on (max 10). Each participant gets 100 points to distribute across these items.
              </p>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Each participant gets 100 points to distribute</li>
                  <li>• Allocate points based on effort or priority</li>
                  <li>• See ranked results based on total points</li>
                </ul>
              </div>

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
    </AppLayout>
  );
}
