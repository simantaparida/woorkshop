'use client';

import { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Full-width Header on Top */}
      <AppHeader onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Sidebar and Main Content Below Header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <AppSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
