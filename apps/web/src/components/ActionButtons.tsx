import React, { useState } from 'react';
import { motion } from 'framer-motion';
// import { Button } from '@royale-platform/ui';
import { GameState, Player } from '@royale-platform/shared';

// Simple Button component to avoid import issues
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'success';
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
}> = ({ children, onClick, disabled, className = '', variant = 'primary', loading = false, size = 'md', type = 'button' }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };
  
  const variantClasses = {
    primary: "bg-accent text-white hover:bg-accent/90 focus:ring-accent",
    secondary: "bg-white/10 text-white hover:bg-white/20 focus:ring-white/50",
    ghost: "bg-transparent text-white hover:bg-white/10 focus:ring-white/50",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};

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
