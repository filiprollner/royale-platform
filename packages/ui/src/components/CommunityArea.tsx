import React from 'react';
import { motion } from 'framer-motion';
import { GameState } from '@royale-platform/shared';
import { Card } from './Card';
import { ChipStack } from './ChipStack';

interface CommunityAreaProps {
  gameState: GameState;
  className?: string;
}

export const CommunityArea: React.FC<CommunityAreaProps> = ({
  gameState,
  className = ''
}) => {
  const { dealerCards, communityCards, pot, phase } = gameState;
  const hasDealerCards = dealerCards && dealerCards.length > 0;
  const hasCommunityCards = communityCards && communityCards.length > 0;
  const hasPot = (pot || 0) > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Pot Display */}
      {hasPot && (
        <motion.div
          className="absolute -top-16 left-1/2 transform -translate-x-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="px-4 py-2 bg-ink-2/90 backdrop-blur-sm rounded-full border border-accent/30">
            <div className="text-accent text-sm font-bold">
              Pot: ${(pot || 0).toLocaleString()}
            </div>
          </div>
        </motion.div>
      )}

      {/* Dealer Cards */}
      {hasDealerCards && (
        <motion.div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {dealerCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ 
                rotateY: 180,
                scale: 0.8,
                opacity: 0
              }}
              animate={{ 
                rotateY: 0,
                scale: 1,
                opacity: 1
              }}
              transition={{ 
                delay: 0.4 + index * 0.1,
                duration: 0.3
              }}
            >
              <Card
                card={card}
                size="md"
                isFaceUp={phase === 'dealer' || phase === 'resolving'}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Community Cards */}
      {hasCommunityCards && (
        <motion.div
          className="absolute top-8 left-1/2 transform -translate-x-1/2 flex gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {communityCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ 
                rotateY: 180,
                scale: 0.8,
                opacity: 0
              }}
              animate={{ 
                rotateY: 0,
                scale: 1,
                opacity: 1
              }}
              transition={{ 
                delay: 0.6 + index * 0.1,
                duration: 0.3
              }}
            >
              <Card
                card={card}
                size="md"
                isFaceUp={true}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Phase Indicator */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="px-3 py-1 bg-ink-3/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
          {phase.charAt(0).toUpperCase() + phase.slice(1)}
        </div>
      </motion.div>
    </div>
  );
};
