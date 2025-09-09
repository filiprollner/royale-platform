import React from 'react';
import { motion } from 'framer-motion';

// Define formatCurrency locally to avoid import issues
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface ChipStackProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base'
};

const chipColors = [
  'bg-red-500',
  'bg-blue-500', 
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500'
];

export const ChipStack: React.FC<ChipStackProps> = ({
  amount,
  size = 'md',
  className = ''
}) => {
  const sizeClass = sizeClasses[size];
  const chipCount = Math.min(Math.ceil(amount / 100), 8); // Max 8 chips visible
  const chipValue = Math.floor(amount / chipCount);
  
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Chip Stack */}
      <div className="relative">
        {Array.from({ length: chipCount }, (_, index) => (
          <motion.div
            key={index}
            className={`
              ${sizeClass}
              ${chipColors[index % chipColors.length]}
              rounded-[14px] border-2 border-white/30
              absolute flex items-center justify-center
              text-white font-bold shadow-inner
            `}
            style={{
              zIndex: chipCount - index,
              transform: `translateY(-${index * 2}px)`,
            }}
            initial={{ 
              y: 20,
              opacity: 0,
              scale: 0.8
            }}
            animate={{ 
              y: -index * 2,
              opacity: 1,
              scale: 1
            }}
            transition={{ 
              delay: index * 0.05,
              duration: 0.2
            }}
            whileHover={{ 
              scale: 1.1,
              y: -index * 2 - 2
            }}
          >
            <span className="text-[0.7em] font-bold">
              {chipValue >= 1000 ? `${chipValue/1000}K` : chipValue}
            </span>
          </motion.div>
        ))}
      </div>
      
      {/* Amount Label */}
      <motion.div
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="px-2 py-1 bg-ink-2/80 backdrop-blur-sm rounded-full text-white text-xs font-mono">
          {formatCurrency(amount)}
        </div>
      </motion.div>
    </motion.div>
  );
};
