'use client';

import { motion, useScroll, useTransform, MotionValue, useMotionValueEvent } from 'framer-motion';
import { useRef, useState } from 'react';
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
  const prevScrollY = useRef(0);

  // Calculate total sentences across all paragraphs
  const totalSentences = paragraphs.reduce((sum, p) => sum + p.sentences.length, 0);

  // State for scroll direction and section activation
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [hasBeenActivated, setHasBeenActivated] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);

  // Track scroll progress through this section
  const { scrollYProgress, scrollY } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'], // Pin from start until it leaves viewport
  });

  // Detect scroll direction
  useMotionValueEvent(scrollY, "change", (latest) => {
    const direction = latest > prevScrollY.current ? 'down' : 'up';
    setScrollDirection(direction);
    prevScrollY.current = latest;
  });

  // Track section state (activation and reset)
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    // When scrolling up and leaving viewport (progress < 0)
    if (scrollDirection === 'up' && progress < 0) {
      setShouldReset(true);
      setHasBeenActivated(false);
    }

    // When entering from top while scrolling down
    if (scrollDirection === 'down' && progress > 0 && progress < 0.1) {
      if (shouldReset) {
        // Reset all sentences to faded
        setShouldReset(false);
      }
    }

    // Mark as activated when scrolling through
    if (progress > 0.9 && scrollDirection === 'down') {
      setHasBeenActivated(true);
    }
  });

  // Conditional sticky class based on scroll direction
  const stickyClass = scrollDirection === 'down'
    ? "sticky top-1/2 -translate-y-1/2"
    : "relative";

  return (
    <>
      {/* Spacer to create scroll distance - creates reading chamber */}
      <div ref={containerRef} className="relative bg-gray-50" style={{ height: `${totalSentences * 80}vh` }}>
        {/* Sticky container - conditionally sticky based on scroll direction */}
        <div className={`${stickyClass} left-0 right-0 py-12 z-0`}>
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
                    scrollDirection={scrollDirection}
                    hasBeenActivated={hasBeenActivated}
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
  scrollDirection: 'up' | 'down';
  hasBeenActivated: boolean;
  reducedMotion: boolean;
}

function ParagraphHighlight({
  sentences,
  startIndex,
  totalSentences,
  scrollProgress,
  scrollDirection,
  hasBeenActivated,
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
          scrollDirection={scrollDirection}
          hasBeenActivated={hasBeenActivated}
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
  scrollDirection: 'up' | 'down';
  hasBeenActivated: boolean;
}

function SentenceSpan({
  sentence,
  globalIndex,
  totalSentences,
  scrollProgress,
  scrollDirection,
  hasBeenActivated,
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

  // When scrolling up, keep sentences highlighted
  // When scrolling down, progressive highlighting
  const fontWeight = scrollDirection === 'up' && hasBeenActivated
    ? useTransform(activation, [0, 1], [700, 700]) // Stay bold
    : useTransform(activation, [0, 1], [400, 700]); // Normal progression

  const color = scrollDirection === 'up' && hasBeenActivated
    ? useTransform(activation, [0, 1], ['rgb(17, 24, 39)', 'rgb(17, 24, 39)']) // Stay dark
    : useTransform(activation, [0, 1], ['rgb(156, 163, 175)', 'rgb(17, 24, 39)']); // gray-400 → gray-900

  return (
    <motion.span
      style={{
        fontWeight,
        color,
      }}
      className="inline text-3xl"
    >
      {sentence}{" "}
    </motion.span>
  );
}
