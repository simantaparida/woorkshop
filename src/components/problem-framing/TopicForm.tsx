'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface TopicFormProps {
  onSubmit: (data: { title: string; description?: string }) => void;
  loading?: boolean;
}

export function TopicForm({ onSubmit, loading }: TopicFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description: description || undefined });
  };

  const isValid = title.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Topic Title *
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., User Onboarding Pain Points"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          What problem will your team frame together?
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any context or background information..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          disabled={loading}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!isValid || loading}
        >
          {loading ? 'Creating Session...' : 'Create Session'}
        </Button>
      </div>
    </form>
  );
}
