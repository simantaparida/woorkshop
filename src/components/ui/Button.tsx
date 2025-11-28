import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';

    const variantStyles = {
      primary: 'bg-primary text-white hover:bg-primary-700 hover:shadow-md active:bg-primary-800 active:shadow-sm',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow active:bg-gray-300',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 shadow-none',
      outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        initial={{ opacity: 1 }}
        whileHover={{
          scale: disabled || isLoading ? 1 : 1.02,
          transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
        }}
        whileTap={{
          scale: disabled || isLoading ? 1 : 0.98,
          transition: { duration: 0.1, ease: [0.25, 0.1, 0.25, 1] }
        }}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
