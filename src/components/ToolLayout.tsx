'use client';

import { AppLayout } from '@/components/AppLayout';
import { ToolProgress } from '@/components/ToolProgress';
import { ReactNode } from 'react';

interface ToolLayoutProps {
  toolSlug: string;
  currentStep?: number;
  totalSteps?: number;
  stepLabels?: string[];
  children: ReactNode;
}

export function ToolLayout({
  toolSlug,
  currentStep,
  totalSteps,
  stepLabels,
  children
}: ToolLayoutProps) {
  return (
    <AppLayout>
      {currentStep && totalSteps && (
        <ToolProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
        />
      )}
      {children}
    </AppLayout>
  );
}
