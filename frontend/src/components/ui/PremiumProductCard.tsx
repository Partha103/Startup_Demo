'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PremiumImage from '@/components/ui/PremiumImage';
import Badge from '@/components/ui/Badge';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  secondaryImage?: string;
  category: string;
  badge?: string;
  inStock?: boolean;
  index?: number;
}

const PremiumProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  originalPrice,
  image,
  secondaryImage,
  category,
  badge,
  inStock = true,
  index = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.15) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group h-full"
    >
      <Link href={`/product/${id}`} className="block h-full">
        <div className="relative h-full bg-white overflow-hidden flex flex-col">
          {/* Image Container */}
          <div className="relative flex-1 overflow-hidden bg-[#f7f4ef]">
            {/* Main Image */}
            <motion.div
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full h-full"
            >
              <PremiumImage
                src={image}
                alt={name}
                className="w-full h-full"
                objectFit="cover"
              />
            </motion.div>

            {/* Secondary Image on Hover */}
            {secondaryImage && isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <PremiumImage
                  src={secondaryImage}
                  alt={`${name} alternate`}
                  className="w-full h-full"
                  objectFit="cover"
                />
              </motion.div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {badge && <Badge label={badge} variant="red" size="sm" />}
              {discount > 0 && (
                <Badge label={`-${discount}%`} variant="gold" size="sm" />
              )}
            </div>

            {/* Favorite Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => {
                e.preventDefault();
                setIsFavorited(!isFavorited);
              }}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#f7f4ef] transition-colors"
            >
              <Heart
                size={18}
                className={`transition-all ${isFavorited ? 'fill-[#c9a96e] text-[#c9a96e]' : 'text-[#0a0a0a]'}`}
              />
            </motion.button>

            {/* Out of Stock Overlay */}
            {!inStock && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-5">
                <span className="text-white font-body font-semibold uppercase tracking-wider">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            className="p-4 bg-white flex-1 flex flex-col justify-between"
            animate={{ y: isHovered ? -4 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Category */}
            <div className="mb-2">
              <p className="text-xs font-body uppercase tracking-wider text-[#2a2a2a]">
                {category}
              </p>
            </div>

            {/* Product Name */}
            <h3 className="font-display font-semibold text-lg md:text-xl uppercase tracking-tight text-[#0a0a0a] mb-3 leading-tight">
              {name}
            </h3>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-body font-semibold text-lg text-[#0a0a0a]">
                ${price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="font-body text-sm line-through text-[#2a2a2a]">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Quick View / Add to Cart */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-2"
            >
              <button className="flex-1 px-3 py-2 bg-[#0a0a0a] text-white font-body text-xs font-semibold uppercase tracking-wider hover:bg-[#1a1a1a] transition-colors">
                Quick View
              </button>
              <button className="flex-1 px-3 py-2 border border-[#0a0a0a] text-[#0a0a0a] font-body text-xs font-semibold uppercase tracking-wider hover:bg-[#0a0a0a] hover:text-white transition-all">
                Add Cart
              </button>
            </motion.div>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PremiumProductCard;
