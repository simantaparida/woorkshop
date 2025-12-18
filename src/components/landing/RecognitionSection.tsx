'use client';

import { motion, useScroll, useTransform, MotionValue, useMotionValueEvent } from 'framer-motion';
import { useRef, useReducer, useCallback, memo, useMemo } from 'react';
import { useReducedMotion, CALM_EASE } from '@/lib/motion';
import { recognitionContent } from '@/data/recognition-content';

// ============================================================================
// CONSTANTS
// ============================================================================

const TRANSITION_OVERLAP = 0.3; // 30% overlap for smooth transitions
const ACTIVATION_THRESHOLD = 0.9; // 90% scroll progress to mark as activated
const RESET_THRESHOLD = 0.1; // 10% to reset when entering from top
const SCROLL_DIRECTION_THRESHOLD = 5; // Pixels to move before changing direction

// Responsive scroll heights (vh per sentence)
const SCROLL_HEIGHT_MOBILE = 50; // Shorter on mobile
const SCROLL_HEIGHT_DESKTOP = 80; // Standard on desktop

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

type ScrollState = {
  direction: 'up' | 'down';
  isActivated: boolean;
  isResetting: boolean;
};

type ScrollAction =
  | { type: 'SET_DIRECTION'; direction: 'up' | 'down' }
  | { type: 'ACTIVATE' }
  | { type: 'REQUEST_RESET' }
  | { type: 'COMPLETE_RESET' };

function scrollReducer(state: ScrollState, action: ScrollAction): ScrollState {
  switch (action.type) {
    case 'SET_DIRECTION':
      return { ...state, direction: action.direction };
    case 'ACTIVATE':
      return { ...state, isActivated: true };
    case 'REQUEST_RESET':
      return { ...state, isResetting: true, isActivated: false };
    case 'COMPLETE_RESET':
      return { ...state, isResetting: false };
    default:
      return state;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RecognitionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const prevScrollY = useRef(0);
  const scrollDirectionTimeout = useRef<NodeJS.Timeout | null>(null);

  // Calculate total sentences across all paragraphs
  const totalSentences = recognitionContent.reduce((sum, p) => sum + p.sentences.length, 0);

  // State management with useReducer
  const [state, dispatch] = useReducer(scrollReducer, {
    direction: 'down',
    isActivated: false,
    isResetting: false,
  });

  // Track scroll progress through this section
  const { scrollYProgress, scrollY } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Throttled scroll direction detection
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const diff = latest - prevScrollY.current;

    // Only update direction if movement exceeds threshold (reduces re-renders)
    if (Math.abs(diff) > SCROLL_DIRECTION_THRESHOLD) {
      const newDirection = diff > 0 ? 'down' : 'up';

      // Debounce direction changes to prevent flickering
      if (scrollDirectionTimeout.current) {
        clearTimeout(scrollDirectionTimeout.current);
      }

      scrollDirectionTimeout.current = setTimeout(() => {
        dispatch({ type: 'SET_DIRECTION', direction: newDirection });
      }, 50);

      prevScrollY.current = latest;
    }
  });

  // Track section state (activation and reset)
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    // When scrolling up and leaving viewport (progress < 0)
    if (state.direction === 'up' && progress < 0 && state.isActivated) {
      dispatch({ type: 'REQUEST_RESET' });
    }

    // When entering from top while scrolling down
    if (state.direction === 'down' && progress > 0 && progress < RESET_THRESHOLD) {
      if (state.isResetting) {
        dispatch({ type: 'COMPLETE_RESET' });
      }
    }

    // Mark as activated when scrolling through
    if (progress > ACTIVATION_THRESHOLD && state.direction === 'down' && !state.isActivated) {
      dispatch({ type: 'ACTIVATE' });
    }
  });

  // Calculate responsive scroll height using CSS custom property
  const scrollHeight = useMemo(() => {
    // Use CSS clamp for responsive behavior
    return `calc(${totalSentences} * clamp(${SCROLL_HEIGHT_MOBILE}vh, 10vw + ${SCROLL_HEIGHT_MOBILE}vh, ${SCROLL_HEIGHT_DESKTOP}vh))`;
  }, [totalSentences]);

  // Handle reduced motion preference at section level
  if (reducedMotion) {
    return (
      <section
        className="relative bg-gray-50 py-24"
        aria-label="Recognition of common meeting challenges"
      >
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
    <div ref={containerRef} className="relative bg-gray-50" style={{ height: scrollHeight }}>
      {/* Sticky container - vertically centered, pinned while page scrolls underneath */}
      <div className="sticky top-1/2 -translate-y-1/2 left-0 right-0 py-12 z-0">
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
                  scrollDirection={state.direction}
                  isActivated={state.isActivated}
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
  scrollDirection: 'up' | 'down';
  isActivated: boolean;
}

const ParagraphHighlight = memo(function ParagraphHighlight({
  sentences,
  startIndex,
  totalSentences,
  scrollProgress,
  scrollDirection,
  isActivated,
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
          scrollDirection={scrollDirection}
          isActivated={isActivated}
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
  scrollDirection: 'up' | 'down';
  isActivated: boolean;
}

const SentenceSpan = memo(function SentenceSpan({
  sentence,
  globalIndex,
  totalSentences,
  scrollProgress,
  scrollDirection,
  isActivated,
}: SentenceSpanProps) {
  // Calculate when this sentence should be active
  const segmentSize = 1 / totalSentences;
  const startProgress = globalIndex * segmentSize;
  const endProgress = (globalIndex + 1) * segmentSize;

  // Create base activation value (always call hooks unconditionally)
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

  // Font weight transformation - unconditional hook calls
  const fontWeightDown = useTransform(activation, [0, 1], [400, 700]);
  const fontWeightUp = useTransform(activation, [0, 1], [700, 700]);

  // Color transformation - unconditional hook calls
  const colorDown = useTransform(
    activation,
    [0, 1],
    ['rgb(156, 163, 175)', 'rgb(17, 24, 39)']
  );
  const colorUp = useTransform(
    activation,
    [0, 1],
    ['rgb(17, 24, 39)', 'rgb(17, 24, 39)']
  );

  // Select the appropriate motion values based on state (after hook calls)
  const fontWeight = scrollDirection === 'up' && isActivated ? fontWeightUp : fontWeightDown;
  const color = scrollDirection === 'up' && isActivated ? colorUp : colorDown;

  return (
    <motion.span
      style={{
        fontWeight,
        color,
      }}
      transition={{
        duration: 0.4,
        ease: CALM_EASE as any,
      }}
      className="inline text-2xl sm:text-3xl"
    >
      {sentence}{' '}
    </motion.span>
  );
});
