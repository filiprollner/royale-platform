// Card suit symbols and types
export const suits = { hearts:"♥", diamonds:"♦", clubs:"♣", spades:"♠" } as const;
export type Suit = keyof typeof suits;
export type Rank = "A"|"K"|"Q"|"J"|"T"|"9"|"8"|"7"|"6"|"5"|"4"|"3"|"2";
export type Card = { r: Rank; s: Suit };

export function suitSymbol(s: Suit){ return suits[s]; } // Get suit symbol

export function createDeck(): Card[] {
  const suitKeys = Object.keys(suits) as Suit[];
  const ranks: Rank[] = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
  const deck: Card[] = [];
  for (const s of suitKeys) for (const r of ranks) deck.push({ r, s });
  return deck;
}

export function shuffleDeck(deck: Card[], rng: () => number = Math.random): Card[] {
  const a = deck.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function rngFromSeed(seed: string): () => number {
  // Simple seeded RNG implementation
  let state = 0;
  for (let i = 0; i < seed.length; i++) {
    state = ((state << 5) - state + seed.charCodeAt(i)) & 0xffffffff;
  }

  return () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return state / 0x100000000;
  };
}

// Card display utilities
export function getCardDisplayName(card: Card): string {
  return `${card.r}${suitSymbol(card.s)}`;
}

export function getCardColor(suit: Suit): 'red' | 'black' {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

// Currency formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
