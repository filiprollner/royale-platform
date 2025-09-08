import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// import { Button } from '@royale-platform/ui';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { RoomConfig, Player } from '@royale-platform/shared';

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

export const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useSocket();
  const { currentRoomId, setCurrentPlayer, setCurrentRoom } = useGameStore();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [minBet, setMinBet] = useState(100);

  // Navigate to room when created/joined
  useEffect(() => {
    if (currentRoomId) {
      navigate(`/room/${currentRoomId}`);
    }
  }, [currentRoomId, navigate]);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return;
    
    setIsCreating(true);
    
    const config: RoomConfig = {
      name: roomName || `Room ${Date.now()}`,
      minBet,
      maxPlayers: 9
    };
    
    const player: Player = {
      id: `player_${Date.now()}`,
      name: playerName.trim(),
      avatar: '',
      balance: 1000,
      seat: 0,
      seatIndex: 0,
      isOnline: true,
      isDealer: false
    };
    
    // Set current player in store
    setCurrentPlayer(player);
    
    try {
      createRoom(config, player);
      // Navigation will happen via socket response
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !joinRoomId.trim()) return;
    
    setIsJoining(true);
    
    const player: Player = {
      id: `player_${Date.now()}`,
      name: playerName.trim(),
      avatar: '',
      balance: 1000,
      seat: 0,
      seatIndex: 0,
      isOnline: true,
      isDealer: false
    };
    
    // Set current player in store
    setCurrentPlayer(player);
    
    try {
      joinRoom(joinRoomId.trim(), player);
      // Navigation will happen via socket response
    } catch (error) {
      console.error('Failed to join room:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-accent mb-2 text-glow">
            Royale Platform
          </h1>
          <p className="text-glass text-sm">
            Multiplayer Blackjack Experience
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          className="glass-card p-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {/* Player Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Player Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-ink-2/60 border border-glass/30 rounded-lg text-white placeholder-glass/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
              maxLength={20}
            />
          </div>

          {/* Room Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Room Name (Optional)
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="w-full px-4 py-3 bg-ink-2/60 border border-glass/30 rounded-lg text-white placeholder-glass/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
              maxLength={50}
            />
          </div>

          {/* Min Bet */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Minimum Bet
            </label>
            <select
              value={minBet}
              onChange={(e) => setMinBet(Number(e.target.value))}
              className="w-full px-4 py-3 bg-ink-2/60 border border-glass/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
            >
              <option value={10}>$10</option>
              <option value={25}>$25</option>
              <option value={50}>$50</option>
              <option value={100}>$100</option>
              <option value={250}>$250</option>
              <option value={500}>$500</option>
              <option value={1000}>$1,000</option>
            </select>
          </div>

          {/* Create Room Button */}
          <Button
            onClick={handleCreateRoom}
            disabled={!playerName.trim() || isCreating}
            loading={isCreating}
            className="w-full"
            size="lg"
          >
            {isCreating ? 'Creating Room...' : 'Create Room'}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glass/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-ink text-glass">OR</span>
            </div>
          </div>

          {/* Join Room */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Room ID
              </label>
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="w-full px-4 py-3 bg-ink-2/60 border border-glass/30 rounded-lg text-white placeholder-glass/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
              />
            </div>

            <Button
              onClick={handleJoinRoom}
              disabled={!playerName.trim() || !joinRoomId.trim() || isJoining}
              loading={isJoining}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              {isJoining ? 'Joining Room...' : 'Join Room'}
            </Button>
          </div>
        </motion.div>

        {/* Design Link */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/design')}
            className="text-glass hover:text-accent"
          >
            View Design System
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
