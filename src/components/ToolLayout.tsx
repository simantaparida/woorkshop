'use client';

import { AppLayout } from '@/components/AppLayout';
import { ToolProgress } from '@/components/ToolProgress';
import { ReactNode } from 'react';

interface ToolLayoutProps {
  toolSlug: string;
  currentStep?: number;
  totalSteps?: number;
  stepLabels?: string[];
  onStepClick?: (step: number) => void;
  canNavigate?: boolean;
  children: ReactNode;
}

export function ToolLayout({
  toolSlug,
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick,
  canNavigate,
  children
}: ToolLayoutProps) {
  return (
    <AppLayout>
      {currentStep && totalSteps && (
        <ToolProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
          onStepClick={onStepClick}
          canNavigate={canNavigate}
        />
      )}
      {children}
    </AppLayout>
  );
}
