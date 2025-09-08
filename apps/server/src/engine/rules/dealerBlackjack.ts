import { 
  GameRules, 
  GameState as SharedGameState, 
  Player as SharedPlayer, 
  PlayerAction, 
  RoomConfig, 
  GameResult,
  Card,
  createDeck,
  shuffleDeck,
  calculateHandValue,
  isBlackjack,
  isBust,
  evaluateHand,
  shouldDealerHit,
  compareHands,
  rngFromSeed
} from '@royale-platform/shared';
import { GameState, Player } from '../types';
import seedrandom from 'seedrandom';

export class DealerBlackjack implements GameRules {
  name = 'DealerBlackjack';
  version = '1.0.0';
  minPlayers = 2;
  maxPlayers = 9;

  initializeGame(config: RoomConfig): GameState {
    const players: Player[] = [];
    
    return {
      phase: 'waiting',
      handNo: 1,
      dealerSeat: 0,
      minBet: config.minBet,
      players,
      bets: {},
      // Runtime extensions
      id: this.generateGameId(),
      name: config.name,
      maxPlayers: config.maxPlayers ?? 9,
      currentDealerIndex: 0,
      currentPlayIndex: 0,
      dealerCards: [],
      communityCards: [],
      pot: 0,
      roundNumber: 1,
      playNumber: 1,
      seed: undefined,
      seedHash: undefined
    };
  }

  startPlay(gameState: GameState, config: RoomConfig): GameState {
    const bettingPlayers = gameState.players.filter(p => !p.isDealer && p.isOnline);
    
    if (bettingPlayers.length === 0) {
      return { ...gameState, phase: 'finished' };
    }

    // Generate new seed for this play
    const seed = this.generateSeed();
    const seedHash = this.hashSeed(seed);
    
    // Create and shuffle deck
    const rng = rngFromSeed(seed);
    const deck = shuffleDeck(createDeck(), rng);
    let deckIndex = 0;

    // Reset player states
    const updatedPlayers = gameState.players.map(player => ({
      ...player,
      cards: [],
      currentBet: 0,
      hasActed: false,
      isAllIn: false
    }));

    // Deal initial cards
    // Each betting player gets 2 face-up cards
    bettingPlayers.forEach(player => {
      const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
      if (playerIndex !== -1) {
        const playerHand: Card[] = [
          deck[deckIndex++],
          deck[deckIndex++]
        ];
        updatedPlayers[playerIndex].cards = playerHand;
      }
    });

    // Dealer gets 1 face-up, 1 face-down
    const dealerIndex = updatedPlayers.findIndex(p => p.isDealer);
    if (dealerIndex !== -1) {
      const dealerHand: Card[] = [
        deck[deckIndex++], // Face up
        deck[deckIndex++]  // Face down
      ];
      updatedPlayers[dealerIndex].cards = dealerHand;
    }

    // Calculate pot from all bets
    const pot = updatedPlayers.reduce((sum, player) => sum + (player.currentBet ?? 0), 0);

    return {
      ...gameState,
      players: updatedPlayers,
      dealerCards: updatedPlayers[dealerIndex]?.cards || [],
      pot,
      phase: 'acting',
      seed,
      seedHash,
      timer: {
        startedAt: Date.now(),
        durationMs: 60000,
        endsAt: Date.now() + 60000,
        type: 'acting',
        targetPlayerId: bettingPlayers[0]?.id
      }
    };
  }

  applyAction(gameState: GameState, action: PlayerAction): GameState {
    const playerIndex = gameState.players.findIndex(p => p.id === action.playerId);
    if (playerIndex === -1) return gameState;

    const player = gameState.players[playerIndex];
    const updatedPlayers = [...gameState.players];

    switch (action.type) {
      case 'hit':
        if (gameState.phase !== 'acting' || player.hasActed || player.isDealer) {
          return gameState;
        }

        // Deal a card
        const rng = gameState.seed ? rngFromSeed(gameState.seed) : undefined;
        const deck = shuffleDeck(createDeck(), rng);
        const newCard = deck[(player.cards?.length ?? 0) + 2]; // Account for initial cards
        
        const newHand: Card[] = [...(player.cards ?? []), newCard];
        updatedPlayers[playerIndex] = {
          ...player,
          cards: newHand,
          hasActed: true
        };

        // Check if bust
        const handValue = calculateHandValue(updatedPlayers[playerIndex].cards ?? []);
        if (handValue > 21) {
          // Player busts, move to next player
          return this.moveToNextPlayer(gameState, updatedPlayers);
        }

        return {
          ...gameState,
          players: updatedPlayers,
          phase: 'acting'
        };

      case 'stand':
        if (gameState.phase !== 'acting' || player.hasActed || player.isDealer) {
          return gameState;
        }

        updatedPlayers[playerIndex] = {
          ...player,
          hasActed: true
        };

        return this.moveToNextPlayer(gameState, updatedPlayers);

      case 'bet':
        if (gameState.phase !== 'betting' || player.isDealer) {
          return gameState;
        }

        const betAmount = Math.max(action.amount || 0, gameState.minBet);
        updatedPlayers[playerIndex] = {
          ...player,
          currentBet: betAmount,
          balance: player.balance - betAmount
        };

        return {
          ...gameState,
          players: updatedPlayers,
          pot: updatedPlayers.reduce((sum, p) => sum + (p.currentBet ?? 0), 0)
        };

      default:
        return gameState;
    }
  }

  isPlayOver(gameState: GameState): boolean {
    if (gameState.phase === 'finished') return true;
    
    const bettingPlayers = gameState.players.filter(p => !p.isDealer && p.isOnline);
    const allPlayersActed = bettingPlayers.every(p => p.hasActed);
    
    if (allPlayersActed && gameState.phase === 'acting') {
      return true; // Move to dealer phase
    }
    
    return false;
  }

  settle(gameState: GameState): GameResult {
    const winnings: Record<string, number> = {};
    const dealer = gameState.players.find(p => p.isDealer);
    const bettingPlayers = gameState.players.filter(p => !p.isDealer && p.isOnline);
    
    if (!dealer) return { handNo: gameState.handNo, deltas: winnings };

    const dealerHand = dealer.cards ?? [];
    let dealerWinnings = 0;

    bettingPlayers.forEach(player => {
      const playerHand = player.cards ?? [];
      const bet = player.currentBet ?? 0;
      const result = compareHands(playerHand, dealerHand);

      let playerWinnings = 0;

      switch (result) {
        case 1: // win
          if (isBlackjack(playerHand)) {
            playerWinnings = Math.floor(bet * 1.5); // Blackjack pays 3:2
          } else {
            playerWinnings = bet;
          }
          dealerWinnings -= playerWinnings;
          break;
        case -1: // lose
          playerWinnings = -bet;
          dealerWinnings += bet;
          break;
        case 0: // push
          // No change in balance
          break;
      }

      winnings[player.id] = playerWinnings;
    });

    // Dealer winnings
    winnings[dealer.id] = dealerWinnings;

    return { handNo: gameState.handNo, deltas: winnings };
  }

  // Legacy methods for backward compatibility
  processAction(gameState: GameState, action: PlayerAction): GameState {
    return this.applyAction(gameState, action);
  }

  checkGameEnd(gameState: GameState): boolean {
    return this.isPlayOver(gameState);
  }

  calculateWinnings(gameState: GameState): Record<string, number> {
    const result = this.settle(gameState);
    return result.deltas;
  }

  getLegalActions(gameState: GameState, playerId: string): string[] {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return [];

    const actions: string[] = [];

    switch (gameState.phase) {
      case 'betting':
        if (!player.isDealer && player.isOnline) {
          actions.push('bet');
        }
        break;

      case 'acting':
        if (!player.isDealer && player.isOnline && !player.hasActed) {
          const handValue = calculateHandValue(player.cards ?? []);
          if (handValue < 21) {
            actions.push('hit', 'stand');
          } else {
            actions.push('stand');
          }
        }
        break;

      default:
        break;
    }

    return actions;
  }

  private moveToNextPlayer(gameState: GameState, players: Player[]): GameState {
    const bettingPlayers = players.filter(p => !p.isDealer && p.isOnline);
    const nextPlayer = bettingPlayers.find(p => !p.hasActed);
    
    if (nextPlayer) {
      const now = Date.now();
      return {
        ...gameState,
        players,
        timer: {
          startedAt: now,
          durationMs: 60000,
          endsAt: now + 60000,
          type: 'acting',
          targetPlayerId: nextPlayer.id
        }
      };
    } else {
      // All players acted, move to dealer phase
      const now = Date.now();
      return {
        ...gameState,
        players,
        phase: 'dealer',
        timer: {
          startedAt: now,
          durationMs: 30000,
          endsAt: now + 30000,
          type: 'dealer'
        }
      };
    }
  }

  private generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSeed(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashSeed(seed: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(seed).digest('hex');
  }
}