'use client';

import { AppLayout } from '@/components/AppLayout';
import { ToolsCatalog } from '@/components/ToolsCatalog';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ToolsPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Facilitation Tool
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a structured framework to guide your workshop session. Each tool provides a proven methodology to help teams make better decisions together.
          </p>
        </div>

        {/* Tools Grid */}
        <ToolsCatalog layout="grid" />

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 rounded-xl border border-blue-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Not sure which tool to use?
          </h3>
          <p className="text-gray-600 mb-4">
            Each tool serves a specific purpose:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <strong>Problem Framing:</strong> Use when you need to deeply understand a problem before solving it
            </li>
            <li>
              <strong>Dot Voting:</strong> Use when you want team members to democratically vote on ideas
            </li>
            <li>
              <strong>RICE Prioritization:</strong> Use when you need to score ideas based on reach, impact, confidence, and effort
            </li>
            <li>
              <strong>MoSCoW Prioritization:</strong> Use when you need to categorize features by Must/Should/Could/Won't Have
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
