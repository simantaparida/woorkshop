'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from '@/lib/motion';

const sentences = [
  "You've been in this meeting before.",
  "Someone speaks with confidence.\nSomeone else nods.\nA few people stay quiet — not because they agree,\nbut because it's easier.",
  "Ideas get filtered by volume.\nDecisions get made by momentum.\nAnd the roadmap slowly drifts.",
  "Not because the team is bad.",
  "But because the process is broken.",
];

export function RecognitionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Track scroll progress through this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'], // Pin from start until it leaves viewport
  });

  return (
    <>
      {/* Spacer to create scroll distance */}
      <div ref={containerRef} className="relative bg-gray-50" style={{ height: `${sentences.length * 80}vh` }}>
        {/* Sticky container - vertically centered, no horizontal movement */}
        <div className="sticky top-1/2 -translate-y-1/2 left-0 right-0 py-12">
          <div className="max-w-4xl mx-auto px-6">
            <div className="space-y-4">
              {sentences.map((sentence, index) => (
                <SentenceHighlight
                  key={index}
                  sentence={sentence}
                  index={index}
                  totalSentences={sentences.length}
                  scrollProgress={scrollYProgress}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface SentenceHighlightProps {
  sentence: string;
  index: number;
  totalSentences: number;
  scrollProgress: any;
  reducedMotion: boolean;
}

function SentenceHighlight({
  sentence,
  index,
  totalSentences,
  scrollProgress,
  reducedMotion,
}: SentenceHighlightProps) {
  // Calculate when this sentence should be active
  // Each sentence gets an equal portion of the scroll range
  const segmentSize = 1 / totalSentences;
  const startProgress = index * segmentSize;
  const endProgress = (index + 1) * segmentSize;

  // Map scroll progress to sentence activation (0 = inactive, 1 = active)
  // Wider transition zones for smoother, more fluid feel
  const activation = useTransform(
    scrollProgress,
    [startProgress, startProgress + segmentSize * 0.3, endProgress - segmentSize * 0.3, endProgress],
    [0, 1, 1, 0]
  );

  // Active state transforms - smooth interpolation, no snapping
  // Font size: base 1.875rem (30px) → +7% (2rem / 32px on active)
  const baseFontSize = 1.875; // 30px in rem
  const activeFontSize = baseFontSize * 1.07; // +7%
  const fontSize = useTransform(activation, [0, 1], [`${baseFontSize}rem`, `${activeFontSize}rem`]);

  // Font weight: 400 (normal) → 500 (medium)
  const fontWeight = useTransform(activation, [0, 1], [400, 500]);

  // Opacity: 45% (muted) → 100% (full)
  const opacity = useTransform(activation, [0, 1], [0.45, 1]);

  // Color: smooth transition from muted gray to black
  const color = useTransform(
    activation,
    [0, 1],
    ['rgb(107, 114, 128)', 'rgb(17, 24, 39)'] // gray-500 → gray-900
  );

  // Respect reduced motion preference
  if (reducedMotion) {
    return (
      <p className="text-3xl leading-snug text-gray-900 whitespace-pre-line">
        {sentence}
      </p>
    );
  }

  return (
    <motion.p
      style={{
        fontSize,
        fontWeight,
        opacity,
        color,
        lineHeight: 1.4,
        // Remove CSS transitions - let Framer Motion handle everything for smoother interpolation
      }}
      className="whitespace-pre-line"
    >
      {sentence}
    </motion.p>
  );
}
