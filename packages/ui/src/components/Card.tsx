import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, getCardDisplayName, getCardColor, suitSymbol, Suit } from '@royale-platform/shared';

interface CardProps {
  card: CardType;
  size?: 'sm' | 'md' | 'lg';
  isFaceUp?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-11 text-xs',
  md: 'w-12 h-16 text-sm',
  lg: 'w-16 h-22 text-base'
};

export const Card: React.FC<CardProps> = ({
  card,
  size = 'md',
  isFaceUp = true,
  className = ''
}) => {
  const sizeClass = sizeClasses[size];
  const color = getCardColor(card.s);
  const displayName = getCardDisplayName(card);

  if (!isFaceUp) {
    return (
      <motion.div
        className={`
          ${sizeClass}
          ${className}
          rounded-[14px] border-2 border-white/20
          bg-gradient-to-br from-card-red to-card-blue
          flex items-center justify-center
          shadow-floating
        `}
        style={{
          background: `
            linear-gradient(135deg, #ff6b6b 0%, #6ba8ff 100%),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.1) 2px,
              rgba(255,255,255,0.1) 4px
            )
          `
        }}
        initial={{ rotateY: 0 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-4 h-4 bg-white/20 rounded-full" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`
        ${sizeClass}
        ${className}
        rounded-[14px] border-2 border-white/30
        bg-white flex flex-col items-center justify-center
        shadow-floating
        ${color === 'red' ? 'text-card-red' : 'text-card-blue'}
      `}
      initial={{ rotateY: 180 }}
      animate={{ rotateY: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Top Left */}
      <div className="absolute top-1 left-1 text-[0.7em] font-bold leading-none">
        {card.r}
      </div>
      
      {/* Suit Symbol */}
      <div className="text-[1.2em] leading-none">
        {suitSymbol(card.s as Suit)}
      </div>
      
      {/* Bottom Right */}
      <div className="absolute bottom-1 right-1 text-[0.7em] font-bold leading-none transform rotate-180">
        {card.r}
      </div>
    </motion.div>
  );
};
