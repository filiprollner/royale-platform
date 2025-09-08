import type { SeatPosition } from "../types/game";

/**
 * Generate evenly spaced seat coordinates on a unit circle.
 * UI can scale/translate these to pixels.
 */
export function generateSeatLayout(count: number, radius = 1): SeatPosition[] {
  const seats: SeatPosition[] = [];
  const startAngle = -Math.PI / 2; // start at top
  for (let i = 0; i < count; i++) {
    const angle = startAngle + (i * 2 * Math.PI) / count;
    seats.push({
      index: i,
      angle,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }
  return seats;
}

/** Default 9-handed layout */
export const DEFAULT_SEATS: SeatPosition[] = generateSeatLayout(9);