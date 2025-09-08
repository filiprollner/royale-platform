import React from 'react';
import { motion } from 'framer-motion';
import { Player, SeatPosition } from '@royale-platform/shared';
import { Avatar } from './Avatar';
import { ChipStack } from './ChipStack';
import { Card } from './Card';

interface SeatProps {
  seatIndex: number;
  player?: Player;
  position: SeatPosition;
  isDealer: boolean;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}

export const Seat: React.FC<SeatProps> = ({
  seatIndex,
  player,
  position,
  isDealer,
  isActive,
  onClick,
  className = ''
}) => {
  const isEmpty = !player;
  const isOnline = player?.isOnline || false;
  const hasCards = player?.cards && player.cards.length > 0;
  const hasBet = player?.currentBet && player.currentBet > 0;

  return (
    <motion.div
      className={`absolute ${className}`}
      style={{
        left: `calc(50% + ${position.x}px)`,
        top: `calc(50% + ${position.y}px)`,
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay: seatIndex * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Seat Container */}
      <div
        className={`
          relative flex flex-col items-center cursor-pointer
          ${isEmpty ? 'opacity-40' : ''}
          ${isActive ? 'z-10' : ''}
        `}
        onClick={onClick}
      >
        {/* Active Glow Ring */}
        {isActive && (
          <motion.div
            className="absolute -inset-4 rounded-full bg-accent/20 border-2 border-accent"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ 
              duration: 0.3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        )}

        {/* Avatar */}
        <div className="relative">
          <Avatar
            player={player}
            size={isEmpty ? 48 : 56}
            isOnline={isOnline}
            isDealer={isDealer}
          />
          
          {/* Online Indicator */}
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-ink" />
          )}
        </div>

        {/* Player Name */}
        {player && (
          <motion.div
            className="mt-2 px-3 py-1 bg-ink-2/80 backdrop-blur-sm rounded-full text-white text-sm font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {player.name}
          </motion.div>
        )}

        {/* Balance/Stack */}
        {player && (
          <motion.div
            className="mt-1 px-2 py-1 bg-ink-3/60 backdrop-blur-sm rounded-full text-accent text-xs font-mono"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            ${player.balance.toLocaleString()}
          </motion.div>
        )}

        {/* Current Bet */}
        {hasBet && (
          <motion.div
            className="mt-2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <ChipStack amount={player!.currentBet} size="sm" />
          </motion.div>
        )}

        {/* Player Cards */}
        {hasCards && (
          <div className="mt-3 flex gap-1">
            {player!.cards.map((card, index) => (
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
                  delay: 0.5 + index * 0.1,
                  duration: 0.3
                }}
              >
                <Card
                  card={card}
                  size="sm"
                  isFaceUp={true}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty Seat Indicator */}
        {isEmpty && (
          <motion.div
            className="mt-2 w-12 h-8 border-2 border-dashed border-glass/40 rounded-lg flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-glass/60 text-xs">+</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
