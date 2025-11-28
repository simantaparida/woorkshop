'use client';

import { AppLayout } from '@/components/AppLayout';
import { TemplateRecommendations } from '@/components/TemplateRecommendations';
import { RecentWorkshops } from '@/components/RecentWorkshops';
import { RecentActivities } from '@/components/RecentActivities';
import { Button } from '@/components/ui/Button';
import { Users, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Start new session</h1>
            <p className="text-gray-500 mt-1">Choose a template or start from scratch</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => { }} // TODO: Open Join Modal
            >
              <Users className="w-4 h-4" />
              Join Session
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => router.push('/projects/new')}
            >
              <Plus className="w-4 h-4" />
              New Workshop
            </Button>
          </div>
        </div>

        {/* Start Session Cards */}
        <TemplateRecommendations />

        {/* Bottom Section: Recent Workshops & Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <RecentWorkshops />
          <RecentActivities />
        </div>

      </div>
    </AppLayout>
  );
}
