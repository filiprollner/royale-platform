import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Table, Button } from '@royale-platform/ui';
import { useGameStore } from '../store/gameStore';
import { useSocket } from '../hooks/useSocket';
import { GameHUD } from '../components/GameHUD';
import { ActionButtons } from '../components/ActionButtons';
import { ChatPanel } from '../components/ChatPanel';

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
