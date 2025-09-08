import React from 'react';
import { motion } from 'framer-motion';
import { getSeatPosition } from '@royale-platform/shared';

interface DealerButtonProps {
  dealerIndex: number;
  className?: string;
}

export const DealerButton: React.FC<DealerButtonProps> = ({
  dealerIndex,
  className = ''
}) => {
  const dealerPosition = getSeatPosition(dealerIndex);
  
  return (
    <motion.div
      className={`absolute ${className}`}
      style={{
        left: `calc(50% + ${dealerPosition.x * 0.7}px)`,
        top: `calc(50% + ${dealerPosition.y * 0.7}px)`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="w-8 h-8 bg-accent rounded-full border-2 border-white/30 flex items-center justify-center shadow-floating"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <span className="text-ink text-xs font-bold">D</span>
      </motion.div>
    </motion.div>
  );
};
