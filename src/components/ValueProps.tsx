'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { Vote, Users, Grid2x2, Download } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: typeof Vote;
}

const features: Feature[] = [
  {
    title: '100-Point Voting',
    description: 'Give everyone 100 points to distribute. See where your team agrees instantly.',
    icon: Vote,
  },
  {
    title: 'Real-Time Collaboration',
    description: 'Everyone votes together. Results update as votes come in. No waiting.',
    icon: Users,
  },
  {
    title: 'Multiple Frameworks',
    description: 'RICE, MoSCoW, or simple voting. Use the methodology that fits your team.',
    icon: Grid2x2,
  },
  {
    title: 'Export to Action',
    description: 'Download results as CSV. Share priorities in Notion, Jira, or your roadmap.',
    icon: Download,
  },
];

export function ValueProps() {
  const { trackEvent } = useAnalytics();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const handleCTAClick = () => {
    trackEvent('value_prop_cta_click');
    // Scroll to demo or trigger modal
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            {/* Small Label */}
            <motion.div variants={itemVariants}>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full border border-blue-200">
                Product features · Trusted methods
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
            >
              Everything you need to prioritize as a team
            </motion.h2>

            {/* Subhead */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-600 leading-relaxed"
            >
              From simple voting to advanced scoring frameworks like RICE and MoSCoW, Padool gives you the right tools for every decision.
            </motion.p>

            {/* Features List */}
            <motion.div variants={itemVariants} className="space-y-6 pt-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="flex items-start gap-4 group"
                >
                  {/* Circle Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-105">
                    <feature.icon className="w-5 h-5" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <button
                onClick={handleCTAClick}
                data-analytics="value_prop_cta"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-base font-semibold rounded-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                aria-label="Try a demo flow"
              >
                <span className="relative">Start prioritizing now</span>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.div>
          </div>

          {/* Right Column - Image Placeholder */}
          <motion.div
            variants={itemVariants}
            className="relative lg:h-full flex items-center justify-center"
          >
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-sm">[Main UI Screenshot Placeholder]</span>
              <span className="text-xs mt-1 text-gray-400">Width: 100%, Aspect Ratio: 4/3</span>
            </div>

            {/* Decorative elements - Simple backdrops to keep it looking nice even as a placeholder */}
            <div className="absolute -z-10 -top-8 -right-8 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl"></div>
            <div className="absolute -z-10 -bottom-8 -left-8 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl"></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
