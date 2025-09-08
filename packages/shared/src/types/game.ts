import type { Card, Rank, Suit } from "../utils/cards";

export type PlayerId = string;
// Re-export these so other packages can import from "@royale-platform/shared" only:
export type { Card, Rank, Suit };

export type Phase =
  | "lobby"
  | "betting"
  | "dealing"
  | "actions"
  | "showdown"
  | "waiting"
  | "resolving"
  | "dealer"
  | "acting"
  | "finished";

export type SeatPosition = {
  index: number;   // 0-based seat index around the table
  angle: number;   // radians, 0 = +X, -PI/2 = top center
  x: number;       // unit circle X (multiply by table radius in UI)
  y: number;       // unit circle Y
};

export type RoomConfig = {
  name?: string;
  minBet: number;
  maxPlayers?: number;   // default handled in server if missing
  seats?: number;        // deprecated by maxPlayers, kept for compatibility
};

export type Player = {
  id: PlayerId;
  name: string;
  seat: number;
  seatIndex?: number;
  balance: number;       // can be negative

  // runtime flags referenced by server/UI
  isDealer?: boolean;
  isOnline?: boolean;
  hasActed?: boolean;
  isAllIn?: boolean;
  avatar?: string;

  // per-hand state
  cards?: Card[];
  currentBet?: number;
};

export type TimerState = {
  endsAt: number;        // epoch ms
  seconds?: number;
  type?: 'betting' | 'acting' | 'dealer';
  remaining?: number;    // ms remaining
};

export type GameState = {
  phase: Phase;
  handNo: number;

  // seating / rotation
  dealerSeat: number;
  currentDealerIndex?: number;

  // config mirrors
  minBet: number;
  maxPlayers?: number;

  // players & bets
  players: Player[];
  bets: Record<PlayerId, number>;

  // decks & cards
  deck?: Card[];
  communityCards?: Card[];
  dealerCards?: Card[];

  // counters
  playNumber?: number;
  roundNumber?: number;

  // runtime extras
  pot?: number;
  timer?: TimerState;
  seed?: string;

  // legacy timer
  expiresAt?: number;
};

export type GameResult = {
  handNo: number;
  deltas: Record<PlayerId, number>; // zero-sum
};

// ACTIONS — include playerId; server reads it
export type PlayerActionBase = { playerId: PlayerId };
export type PlayerAction =
  | (PlayerActionBase & { type: "bet"; amount: number })
  | (PlayerActionBase & { type: "hit" })
  | (PlayerActionBase & { type: "stand" });

// For frontend use - actions without playerId
export type PlayerActionWithoutId = 
  | { type: "bet"; amount: number }
  | { type: "hit" }
  | { type: "stand" };

export type ChatMessage = {
  id?: string;        // server may assign one
  from: PlayerId;
  playerName?: string; // for display
  text: string;
  message?: string;    // alias for text
  at: number;         // ms epoch
  timestamp?: number;  // alias for at
};

export interface GameRules {
  name: string;
  startPlay(state: GameState, config: RoomConfig): GameState;
  applyAction(state: GameState, action: PlayerAction): GameState;
  isPlayOver(state: GameState): boolean;
  settle(state: GameState): GameResult;
}

// Socket events: export both a TYPE and a VALUE (server uses as a value)
export type SocketEventMap = {
  "room:state": (s: GameState) => void;
  "timer:tock": (msLeft: number) => void;
  "chat:message": (m: ChatMessage) => void;
  "notice": (msg: string) => void;
};

export const SocketEvents = {
  "room:state": "room:state",
  "timer:tock": "timer:tock",
  "chat:message": "chat:message",
  "notice": "notice",
  "error": "error",
  "room:create": "room:create",
  "room:join": "room:join",
  "room:leave": "room:leave",
  "hand:start": "hand:start",
  "action": "action",
  "chat:post": "chat:post",
} as const;

export type SocketEvents = typeof SocketEvents;