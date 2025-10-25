import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover = false, children, ...props }, ref) => {
    const Component = hover ? motion.div : 'div';

    return (
      <Component
        ref={ref}
        className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${
          hover ? 'hover:border-primary-300 hover:shadow-lg cursor-pointer transition-all duration-300' : ''
        } ${className}`}
        {...(hover ? {
          whileHover: {
            y: -4,
            scale: 1.01,
            transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
          },
          whileTap: {
            scale: 0.99,
            transition: { duration: 0.1 }
          }
        } : {})}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';
