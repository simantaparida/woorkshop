'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const gap = 12; // Increased gap between button and tooltip
      const arrowSize = 5; // Arrow height

      let top = 0;
      let left = 0;

      // Calculate position based on the tooltip position prop
      if (position === 'top') {
        // Position tooltip above the button with additional space for arrow
        top = triggerRect.top + window.scrollY - tooltipRect.height - gap - arrowSize;
        left = triggerRect.left + window.scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
      } else if (position === 'bottom') {
        // Position tooltip below the button with additional space for arrow
        top = triggerRect.bottom + window.scrollY + gap + arrowSize;
        left = triggerRect.left + window.scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
      } else if (position === 'left') {
        // Position tooltip to the left of the button with additional space for arrow
        top = triggerRect.top + window.scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left + window.scrollX - tooltipRect.width - gap - arrowSize;
      } else if (position === 'right') {
        // Position tooltip to the right of the button with additional space for arrow
        top = triggerRect.top + window.scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + window.scrollX + gap + arrowSize;
      }

      setCoords({ top, left });
    }
  }, [isVisible, position]);


  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isVisible && (
              <motion.div
                ref={tooltipRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                className="absolute pointer-events-none"
                style={{
                  top: coords.top,
                  left: coords.left,
                  zIndex: 9999,
                }}
              >
                <div className="bg-gray-900 text-white text-xs font-medium rounded-md py-1.5 px-2.5 shadow-lg whitespace-nowrap relative">
                  {content}
                  {/* Arrow/caret pointing to the trigger element */}
                  {position === 'top' && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full">
                      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-900" />
                    </div>
                  )}
                  {position === 'bottom' && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-full">
                      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[5px] border-b-gray-900" />
                    </div>
                  )}
                  {position === 'left' && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full">
                      <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-gray-900" />
                    </div>
                  )}
                  {position === 'right' && (
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-full">
                      <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] border-r-gray-900" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
