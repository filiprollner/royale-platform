import { z } from 'zod';

// Base types
export const CardSchema = z.object({
  suit: z.enum(['hearts', 'diamonds', 'clubs', 'spades']),
  rank: z.enum(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']),
  value: z.number().min(1).max(11)
});

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  balance: z.number(),
  isOnline: z.boolean(),
  isDealer: z.boolean(),
  seatIndex: z.number().min(0).max(8),
  currentBet: z.number().min(0),
  cards: z.array(CardSchema),
  hasActed: z.boolean(),
  isAllIn: z.boolean()
});

export const GameStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  minBet: z.number().min(1),
  maxPlayers: z.number().min(2).max(9),
  players: z.array(PlayerSchema),
  currentDealerIndex: z.number().min(0).max(8),
  currentPlayIndex: z.number().min(0),
  phase: z.enum(['waiting', 'betting', 'dealing', 'acting', 'dealer', 'resolving', 'finished']),
  dealerCards: z.array(CardSchema),
  communityCards: z.array(CardSchema),
  pot: z.number().min(0),
  timer: z.object({
    type: z.enum(['betting', 'acting', 'dealer']),
    remaining: z.number().min(0),
    targetPlayerId: z.string().optional()
  }).optional(),
  roundNumber: z.number().min(1),
  playNumber: z.number().min(1),
  seed: z.string().optional(),
  seedHash: z.string().optional()
});

export const RoomConfigSchema = z.object({
  name: z.string().min(1).max(50),
  minBet: z.number().min(1).max(10000),
  maxPlayers: z.number().min(2).max(9).default(9)
});

// Action types
export const PlayerActionSchema = z.object({
  type: z.enum(['bet', 'hit', 'stand', 'fold']),
  amount: z.number().min(0).optional(),
  playerId: z.string()
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  playerName: z.string(),
  message: z.string().min(1).max(200),
  timestamp: z.number()
});

// Socket events
export const SocketEvents = {
  // Client to Server
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  HAND_START: 'hand:start',
  ACTION: 'action',
  CHAT_POST: 'chat:post',
  
  // Server to Client
  ROOM_STATE: 'room:state',
  TIMER_TOCK: 'timer:tock',
  CHAT_MESSAGE: 'chat:message',
  NOTICE: 'notice',
  ERROR: 'error'
} as const;

// Game rules interface
export interface GameRules {
  name: string;
  version: string;
  minPlayers: number;
  maxPlayers: number;
  
  initializeGame(config: RoomConfig): GameState;
  startPlay(gameState: GameState): GameState;
  processAction(gameState: GameState, action: PlayerAction): GameState;
  checkGameEnd(gameState: GameState): boolean;
  calculateWinnings(gameState: GameState): Record<string, number>;
  getLegalActions(gameState: GameState, playerId: string): string[];
}

// Type exports
export type Card = z.infer<typeof CardSchema>;
export type Player = z.infer<typeof PlayerSchema>;
export type GameState = z.infer<typeof GameStateSchema>;
export type RoomConfig = z.infer<typeof RoomConfigSchema>;
export type PlayerAction = z.infer<typeof PlayerActionSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Utility types
export interface SeatPosition {
  index: number;
  angle: number;
  x: number;
  y: number;
}

export interface GameResult {
  playerId: string;
  winnings: number;
  newBalance: number;
  outcome: 'win' | 'lose' | 'push';
}

export interface TimerState {
  type: 'betting' | 'acting' | 'dealer';
  remaining: number;
  targetPlayerId?: string;
}
