import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@royale-platform/ui';
import { GameState, Player } from '@royale-platform/shared';

interface ActionButtonsProps {
  gameState: GameState;
  currentPlayer: Player;
  legalActions: string[];
  onAction: (actionType: string, amount?: number) => void;
  onStartHand: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  gameState,
  currentPlayer,
  legalActions,
  onAction,
  onStartHand
}) => {
  const [betAmount, setBetAmount] = useState(gameState.minBet);
  const { phase, minBet } = gameState;

  const canStartHand = phase === 'waiting' && currentPlayer.isDealer;
  const isActivePlayer = phase === 'acting' && !currentPlayer.hasActed;
  const canBet = phase === 'betting' && !currentPlayer.isDealer;

  const handleBet = () => {
    if (betAmount >= minBet) {
      onAction('bet', betAmount);
    }
  };

  const handleHit = () => {
    onAction('hit');
  };

  const handleStand = () => {
    onAction('stand');
  };

  const presetBets = [minBet, minBet * 2, minBet * 5, minBet * 10];

  if (canStartHand) {
    return (
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          onClick={onStartHand}
          size="lg"
          className="px-8"
        >
          Start Hand
        </Button>
      </motion.div>
    );
  }

  if (canBet) {
    return (
      <motion.div
        className="glass-card p-6 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-2">Place Your Bet</h3>
          <p className="text-sm text-glass">Minimum: {minBet}</p>
        </div>

        {/* Bet Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Bet Amount</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            min={minBet}
            max={currentPlayer.balance}
            className="w-full px-4 py-3 bg-ink-2/60 border border-glass/30 rounded-lg text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
          />
        </div>

        {/* Preset Bet Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {presetBets.map((amount) => (
            <Button
              key={amount}
              variant="secondary"
              size="sm"
              onClick={() => setBetAmount(amount)}
              disabled={amount > currentPlayer.balance}
            >
              ${amount}
            </Button>
          ))}
        </div>

        {/* Confirm Bet Button */}
        <Button
          onClick={handleBet}
          disabled={betAmount < minBet || betAmount > currentPlayer.balance}
          size="lg"
          className="w-full"
        >
          Bet ${betAmount}
        </Button>
      </motion.div>
    );
  }

  if (isActivePlayer && legalActions.length > 0) {
    return (
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {legalActions.includes('hit') && (
          <Button
            onClick={handleHit}
            variant="success"
            size="lg"
            className="px-8"
          >
            Hit
          </Button>
        )}
        {legalActions.includes('stand') && (
          <Button
            onClick={handleStand}
            variant="secondary"
            size="lg"
            className="px-8"
          >
            Stand
          </Button>
        )}
      </motion.div>
    );
  }

  // No actions available
  return (
    <motion.div
      className="glass-card px-6 py-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="text-center text-glass">
        {phase === 'waiting' && 'Waiting for dealer to start...'}
        {phase === 'betting' && 'Waiting for other players to bet...'}
        {phase === 'acting' && 'Waiting for your turn...'}
        {phase === 'dealer' && 'Dealer is playing...'}
        {phase === 'resolving' && 'Resolving hand...'}
        {phase === 'finished' && 'Hand finished'}
      </div>
    </motion.div>
  );
};
