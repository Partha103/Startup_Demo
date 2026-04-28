'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onDrag' | 'onDragStart' | 'onDragEnd'> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'minimal';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, icon, variant = 'default', className = '', ...rest }, ref) => {
    const baseStyles =
      'w-full px-4 py-3 font-body text-[#0a0a0a] bg-white border border-[#0a0a0a] transition-all duration-300';

    const variantStyles = {
      default: 'focus:ring-2 focus:ring-[#c9a96e] focus:border-[#c9a96e] outline-none',
      minimal: 'border-0 border-b border-[#0a0a0a] focus:border-[#c9a96e] outline-none',
    };

    const errorStyles = error ? 'border-red-600 focus:ring-red-600' : '';

    // Extract event handlers and other props separately
    const { onChange, onBlur, onFocus, ...otherProps } = rest as any;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium uppercase tracking-wider mb-2 text-[#0a0a0a]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <div className="absolute left-4 top-3.5 text-[#0a0a0a]">{icon}</div>}
          <motion.input
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`${baseStyles} ${variantStyles[variant]} ${errorStyles} ${icon ? 'pl-10' : ''} ${className}`}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            {...otherProps}
          />
        </div>
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        {helpText && <p className="text-tanta-slate text-xs mt-1">{helpText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
