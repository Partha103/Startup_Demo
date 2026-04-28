'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      iconPosition = 'left',
      className = '',
      children,
      disabled,
      onClick,
      ...rest
    },
    ref
  ) => {
    const baseStyles =
      'font-body font-medium transition-all duration-300 inline-flex items-center justify-center gap-2 tracking-wide uppercase text-xs letter-spacing-wider';

    const variantStyles = {
      primary:
        'bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] active:scale-95',
      secondary:
        'bg-[#c9a96e] text-white hover:bg-red-700 active:scale-95',
      ghost:
        'bg-transparent text-[#0a0a0a] hover:bg-[#f7f4ef] border border-[#0a0a0a]',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
      outline:
        'border border-[#0a0a0a] text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white',
    };

    const sizeStyles = {
      xs: 'px-3 py-1.5 text-xs',
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
      xl: 'px-10 py-5 text-lg',
    };

    const disabledStyles = disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';

    // Filter out problematic event handlers to avoid conflicts with Framer Motion
    const safeProps = Object.entries(rest).reduce((acc, [key, value]) => {
      if (!key.startsWith('on')) {
        acc[key as keyof typeof rest] = value;
      }
      return acc;
    }, {} as any);

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !isLoading ? { scale: 0.98 } : undefined}
        whileTap={!disabled && !isLoading ? { scale: 0.95 } : undefined}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
        disabled={disabled || isLoading}
        onClick={onClick}
        {...safeProps}
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
            {children}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
