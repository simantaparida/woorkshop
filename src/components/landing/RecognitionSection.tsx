'use client';

import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef, memo } from 'react';
import { useReducedMotion } from '@/lib/motion';
import { recognitionContent } from '@/data/recognition-content';

// ============================================================================
// CONSTANTS
// ============================================================================

const SCROLL_HEIGHT_PER_SENTENCE = 50; // vh per sentence (faster highlighting)

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RecognitionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Calculate total sentences across all paragraphs
  const totalSentences = recognitionContent.reduce((sum, p) => sum + p.sentences.length, 0);

  // Track scroll progress through this section
  // Start when section top reaches center, end when section bottom reaches center
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
              <p key={pIndex} className="text-2xl sm:text-3xl leading-snug text-gray-900 font-bold">
                {paragraph.sentences.join(' ')}
              </p>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-gray-50">
      {/* Top spacer for normal scroll before sticky behavior starts */}
      <div className="h-[50vh]" />

      <div
        ref={containerRef}
        className="relative"
        style={{
          // Total height = highlighting space only
          height: `${totalSentences * SCROLL_HEIGHT_PER_SENTENCE}vh`,
        }}
      >
        {/* Sticky container - stays centered in viewport during highlighting */}
        <div className="sticky top-1/2 left-0 right-0 -translate-y-1/2">
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
    </section>
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
  // Each sentence gets an equal portion of the scroll range
  const segmentSize = 1 / totalSentences;
  const startProgress = globalIndex * segmentSize;
  const endProgress = (globalIndex + 1) * segmentSize;

  // Smooth fade in/out with 20% overlap
  const fadeInEnd = startProgress + segmentSize * 0.2;
  const fadeOutStart = endProgress - segmentSize * 0.2;

  // Map scroll progress to color (gray → black)
  const color = useTransform(
    scrollProgress,
    [startProgress, fadeInEnd, fadeOutStart, endProgress],
    [
      'rgb(156, 163, 175)', // gray-400 (faded)
      'rgb(17, 24, 39)',    // gray-900 (dark)
      'rgb(17, 24, 39)',    // gray-900 (stay dark)
      'rgb(156, 163, 175)'  // gray-400 (fade out)
    ]
  );

  return (
    <motion.span
      style={{ color }}
      className="inline text-2xl sm:text-3xl font-bold"
    >
      {sentence}{' '}
    </motion.span>
  );
});
