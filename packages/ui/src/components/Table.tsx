import React from 'react';
import { motion } from 'framer-motion';
import { GameState, SeatPosition } from '@royale-platform/shared';

// Define getSeatPosition locally to avoid import issues
const getSeatPosition = (index: number, totalSeats = 9): SeatPosition => {
  const startAngle = -Math.PI / 2; // start at top
  const angle = startAngle + (index * 2 * Math.PI) / totalSeats;
  return {
    index,
    angle,
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
};
import { Seat } from './Seat';
import { DealerButton } from './DealerButton';
import { CommunityArea } from './CommunityArea';

interface TableProps {
  gameState: GameState;
  onSeatClick?: (seatIndex: number) => void;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ 
  gameState, 
  onSeatClick,
  className = '' 
}) => {
  const maxPlayers = gameState.maxPlayers || 9;
  const seats = Array.from({ length: maxPlayers }, (_, index) => {
    const player = gameState.players.find(p => p.seat === index);
    const position = getSeatPosition(index, maxPlayers);
    
    return (
      <Seat
        key={index}
        seatIndex={index}
        player={player}
        position={position}
        isDealer={player?.isDealer || false}
        isActive={gameState.phase === 'acting' && player?.id === (gameState.timer as any)?.targetPlayerId}
        onClick={() => onSeatClick?.(index)}
      />
    );
  });

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Table Background */}
      <motion.div
        className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-felt to-felt/80"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(31, 59, 88, 0.9) 0%, rgba(20, 33, 53, 0.95) 100%),
            url('/noise.png') repeat
          `,
          boxShadow: `
            inset 0 8px 24px rgba(0,0,0,0.45),
            inset 0 -8px 24px rgba(0,0,0,0.25),
            0 12px 30px rgba(0,0,0,0.35)
          `
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Inner glow */}
        <div className="absolute inset-2 rounded-[24px] bg-gradient-to-br from-white/5 to-transparent" />
        
        {/* Double border */}
        <div className="absolute inset-1 rounded-[26px] border border-rail/50" />
        <div className="absolute inset-0 rounded-[28px] border border-glass/30" />
      </motion.div>

      {/* Community Area */}
      <CommunityArea 
        gameState={gameState}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />

      {/* Dealer Button */}
      {gameState.players.some(p => p.isDealer) && (
        <DealerButton 
          dealerIndex={gameState.currentDealerIndex || 0}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      )}

      {/* Seats */}
      <div className="absolute inset-0">
        {seats}
      </div>
    </div>
  );
};
