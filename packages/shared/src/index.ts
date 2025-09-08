export type PlayerId = string;
export type Suit = "hearts"|"diamonds"|"clubs"|"spades";
export type Rank = "A"|"K"|"Q"|"J"|"T"|"9"|"8"|"7"|"6"|"5"|"4"|"3"|"2";
export type Card = { r: Rank; s: Suit };
export type Player = { id: PlayerId; name: string; balance: number; hand?: Card[] };
export type TableState = {
  phase: string;
  players: Player[];
  dealerSeat: number;
  minBet: number;
  handNo: number;
  meta?: Record<string, unknown>;
};
export const utils = {};
// re-export real things from other files if they exist:
// export * from "./types/game";
// export * from "./utils/cards";
