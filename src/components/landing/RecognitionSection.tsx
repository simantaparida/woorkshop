'use client';

import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef, memo } from 'react';
import { useReducedMotion } from '@/lib/motion';
import { recognitionContent } from '@/data/recognition-content';

// ============================================================================
// CONSTANTS
// ============================================================================

const TRANSITION_OVERLAP = 0.3; // 30% overlap for smooth transitions
const SCROLL_HEIGHT_PER_SENTENCE = 40; // vh per sentence

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RecognitionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Calculate total sentences across all paragraphs
  const totalSentences = recognitionContent.reduce((sum, p) => sum + p.sentences.length, 0);

  // Track scroll progress through this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  // Handle reduced motion preference
  if (reducedMotion) {
    return (
      <section className="relative bg-gray-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {recognitionContent.map((paragraph, pIndex) => (
              <p key={pIndex} className="text-2xl sm:text-3xl leading-snug text-gray-900">
                {paragraph.sentences.join(' ')}
              </p>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-gray-50"
      style={{
        height: `${totalSentences * SCROLL_HEIGHT_PER_SENTENCE}vh`,
        paddingTop: '50vh'
      }}
    >
      {/* Sticky container - vertically centered, pinned while page scrolls underneath */}
      <div className="sticky top-1/2 -translate-y-1/2 left-0 right-0 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {recognitionContent.map((paragraph, pIndex) => {
              // Calculate starting index for this paragraph
              const startIndex = recognitionContent
                .slice(0, pIndex)
                .reduce((sum, p) => sum + p.sentences.length, 0);

              return (
                <ParagraphHighlight
                  key={pIndex}
                  sentences={paragraph.sentences}
                  startIndex={startIndex}
                  totalSentences={totalSentences}
                  scrollProgress={scrollYProgress}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PARAGRAPH COMPONENT
// ============================================================================

interface ParagraphHighlightProps {
  sentences: string[];
  startIndex: number;
  totalSentences: number;
  scrollProgress: MotionValue<number>;
}

const ParagraphHighlight = memo(function ParagraphHighlight({
  sentences,
  startIndex,
  totalSentences,
  scrollProgress,
}: ParagraphHighlightProps) {
  return (
    <p className="text-2xl sm:text-3xl leading-snug">
      {sentences.map((sentence, sentenceIndex) => (
        <SentenceSpan
          key={sentenceIndex}
          sentence={sentence}
          globalIndex={startIndex + sentenceIndex}
          totalSentences={totalSentences}
          scrollProgress={scrollProgress}
        />
      ))}
    </p>
  );
});

// ============================================================================
// SENTENCE COMPONENT
// ============================================================================

interface SentenceSpanProps {
  sentence: string;
  globalIndex: number;
  totalSentences: number;
  scrollProgress: MotionValue<number>;
}

const SentenceSpan = memo(function SentenceSpan({
  sentence,
  globalIndex,
  totalSentences,
  scrollProgress,
}: SentenceSpanProps) {
  // Calculate when this sentence should be active
  const segmentSize = 1 / totalSentences;
  const startProgress = globalIndex * segmentSize;
  const endProgress = (globalIndex + 1) * segmentSize;

  // Map scroll progress to sentence activation (0 = inactive, 1 = active)
  const activation = useTransform(
    scrollProgress,
    [
      startProgress,
      startProgress + segmentSize * TRANSITION_OVERLAP,
      endProgress - segmentSize * TRANSITION_OVERLAP,
      endProgress
    ],
    [0, 1, 1, 0]
  );

  // Color: gray-400 → gray-900
  const color = useTransform(
    activation,
    [0, 1],
    ['rgb(156, 163, 175)', 'rgb(17, 24, 39)']
  );

  return (
    <motion.span
      style={{
        color,
      }}
      className="inline text-2xl sm:text-3xl font-bold"
    >
      {sentence}{' '}
    </motion.span>
  );
});
