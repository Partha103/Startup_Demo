'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark' | 'cream';
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'bg-white',
    dark: 'bg-[#0a0a0a]',
    cream: 'bg-[#f7f4ef]',
  };

  return (
    <section className={`${variantStyles[variant]} w-full ${className}`}>
      {children}
    </section>
  );
};

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

export const Grid: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ children, cols = 3, gap = 'md', className = '' }) => {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-2 md:grid-cols-2 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  const gapMap = {
    sm: 'gap-3 md:gap-4',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
    xl: 'gap-8 md:gap-10',
  };

  return (
    <div className={`grid ${colsMap[cols]} ${gapMap[gap]} ${className}`}>{children}</div>
  );
};

interface DividerProps {
  variant?: 'thin' | 'thick';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ variant = 'thin', className = '' }) => {
  const variantStyles = {
    thin: 'border-t border-[#0a0a0a] h-0',
    thick: 'border-t-2 border-[#0a0a0a] h-0',
  };

  return <div className={`${variantStyles[variant]} ${className}`} />;
};

interface HeadingProps {
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

export const Heading: React.FC<HeadingProps> = ({
  level = 'h2',
  children,
  className = '',
  variant = 'primary',
}) => {
  const levelMap = {
    h1: 'text-7xl md:text-8xl',
    h2: 'text-5xl md:text-6xl',
    h3: 'text-3xl md:text-4xl',
    h4: 'text-2xl md:text-3xl',
    h5: 'text-xl md:text-2xl',
    h6: 'text-lg md:text-xl',
  };

  const variantStyles = {
    primary:
      'font-display font-bold text-[#0a0a0a] uppercase tracking-tighter leading-none',
    secondary: 'font-body font-semibold text-[#0a0a0a] tracking-wide',
    tertiary: 'font-display font-light text-[#1a1a1a] tracking-wider',
  };

  const Element = level as any;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
    >
      <Element className={`${levelMap[level]} ${variantStyles[variant]} ${className}`}>
        {children}
      </Element>
    </motion.div>
  );
};

export const Paragraph: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <motion.p
    className={`font-body text-base md:text-lg text-[#0a0a0a] leading-relaxed ${className}`}
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.6 }}
  >
    {children}
  </motion.p>
);
