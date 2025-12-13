'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  showValue?: boolean;
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
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = useCallback((clientX: number) => {
    if (!sliderRef.current || disabled) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const newPercentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    const rawValue = (newPercentage / 100) * (max - min) + min;
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    onChange(clampedValue);
  }, [min, max, step, disabled, onChange]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    updateValue(e.clientX);
  }, [updateValue]);

  const handleMouseUp = useCallback((e?: MouseEvent) => {
    if (!isDraggingRef.current) return;
    e?.preventDefault();
    e?.stopPropagation();
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
    isDraggingRef.current = true;
    setIsDragging(true);
    updateValue(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    e.stopPropagation();
    isDraggingRef.current = true;
    setIsDragging(true);
    updateValue(e.touches[0].clientX);
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
    if (isDragging) {
      const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e);
      const mouseUpHandler = (e: MouseEvent) => handleMouseUp(e);
      const touchMoveHandler = (e: TouchEvent) => handleTouchMove(e);
      const touchEndHandler = () => handleMouseUp();

      window.addEventListener('mousemove', mouseMoveHandler, { capture: true });
      window.addEventListener('mouseup', mouseUpHandler, { capture: true });
      window.addEventListener('touchmove', touchMoveHandler, { capture: true });
      window.addEventListener('touchend', touchEndHandler, { capture: true });

      return () => {
        window.removeEventListener('mousemove', mouseMoveHandler, { capture: true });
        window.removeEventListener('mouseup', mouseUpHandler, { capture: true });
        window.removeEventListener('touchmove', touchMoveHandler, { capture: true });
        window.removeEventListener('touchend', touchEndHandler, { capture: true });
        isDraggingRef.current = false;
      };
    }
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
          className={`absolute w-6 h-6 bg-white border-2 border-blue-600 rounded-full shadow-md ${
            disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
          } ${isDragging ? 'scale-110' : 'hover:scale-110'} transition-transform`}
          style={{
            left: `${percentage}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            marginLeft: 0
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />
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
