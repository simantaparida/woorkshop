'use client';

import { AppLayout } from '@/components/AppLayout';
import { ToolsCatalog } from '@/components/ToolsCatalog';
import { RecentWorkshops } from '@/components/RecentWorkshops';
import { RecentActivities } from '@/components/RecentActivities';
import { RecentToolSessions } from '@/components/RecentToolSessions';
import { Button } from '@/components/ui/Button';
import { Users, Wrench, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to UX Play</h1>
            <p className="text-gray-500 mt-1">Choose a facilitation tool to get started</p>
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
              onClick={() => router.push('/tools')}
            >
              <Wrench className="w-4 h-4" />
              Browse Tools
            </Button>
          </div>
        </div>

        {/* Facilitation Tools */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Facilitation Tools</h2>
              <p className="text-gray-500 mt-1">Structured frameworks for your workshops</p>
            </div>
            <Link
              href="/tools"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ToolsCatalog layout="grid" limit={4} />
        </section>

        {/* Recent Workshops - Full Width */}
        <RecentWorkshops />

        {/* Recent Tool Sessions */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Tool Sessions</h2>
          <RecentToolSessions limit={5} />
        </section>

        {/* Recent Activities */}
        <RecentActivities />

      </div>
    </AppLayout>
  );
}
