import React from 'react';
import { motion } from 'framer-motion';
import { GameState, Player, formatCurrency, formatTime } from '@royale-platform/shared';

interface GameHUDProps {
  gameState: GameState;
  currentPlayer: Player;
}

export const GameHUD: React.FC<GameHUDProps> = ({ gameState, currentPlayer }) => {
  const { pot, timer, phase, roundNumber, playNumber } = gameState;
  const playerBalance = currentPlayer.balance;
  const playerBet = currentPlayer.currentBet;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 p-4">
      <div className="flex justify-between items-start">
        {/* Left Side - Game Info */}
        <div className="space-y-2">
          <motion.div
            className="glass-card px-4 py-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-sm text-glass">Round {roundNumber} • Play {playNumber}</div>
            <div className="text-lg font-bold text-white capitalize">{phase}</div>
          </motion.div>
        </div>

        {/* Center - Pot */}
        <motion.div
          className="glass-card px-6 py-3 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-sm text-glass mb-1">Pot</div>
          <div className="text-2xl font-bold text-accent">
            {formatCurrency(pot)}
          </div>
        </motion.div>

        {/* Right Side - Player Info */}
        <div className="space-y-2">
          <motion.div
            className="glass-card px-4 py-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-sm text-glass">Balance</div>
            <div className="text-lg font-bold text-white">
              {formatCurrency(playerBalance)}
            </div>
          </motion.div>

          {playerBet > 0 && (
            <motion.div
              className="glass-card px-4 py-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-sm text-glass">Current Bet</div>
              <div className="text-lg font-bold text-accent">
                {formatCurrency(playerBet)}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Timer */}
      {timer && (
        <motion.div
          className="absolute top-20 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="glass-card px-4 py-2 text-center">
            <div className="text-sm text-glass mb-1">
              {timer.type === 'betting' && 'Betting Time'}
              {timer.type === 'acting' && 'Action Time'}
              {timer.type === 'dealer' && 'Dealer Playing'}
            </div>
            <div className="text-xl font-bold text-accent">
              {formatTime(timer.remaining)}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
