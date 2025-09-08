export type PlayerId = string;

export type SeatPosition = {
  index: number;
  angle: number;
  x: number;
  y: number;
};

export type Player = {
  id: PlayerId;
  name: string;
  seat: number;
  balance: number;      // can be negative
  hand?: import('../utils/cards').Card[];
  isDealer?: boolean;
  connected?: boolean;
};

export type RoomConfig = {
  minBet: number;
  seats?: number;       // default 9
};

export type PlayerAction =
  | { type: "bet"; amount: number }
  | { type: "hit" }
  | { type: "stand" };

export type Phase = "lobby" | "betting" | "dealing" | "actions" | "showdown";

export type GameState = {
  phase: Phase;
  handNo: number;
  dealerSeat: number;
  minBet: number;
  players: Player[];
  deck?: import('../utils/cards').Card[];
  bets: Record<PlayerId, number>;
  expiresAt?: number; // ms epoch for 60s timers
};

export type GameResult = {
  handNo: number;
  deltas: Record<PlayerId, number>; // zero-sum
};

export type ChatMessage = {
  from: PlayerId;
  text: string;
  at: number; // ms epoch
};

export type SocketEvents = {
  "room:state": (s: GameState) => void;
  "timer:tock": (msLeft: number) => void;
  "chat:message": (m: ChatMessage) => void;
  "notice": (msg: string) => void;
};

export interface GameRules {
  name: string;
  startPlay(state: GameState): GameState;
  applyAction(state: GameState, playerId: PlayerId, action: PlayerAction): GameState;
  isPlayOver(state: GameState): boolean;
  settle(state: GameState): GameResult;
}