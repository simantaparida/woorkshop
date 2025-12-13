'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

function getTooltipColor(remaining: number): { bg: string; arrow: string } {
  if (remaining > 30) return { bg: 'bg-blue-600', arrow: 'bg-blue-600' };
  if (remaining > 10) return { bg: 'bg-orange-600', arrow: 'bg-orange-600' };
  return { bg: 'bg-red-600', arrow: 'bg-red-600' };
}

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  showValue?: boolean;
  showTooltip?: boolean;
  tooltipContent?: React.ReactNode;
  remainingPoints?: number;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className = '',
  showValue = true,
  showTooltip = false,
  tooltipContent,
  remainingPoints,
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartValue, setDragStartValue] = useState(value);
  const [dragStartRemaining, setDragStartRemaining] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const onChangeRef = useRef(onChange);

  // Keep onChange ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const percentage = ((value - min) / (max - min)) * 100;

  // Calculate how many points would remain after this allocation
  // When dragging starts, we capture the initial remainingPoints
  // As we drag, we calculate: startRemaining - (currentValue - startValue)
  // This gives us the remaining points if we commit to this position
  const calculatedRemaining = isDragging && dragStartRemaining !== undefined
    ? Math.max(0, dragStartRemaining - (value - dragStartValue))
    : (remainingPoints !== undefined ? remainingPoints : 0);

  const updateValue = useCallback((clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const newPercentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    const rawValue = (newPercentage / 100) * (max - min) + min;
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    onChangeRef.current(clampedValue);
  }, [min, max, step]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    updateValue(e.clientX);
  }, [updateValue]);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    if (e.touches[0]) {
      e.preventDefault();
      e.stopPropagation();
      updateValue(e.touches[0].clientX);
    }
  }, [updateValue]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setDragStartValue(value);
    setDragStartRemaining(remainingPoints || 0);
    isDraggingRef.current = true;
    setIsDragging(true);
    updateValue(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setDragStartValue(value);
    setDragStartRemaining(remainingPoints || 0);
    isDraggingRef.current = true;
    setIsDragging(true);
    if (e.touches[0]) {
      updateValue(e.touches[0].clientX);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    let newValue = value;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      newValue = Math.min(max, value + step);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      newValue = Math.max(min, value - step);
    } else if (e.key === 'Home') {
      newValue = min;
    } else if (e.key === 'End') {
      newValue = max;
    } else {
      return;
    }

    e.preventDefault();
    onChange(newValue);
  };

  useEffect(() => {
    if (!isDragging) return;

    const mouseMoveHandler = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      handleMouseMove(e);
    };

    const mouseUpHandler = () => {
      handleMouseUp();
    };

    const touchMoveHandler = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      handleTouchMove(e);
    };

    const touchEndHandler = () => {
      handleMouseUp();
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
    window.addEventListener('touchmove', touchMoveHandler, { passive: false });
    window.addEventListener('touchend', touchEndHandler);

    return () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      window.removeEventListener('touchmove', touchMoveHandler);
      window.removeEventListener('touchend', touchEndHandler);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={sliderRef}
        className={`relative h-2 bg-gray-200 rounded-full cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        {/* Filled portion */}
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full pointer-events-none"
          initial={{ width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {/* Thumb */}
        <div
          className={`absolute w-6 h-6 bg-white border-2 border-blue-600 rounded-full shadow-md -translate-x-1/2 -translate-y-1/2 ${
            disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
          } ${
            isDragging ? 'scale-110' : 'hover:scale-110'
          } transition-transform duration-150`}
          style={{
            left: `${percentage}%`,
            top: '50%',
          }}
        />

        {/* Drag Tooltip - Shows remaining points during active drag */}
        {isDragging && remainingPoints !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-20 pointer-events-none ${getTooltipColor(calculatedRemaining).bg}`}
            style={{
              left: `${percentage}%`,
              top: '-3rem',
              transform: 'translateX(-50%)'
            }}
          >
            {calculatedRemaining} points remaining
            {/* Arrow */}
            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${getTooltipColor(calculatedRemaining).arrow} rotate-45`}></div>
          </motion.div>
        )}

        {/* Limit Tooltip - Shows error when trying to exceed limit */}
        {showTooltip && tooltipContent && !isDragging && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-20 pointer-events-none"
            style={{
              left: `${percentage}%`,
              top: '-3rem',
              transform: 'translateX(-50%)'
            }}
          >
            {tooltipContent}
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
          </motion.div>
        )}
      </div>

      {/* Value display */}
      {showValue && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {value} pts
        </div>
      )}
    </div>
  );
}
