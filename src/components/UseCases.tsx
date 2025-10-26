'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

interface UseCase {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: JSX.Element;
  gradient: string;
  iconBg: string;
}

export function UseCases() {
  const { trackEvent } = useAnalytics();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleCardClick = (useCaseId: string) => {
    trackEvent('use_case_card_clicked', { use_case: useCaseId });
  };

  const handleCTAClick = () => {
    trackEvent('use_case_cta_clicked');
  };

  const useCases: UseCase[] = [
    {
      id: 'product-teams',
      title: 'Product Teams',
      description: 'Align stakeholders on feature priorities before sprint planning. Replace long debates with clear, ranked outcomes.',
      tags: ['Sprint planning', 'Roadmaps', 'Stakeholder alignment'],
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: 'ux-designers',
      title: 'UX Designers',
      description: 'Run quick prioritization workshops with users or cross-functional peers. Surface which designs matter most.',
      tags: ['Design sprints', 'Usability', 'Research synthesis'],
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      id: 'startup-founders',
      title: 'Startup Founders',
      description: 'Move from intuition to consensus. Make product bets faster with team-backed priorities.',
      tags: ['MVP planning', 'Fast decisions', 'Resource trade-offs'],
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'remote-teams',
      title: 'Remote Teams',
      description: 'Run async prioritization across time zones. Everyone votes when convenient — results update live.',
      tags: ['Async workflows', 'Distributed teams', 'Time-zone friendly'],
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-gray-700">Who Padool helps</span>
          </div>

          {/* H2 */}
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Perfect for teams who move with purpose
          </h2>

          {/* Subhead */}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Padool fits into the rhythms of product and design teams — from sprint planning to async decision-making. Pick a use case to see how it helps.
          </p>
        </motion.div>

        {/* Use Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => handleCardClick(useCase.id)}
              data-analytics="use-case-card"
              tabIndex={0}
              role="button"
              aria-label={`Learn more about ${useCase.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCardClick(useCase.id);
                }
              }}
              className="group bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${useCase.iconBg} mb-5`}>
                {useCase.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {useCase.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {useCase.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {useCase.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Link
            href="/templates"
            onClick={handleCTAClick}
            data-analytics="use-case-cta"
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white text-base font-semibold rounded-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center gap-2">
              See templates & examples
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
