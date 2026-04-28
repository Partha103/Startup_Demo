'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'red' | 'gold' | 'outline';
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', size = 'md' }) => {
  const variantStyles = {
    default: 'bg-[#0a0a0a] text-white',
    red: 'bg-[#c9a96e] text-white',
    gold: 'bg-[#c9a96e] text-[#0a0a0a]',
    outline: 'border border-[#0a0a0a] text-[#0a0a0a] bg-transparent',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
  };

  return (
    <motion.span
      className={`inline-block font-body font-semibold uppercase tracking-wider ${variantStyles[variant]} ${sizeStyles[size]}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {label}
    </motion.span>
  );
};

export default Badge;
