'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { User } from 'lucide-react';

interface JoinFormProps {
  onJoin: (name: string) => void;
  loading?: boolean;
}

export function JoinForm({ onJoin, loading }: JoinFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
          <User className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1.5">
          Join the Session
        </h2>
        <p className="text-sm text-gray-600 text-center">
          Enter your name to participate in this problem framing session
        </p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Your Name *
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          disabled={loading}
          autoFocus
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!name.trim() || loading}
      >
        {loading ? 'Joining...' : 'Join Session'}
      </Button>
    </form>
  );
}
