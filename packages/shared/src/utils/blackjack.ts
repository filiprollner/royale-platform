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
export const isBust = (cards: Card[]) => calculateHandValue(cards) > 21;

// Aliases expected by server:
export const evaluateHand = calculateHandValue;

// Basic house rule: hit on <= 16, stand otherwise
export function shouldDealerHit(cards: Card[]): boolean {
  return calculateHandValue(cards) <= 16;
}

// Return 1 if a > b, -1 if a < b, 0 if tie
export function compareHands(a: Card[], b: Card[]): 1 | -1 | 0 {
  const va = calculateHandValue(a);
  const vb = calculateHandValue(b);
  if (va > vb) return 1;
  if (va < vb) return -1;
  return 0;
}