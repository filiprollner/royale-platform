import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Table } from '@royale-platform/ui';
import { useGameStore } from '../store/gameStore';
import { useSocket } from '../hooks/useSocket';
import { GameHUD } from '../components/GameHUD';
import { ActionButtons } from '../components/ActionButtons';
import { ChatPanel } from '../components/ChatPanel';

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

export const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { gameState, currentPlayer, legalActions, isConnected } = useGameStore();
  const { startHand, performAction, sendChatMessage, leaveRoom } = useSocket();

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  if (!gameState || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-glass">Loading game...</p>
        </div>
      </div>
    );
  }

  const handleSeatClick = (seatIndex: number) => {
    // Handle seat selection if needed
    console.log('Seat clicked:', seatIndex);
  };

  const handleAction = (actionType: string, amount?: number) => {
    if (actionType === 'bet' && amount) {
      performAction({ type: 'bet', amount } as { type: 'bet'; amount: number });
    } else if (actionType === 'hit') {
      performAction({ type: 'hit' } as { type: 'hit' });
    } else if (actionType === 'stand') {
      performAction({ type: 'stand' } as { type: 'stand' });
    }
  };

  const handleStartHand = () => {
    startHand();
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ink relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-radial from-accent/5 to-transparent" />
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top HUD */}
        <GameHUD gameState={gameState} currentPlayer={currentPlayer} />

        {/* Game Table */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            className="w-full max-w-4xl h-full max-h-[600px]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Table
              gameState={gameState}
              onSeatClick={handleSeatClick}
              className="w-full h-full"
            />
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <ActionButtons
            gameState={gameState}
            currentPlayer={currentPlayer}
            legalActions={legalActions}
            onAction={handleAction}
            onStartHand={handleStartHand}
          />
        </div>

        {/* Leave Room Button */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="danger"
            size="sm"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </Button>
        </div>

        {/* Chat Panel */}
        <div className="absolute bottom-4 right-4 z-20">
          <ChatPanel
            onSendMessage={sendChatMessage}
          />
        </div>
      </div>
    </div>
  );
};
