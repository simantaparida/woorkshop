'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { User, Type, FileText } from 'lucide-react';

interface TopicFormProps {
  onSubmit: (data: { title: string; description?: string; facilitatorName: string }) => void;
  loading?: boolean;
}

export function TopicForm({ onSubmit, loading }: TopicFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [facilitatorName, setFacilitatorName] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('pf_participant_name');
    if (storedName) {
      setFacilitatorName(storedName);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description: description || undefined,
      facilitatorName
    });
  };

  const isValid = title.trim().length > 0 && facilitatorName.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Facilitator Name Input */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          Your Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="name"
            type="text"
            required
            value={facilitatorName}
            onChange={(e) => setFacilitatorName(e.target.value)}
            placeholder="Enter your name"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
            disabled={loading}
          />
        </div>
      </div>

      {/* Topic Title Input */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
          Topic Title <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Type className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., User Onboarding Pain Points"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
            disabled={loading}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          What problem will your team frame together?
        </p>
      </div>

      {/* Description Input */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
          Description <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any context or background information..."
            rows={4}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all bg-gray-50 focus:bg-white"
            disabled={loading}
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full py-4 text-base font-semibold shadow-lg shadow-blue-200/50 hover:shadow-blue-300/50 transition-all"
          disabled={!isValid || loading}
        >
          {loading ? 'Creating Session...' : 'Create Session'}
        </Button>
      </div>
    </form>
  );
}
