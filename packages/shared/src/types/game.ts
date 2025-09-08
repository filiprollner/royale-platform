export type PlayerId = string;

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank = "A"|"K"|"Q"|"J"|"T"|"9"|"8"|"7"|"6"|"5"|"4"|"3"|"2";
export type Card = { r: Rank; s: Suit };

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

export type RoomConfig = {
  name?: string;
  minBet: number;
  maxPlayers?: number;   // default handled in server if missing
  seats?: number;        // deprecated by maxPlayers, keep for compatibility
};

export type Player = {
  id: PlayerId;
  name: string;
  seat: number;          // existing
  seatIndex?: number;    // some code references this
  balance: number;       // can be negative
  // runtime UI/engine flags used by server code:
  isDealer?: boolean;
  isOnline?: boolean;
  hasActed?: boolean;
  isAllIn?: boolean;
  avatar?: string;

  // poker/blackjack state fields referenced by server:
  cards?: Card[];        // a.k.a. hand
  currentBet?: number;
};

export type TimerState = {
  endsAt: number;        // epoch ms
  seconds?: number;      // convenience
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

  // bookkeeping
  players: Player[];
  bets: Record<PlayerId, number>;

  // blackjack / table state the server touches
  deck?: Card[];
  communityCards?: Card[];
  dealerCards?: Card[];

  // round/play counters referenced by server
  playNumber?: number;
  roundNumber?: number;

  // extra runtime fields server references
  pot?: number;
  timer?: TimerState;
  seed?: string;

  // timers
  expiresAt?: number; // legacy, okay to keep
};

export type GameResult = {
  handNo: number;
  deltas: Record<PlayerId, number>; // zero-sum
};

// ACTIONS — include playerId because server reads it
export type PlayerActionBase = { playerId: PlayerId };
export type PlayerAction =
  | (PlayerActionBase & { type: "bet"; amount: number })
  | (PlayerActionBase & { type: "hit" })
  | (PlayerActionBase & { type: "stand" });

export type ChatMessage = {
  id?: string;        // server creates one in some places
  from: PlayerId;
  text: string;
  at: number;         // ms epoch
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

// Value object so code like `SocketEvents["room:state"]` works.
export const SocketEvents = {
  "room:state": "room:state",
  "timer:tock": "timer:tock",
  "chat:message": "chat:message",
  "notice": "notice",
} as const;

export type SocketEvents = typeof SocketEvents;