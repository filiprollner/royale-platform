import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '@royale-platform/shared';

interface AvatarProps {
  player?: Player;
  size?: number;
  isOnline?: boolean;
  isDealer?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  player,
  size = 56,
  isOnline = false,
  isDealer = false,
  className = ''
}) => {
  const initials = player?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const avatarColors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500'
  ];

  const colorIndex = player?.id ? 
    player.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length :
    0;

  return (
    <div className={`relative ${className}`}>
      {/* Avatar Circle */}
      <motion.div
        className={`
          ${avatarColors[colorIndex]}
          rounded-full border-2 border-white/30
          flex items-center justify-center
          text-white font-bold
          shadow-floating
        `}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.4
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
      >
        {player?.avatar ? (
          <img
            src={player.avatar}
            alt={player.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </motion.div>

      {/* Dealer Badge */}
      {isDealer && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full border-2 border-ink flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-ink text-xs font-bold">D</span>
        </motion.div>
      )}

      {/* Online Indicator */}
      {isOnline && !isDealer && (
        <motion.div
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-ink"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
      )}
    </div>
  );
};
