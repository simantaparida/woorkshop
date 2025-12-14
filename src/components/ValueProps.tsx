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
    title: 'From Opinions to Data',
    description: '"Feature A scores 85/100. Feature B scores 42. Ship A first." Turn subjective debates into objective numbers.',
    icon: Vote,
  },
  {
    title: 'Force Real Trade-offs',
    description: 'When everyone gets 100 points total, priorities get real. No more "everything is high priority."',
    icon: Users,
  },
  {
    title: 'Democratize Decision-Making',
    description: 'Everyone votes simultaneously. No anchoring bias. No loud voices dominating. Just data.',
    icon: Grid2x2,
  },
  {
    title: 'Don't End at a Decision',
    description: 'Export to CSV. Import to Jira. Move forward. From session to shipped in minutes.',
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
              <span className="inline-block px-3 py-1 text-xs font-semibold text-clarity bg-green-50 rounded-full border border-green-200">
                The Woorkshop Method
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
            >
              Structure beats chaos.
              <br />
              Every single time.
            </motion.h2>

            {/* Subhead */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-600 leading-relaxed"
            >
              Stop arguing. Start scoring. Walk away with priorities everyone believes in—backed by frameworks product teams actually use.
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

            {/* Honest Feedback Block */}
            <motion.div variants={itemVariants} className="pt-4">
              <div className="bg-warning/10 border-2 border-warning/30 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      We're in public review. We need your honest feedback.
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      This isn't perfect yet—we know that. But if structured prioritization sounds useful to your team, we'd love to hear what we got right (and what we got wrong).
                    </p>
                    <a
                      href="mailto:hello@woorkshop.app"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-warning hover:text-warning/80 transition-colors"
                    >
                      Give us feedback
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
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
