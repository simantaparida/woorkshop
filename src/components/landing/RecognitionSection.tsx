'use client';

import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from '@/lib/motion';

const paragraphs = [
  {
    sentences: ["You've been in this meeting before."]
  },
  {
    sentences: [
      "Someone speaks with confidence.",
      "Someone else nods.",
      "A few people stay quiet — not because they agree, but because it's easier."
    ]
  },
  {
    sentences: [
      "Ideas get filtered by volume.",
      "Decisions get made by momentum.",
      "And the roadmap slowly drifts.",
      "Not because the team is bad.",
      "But because the process is broken."
    ]
  }
];

export function RecognitionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Calculate total sentences across all paragraphs
  const totalSentences = paragraphs.reduce((sum, p) => sum + p.sentences.length, 0);

  // Track scroll progress through this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'], // Pin from start until it leaves viewport
  });

  return (
    <>
      {/* Spacer to create scroll distance - creates reading chamber */}
      <div ref={containerRef} className="relative bg-gray-50" style={{ height: `${totalSentences * 80}vh` }}>
        {/* Sticky container - vertically centered, pinned while page scrolls underneath */}
        <div className="sticky top-1/2 -translate-y-1/2 left-0 right-0 py-12 z-0">
          <div className="max-w-4xl mx-auto px-6">
            <div className="space-y-8">
              {paragraphs.map((paragraph, pIndex) => {
                // Calculate starting index for this paragraph
                const startIndex = paragraphs
                  .slice(0, pIndex)
                  .reduce((sum, p) => sum + p.sentences.length, 0);

                return (
                  <ParagraphHighlight
                    key={pIndex}
                    sentences={paragraph.sentences}
                    startIndex={startIndex}
                    totalSentences={totalSentences}
                    scrollProgress={scrollYProgress}
                    reducedMotion={reducedMotion}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface ParagraphHighlightProps {
  sentences: string[];
  startIndex: number;
  totalSentences: number;
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}

function ParagraphHighlight({
  sentences,
  startIndex,
  totalSentences,
  scrollProgress,
  reducedMotion,
}: ParagraphHighlightProps) {
  // Respect reduced motion preference
  if (reducedMotion) {
    return (
      <p className="text-3xl leading-snug text-gray-900">
        {sentences.join(' ')}
      </p>
    );
  }

  return (
    <p className="text-3xl leading-snug">
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
}

interface SentenceSpanProps {
  sentence: string;
  globalIndex: number;
  totalSentences: number;
  scrollProgress: MotionValue<number>;
}

function SentenceSpan({
  sentence,
  globalIndex,
  totalSentences,
  scrollProgress,
}: SentenceSpanProps) {
  // Calculate when this sentence should be active
  // Each sentence gets an equal portion of the scroll range
  const segmentSize = 1 / totalSentences;
  const startProgress = globalIndex * segmentSize;
  const endProgress = (globalIndex + 1) * segmentSize;

  // Map scroll progress to sentence activation (0 = inactive, 1 = active)
  // Wider transition zones for smoother, more fluid feel
  const activation = useTransform(
    scrollProgress,
    [startProgress, startProgress + segmentSize * 0.3, endProgress - segmentSize * 0.3, endProgress],
    [0, 1, 1, 0]
  );

  // Active state transforms - only color and weight change
  // Font weight: 400 (normal) → 700 (bold)
  const fontWeight = useTransform(activation, [0, 1], [400, 700]);

  // Color: smooth transition from muted gray to black
  const color = useTransform(
    activation,
    [0, 1],
    ['rgb(156, 163, 175)', 'rgb(17, 24, 39)'] // gray-400 → gray-900
  );

  return (
    <motion.span
      style={{
        fontWeight,
        color,
      }}
      className="inline"
    >
      {sentence}{" "}
    </motion.span>
  );
}
