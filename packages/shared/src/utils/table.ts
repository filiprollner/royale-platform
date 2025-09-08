import { SeatPosition } from '../types/game';

// Seat positions around an oval table (9 seats)
export const SEAT_POSITIONS: SeatPosition[] = [
  { index: 0, angle: 270, x: 0, y: -120 },      // Bottom center
  { index: 1, angle: 310, x: 80, y: -80 },      // Bottom right
  { index: 2, angle: 340, x: 100, y: -30 },     // Right
  { index: 3, angle: 20, x: 80, y: 30 },        // Top right
  { index: 4, angle: 50, x: 0, y: 80 },         // Top center
  { index: 5, angle: 130, x: -80, y: 30 },      // Top left
  { index: 6, angle: 160, x: -100, y: -30 },    // Left
  { index: 7, angle: 200, x: -80, y: -80 },     // Bottom left
  { index: 8, angle: 230, x: 0, y: -100 }       // Bottom center-left
];

export function getSeatPosition(seatIndex: number): SeatPosition {
  return SEAT_POSITIONS[seatIndex] || { index: seatIndex, angle: 0, x: 0, y: 0 };
}

export function getSeatAngle(seatIndex: number): number {
  return getSeatPosition(seatIndex).angle;
}

export function getSeatCoordinates(seatIndex: number): { x: number; y: number } {
  const position = getSeatPosition(seatIndex);
  return { x: position.x, y: position.y };
}

export function getNextDealerIndex(currentDealerIndex: number, maxSeats: number = 9): number {
  return (currentDealerIndex + 1) % maxSeats;
}

export function getBettingPlayers(gameState: any): any[] {
  return gameState.players.filter((player: any) => 
    !player.isDealer && player.isOnline && player.currentBet >= gameState.minBet
  );
}

export function getActivePlayer(gameState: any): any | null {
  if (gameState.phase !== 'acting') return null;
  
  const bettingPlayers = getBettingPlayers(gameState);
  return bettingPlayers.find((player: any) => !player.hasActed) || null;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
