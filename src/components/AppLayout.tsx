'use client';

import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Full-width Header on Top */}
      <AppHeader />

      {/* Sidebar and Main Content Below Header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
