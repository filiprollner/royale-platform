import type { GameState as SharedGameState, Player as SharedPlayer, Card, TimerState } from "@royale-platform/shared";

// Server-only timer model for internal state management
export type RuntimeTimer = {
  startedAt: number;
  durationMs: number;
  endsAt: number;
  targetPlayerId?: string;
  type?: 'betting' | 'acting' | 'dealer';
};

// Server-only player state extensions
export type RuntimePlayerState = {
  hasActed?: boolean;
  currentBet?: number;
  isOnline?: boolean;
  cards?: Card[];
  seatIndex?: number;
  avatar?: string;
  isAllIn?: boolean;
};

// Server-only game state extensions
export type RuntimeGameState = {
  timer?: RuntimeTimer;
  pot?: number;
  seed?: string;
  currentDealerIndex?: number;
  playNumber?: number;
  roundNumber?: number;
  dealerCards?: Card[];
  communityCards?: Card[];
  maxPlayers?: number;
  id?: string;
  name?: string;
  seedHash?: string;
  currentPlayIndex?: number;
};

// Augmented types for server use
export type GameState = SharedGameState & RuntimeGameState;
export type Player = SharedPlayer & RuntimePlayerState & {
  cards?: Card[];
};

// Server event constants (matching shared SocketEvents)
export const ServerEvents = {
  "room:state": "room:state",
  "timer:tock": "timer:tock", 
  "chat:message": "chat:message",
  "notice": "notice",
  // Server-specific events
  "room:create": "room:create",
  "room:join": "room:join", 
  "room:leave": "room:leave",
  "hand:start": "hand:start",
  "action": "action",
  "chat:post": "chat:post",
  "error": "error"
} as const;

export type ServerEvents = typeof ServerEvents;
