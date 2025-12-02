import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { sanitizeString } from '@/lib/utils/validation';
import { copyToClipboard, getSessionLink } from '@/lib/utils/helpers';
import { ROUTES } from '@/lib/constants';
import type { ToolType } from '@/types';

type CreateType = 'workshop' | 'session';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: CreateType;
  workshopId?: string; // For creating sessions within a workshop
  defaultTool?: ToolType; // For creating sessions with a specific tool
}

interface FormData {
  title: string;
  description?: string;
  hostName?: string; // For sessions only
  firstFeature?: string; // For voting board sessions only
}

export function CreateModal({
  isOpen,
  onClose,
  type,
  workshopId,
  defaultTool
}: CreateModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    hostName: '',
    firstFeature: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = `${type.charAt(0).toUpperCase() + type.slice(1)} name is required`;
    }

    // For sessions, host name is required
    if (type === 'session' && !formData.hostName?.trim()) {
      newErrors.hostName = 'Your name is required';
    }

    // For voting board sessions, first feature is required
    if (type === 'session' && defaultTool === 'voting-board' && !formData.firstFeature?.trim()) {
      newErrors.firstFeature = 'At least one item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      let endpoint = '';
      let payload: any = {};
      let redirectRoute = '';

      // Build request based on type
      if (type === 'workshop') {
        endpoint = '/api/workshops';
        payload = {
          title: sanitizeString(formData.title),
          description: formData.description?.trim() ? sanitizeString(formData.description) : undefined,
          created_by: formData.hostName?.trim() ? sanitizeString(formData.hostName) : undefined,
        };
      } else if (type === 'session') {
        endpoint = '/api/sessions';
        payload = {
          title: sanitizeString(formData.title),
          description: formData.description?.trim() ? sanitizeString(formData.description) : undefined,
          created_by: formData.hostName?.trim() ? sanitizeString(formData.hostName) : undefined,
          host_name: sanitizeString(formData.hostName!),
          workshop_id: workshopId || null,
          tool_type: defaultTool || 'voting-board',
          session_config: {},
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to create ${type}`);
      }

      // Handle success based on type
      if (type === 'workshop') {
        showToast('Workshop created successfully!', 'success');
        router.push(ROUTES.WORKSHOP_DETAIL(data.workshop.id));
      } else if (type === 'session') {
        // Store host token and player ID for sessions
        localStorage.setItem(`host_token_${data.sessionId}`, data.hostToken);
        localStorage.setItem(`player_id_${data.sessionId}`, data.playerId);

        // Copy link to clipboard
        const sessionLink = getSessionLink(data.sessionId);
        await copyToClipboard(sessionLink);
        showToast('Session created! Link copied to clipboard', 'success');

        // Redirect to lobby
        router.push(ROUTES.LOBBY(data.sessionId));
      }

      onClose();

    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      showToast(
        error instanceof Error ? error.message : `Failed to create ${type}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Title and labels based on type
  const getTitle = () => {
    switch (type) {
      case 'workshop': return 'Create New Workshop';
      case 'session': return workshopId ? 'Add Session to Workshop' : 'Create New Session';
    }
  };

  const getTitleLabel = () => {
    switch (type) {
      case 'workshop': return 'Workshop Name';
      case 'session': return 'Session Name';
    }
  };

  const getTitlePlaceholder = () => {
    switch (type) {
      case 'workshop': return 'e.g., Q4 Product Planning';
      case 'session': return 'e.g., Feature Prioritization';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={getTitleLabel()}
                  placeholder={getTitlePlaceholder()}
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  error={errors.title}
                  autoFocus
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    placeholder="Add a brief description..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Session-specific fields */}
                {type === 'session' && (
                  <>
                    <Input
                      label="Your Name"
                      placeholder="e.g., Alex"
                      value={formData.hostName}
                      onChange={(e) => setFormData(prev => ({ ...prev, hostName: e.target.value }))}
                      error={errors.hostName}
                    />

                    {defaultTool === 'voting-board' && (
                      <Input
                        label="First Item to Vote On"
                        placeholder="e.g., User Authentication"
                        value={formData.firstFeature}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstFeature: e.target.value }))}
                        error={errors.firstFeature}
                      />
                    )}
                  </>
                )}

                <div className="flex gap-3 justify-end mt-8 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                  >
                    Create {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
