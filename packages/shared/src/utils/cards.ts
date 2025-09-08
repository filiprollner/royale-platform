// /packages/shared/src/utils/cards.ts
export const suits = { hearts: "♥", diamonds: "♦", clubs: "♣", spades: "♠" } as const;
export type Suit = keyof typeof suits;

export type Rank =
  | "A" | "K" | "Q" | "J" | "T"
  | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";

export type Card = { r: Rank; s: Suit };

export function suitSymbol(s: Suit): string {
  return suits[s];
}

export function rankValue(r: Rank): number {
  if (r === "A") return 11; // blackjack-friendly default (adjust later)
  if (r === "K" || r === "Q" || r === "J" || r === "T") return 10;
  return parseInt(r, 10);
}