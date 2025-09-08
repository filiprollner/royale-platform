import { Card, rankValue } from "./cards";

export interface HandResult {
  value: number;
  isBlackjack: boolean;
  isBust: boolean;
  isSoft: boolean;
}

export function handValue(cards: Card[]): number {
  let sum = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.r === "A") { aces += 1; sum += 1; }
    else { sum += rankValue(c.r); }
  }
  // upgrade aces to 11 where possible
  while (aces > 0 && sum + 10 <= 21) { sum += 10; aces--; }
  return sum;
}

export const isBust = (cards: Card[]) => handValue(cards) > 21;

export function evaluateHand(cards: Card[]): HandResult {
  const value = handValue(cards);
  const isBlackjack = cards.length === 2 && value === 21;
  const isBust = value > 21;
  const isSoft = hasSoftAce(cards);

  return {
    value,
    isBlackjack,
    isBust,
    isSoft
  };
}

function hasSoftAce(cards: Card[]): boolean {
  let aces = 0;
  let otherValue = 0;
  
  for (const card of cards) {
    if (card.r === 'A') {
      aces++;
    } else {
      otherValue += rankValue(card.r);
    }
  }
  
  // A hand is "soft" if it has an ace that can be counted as 11
  // without busting (i.e., total value with aces as 11 is <= 21)
  return aces > 0 && (otherValue + aces + 10) <= 21;
}

export function getHandDescription(hand: HandResult): string {
  if (hand.isBlackjack) return 'Blackjack!';
  if (hand.isBust) return 'Bust';
  if (hand.isSoft) return `Soft ${hand.value}`;
  return `Hard ${hand.value}`;
}

export function shouldDealerHit(hand: HandResult): boolean {
  // Dealer hits on soft 17 and below, stands on hard 17 and above
  if (hand.isBust) return false;
  if (hand.isSoft) return hand.value <= 17;
  return hand.value < 17;
}

export function compareHands(playerHand: HandResult, dealerHand: HandResult): 'win' | 'lose' | 'push' {
  // Both bust = push
  if (playerHand.isBust && dealerHand.isBust) return 'push';
  
  // Player busts = lose
  if (playerHand.isBust) return 'lose';
  
  // Dealer busts = win
  if (dealerHand.isBust) return 'win';
  
  // Both blackjack = push
  if (playerHand.isBlackjack && dealerHand.isBlackjack) return 'push';
  
  // Player blackjack beats dealer non-blackjack = win
  if (playerHand.isBlackjack && !dealerHand.isBlackjack) return 'win';
  
  // Dealer blackjack beats player non-blackjack = lose
  if (dealerHand.isBlackjack && !playerHand.isBlackjack) return 'lose';
  
  // Compare values
  if (playerHand.value > dealerHand.value) return 'win';
  if (playerHand.value < dealerHand.value) return 'lose';
  return 'push';
}
