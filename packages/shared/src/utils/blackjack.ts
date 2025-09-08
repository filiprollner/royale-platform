import type { Card, Rank } from "./cards";

export function rankValue(r: Rank): number {
  if (r === "A") return 11;
  if (r === "K" || r === "Q" || r === "J" || r === "T") return 10;
  return parseInt(r, 10);
}

export function calculateHandValue(cards: Card[]): number {
  let sum = 0, aces = 0;
  for (const c of cards) {
    if (c.r === "A") { aces++; sum += 1; }
    else { sum += rankValue(c.r); }
  }
  while (aces > 0 && sum + 10 <= 21) { sum += 10; aces--; }
  return sum;
}

export const isBlackjack = (cards: Card[]) => cards.length === 2 && calculateHandValue(cards) === 21;