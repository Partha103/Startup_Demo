'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PremiumImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
}

const PremiumImage: React.FC<PremiumImageProps> = ({
  src,
  alt,
  width,
  height,
  objectFit = 'cover',
  priority = false,
  className = '',
  onLoad,
}) => {
  const [isLoaded, setIsLoaded] = useState(priority);
  const [inView, setInView] = useState(priority);

  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#f7f4ef] ${className}`}
      style={{ width, height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {inView && (
        <>
          {/* Placeholder skeleton */}
          {!isLoaded && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#f7f4ef] via-white to-[#f7f4ef]"
              animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                backgroundSize: '200% 100%',
              }}
            />
          )}

          {/* Actual image */}
          <img
            src={src}
            alt={alt}
            className="w-full h-full"
            style={{
              objectFit,
            }}
            onLoad={handleLoad}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          />
        </>
      )}
    </motion.div>
  );
};

export default PremiumImage;
