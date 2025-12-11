import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover = false, children, ...props }, ref) => {
    const baseClassName = `bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${
      hover ? 'hover:border-primary-300 hover:shadow-lg cursor-pointer transition-all duration-300' : ''
    } ${className}`;

    if (hover) {
      return (
        <motion.div
          ref={ref}
          className={baseClassName}
          whileHover={{
            y: -4,
            scale: 1.01,
            transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
          }}
          whileTap={{
            scale: 0.99,
            transition: { duration: 0.1 }
          }}
          {...(props as any)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
