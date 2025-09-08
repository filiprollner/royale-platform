import { 
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
import { DealerBlackjack } from './rules/dealerBlackjack';
import { GameState, Player, RuntimeTimer } from './types';

export class GameEngine {
  private gameState: GameState;
  private rules: DealerBlackjack;
  private timer?: NodeJS.Timeout;

  constructor(initialConfig: RoomConfig) {
    this.rules = new DealerBlackjack();
    this.gameState = this.rules.initializeGame(initialConfig);
  }

  getState(): GameState {
    return { ...this.gameState };
  }

  addPlayer(player: Omit<Player, 'balance' | 'currentBet' | 'cards' | 'hasActed' | 'isAllIn'>): boolean {
    const maxPlayers = this.gameState.maxPlayers ?? 9;
    if (this.gameState.players.length >= maxPlayers) {
      return false;
    }

    const newPlayer: Player = {
      ...player,
      balance: 0,
      currentBet: 0,
      cards: [],
      hasActed: false,
      isAllIn: false
    };

    this.gameState.players.push(newPlayer);
    return true;
  }

  removePlayer(playerId: string): boolean {
    const index = this.gameState.players.findIndex(p => p.id === playerId);
    if (index === -1) return false;

    this.gameState.players.splice(index, 1);
    return true;
  }

  updatePlayerOnlineStatus(playerId: string, isOnline: boolean): boolean {
    const player = this.gameState.players.find(p => p.id === playerId);
    if (!player) return false;

    player.isOnline = isOnline;
    return true;
  }

  processAction(action: PlayerAction): GameState {
    const updatedState = this.rules.processAction(this.gameState, action);
    this.gameState = updatedState;

    // Check if game should end
    if (this.rules.checkGameEnd(this.gameState)) {
      this.endPlay();
    }

    return this.getState();
  }

  startPlay(): GameState {
    if (this.gameState.phase !== 'waiting' && this.gameState.phase !== 'finished') {
      return this.getState();
    }

    // Check if we have enough players
    const bettingPlayers = this.gameState.players.filter(p => !p.isDealer && p.isOnline);
    if (bettingPlayers.length === 0) {
      return this.getState();
    }

    // Start betting phase
    this.gameState.phase = 'betting';
    const now = Date.now();
    this.gameState.timer = {
      startedAt: now,
      durationMs: 60000,
      endsAt: now + 60000,
      type: 'betting'
    };

    this.startTimer();
    return this.getState();
  }

  private endPlay(): void {
    // Calculate winnings
    const winnings = this.rules.calculateWinnings(this.gameState);
    
    // Update player balances
    this.gameState.players.forEach(player => {
      const playerWinnings = winnings[player.id] || 0;
      player.balance += playerWinnings;
    });

    // Reset for next play
    this.gameState.phase = 'resolving';
    this.gameState.timer = undefined;
    this.gameState.pot = 0;

    // Clear timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    // Move to next dealer after a delay
    setTimeout(() => {
      this.moveToNextDealer();
    }, 3000);
  }

  private moveToNextDealer(): void {
    // Find next dealer
    const currentDealerIndex = this.gameState.currentDealerIndex ?? 0;
    const maxPlayers = this.gameState.maxPlayers ?? 9;
    let nextDealerIndex = (currentDealerIndex + 1) % maxPlayers;
    
    // Find next available player
    while (nextDealerIndex !== currentDealerIndex) {
      const player = this.gameState.players.find(p => p.seatIndex === nextDealerIndex);
      if (player && player.isOnline) {
        break;
      }
      nextDealerIndex = (nextDealerIndex + 1) % maxPlayers;
    }

    // Update dealer
    this.gameState.players.forEach(player => {
      player.isDealer = player.seatIndex === nextDealerIndex;
    });

    this.gameState.currentDealerIndex = nextDealerIndex;
    this.gameState.playNumber = (this.gameState.playNumber ?? 0) + 1;

    // Check if round is complete
    if ((this.gameState.playNumber ?? 0) > this.gameState.players.length) {
      this.gameState.roundNumber = (this.gameState.roundNumber ?? 0) + 1;
      this.gameState.playNumber = 1;
    }

    // Reset for next play
    this.gameState.phase = 'waiting';
    this.gameState.dealerCards = [];
    this.gameState.communityCards = [];
    this.gameState.players.forEach(player => {
      player.cards = [];
      player.currentBet = 0;
      player.hasActed = false;
      player.isAllIn = false;
    });
  }

  private startTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    if (!this.gameState.timer) return;

    this.timer = setInterval(() => {
      if (!this.gameState.timer) return;

      const remaining = Math.max(0, Math.ceil((this.gameState.timer.endsAt - Date.now()) / 1000));

      if (remaining <= 0) {
        this.handleTimerExpired();
      }
    }, 1000);
  }

  private handleTimerExpired(): void {
    if (!this.gameState.timer) return;

    switch (this.gameState.timer.type) {
      case 'betting':
        // Auto-bet minimum for players who haven't bet
        this.gameState.players.forEach(player => {
          if (!player.isDealer && player.isOnline && (player.currentBet ?? 0) < this.gameState.minBet) {
            player.currentBet = this.gameState.minBet;
            player.balance -= this.gameState.minBet;
          }
        });
        
        // Start the play
        this.gameState = this.rules.startPlay(this.gameState);
        this.startTimer();
        break;

      case 'acting':
        // Auto-stand for player who didn't act
        const targetPlayer = this.gameState.players.find(p => p.id === this.gameState.timer?.targetPlayerId);
        if (targetPlayer && !targetPlayer.hasActed) {
          targetPlayer.hasActed = true;
          this.gameState = this.moveToNextPlayer();
        }
        break;

      case 'dealer':
        // Dealer plays automatically
        this.playDealerHand();
        break;
    }
  }

  private moveToNextPlayer(): GameState {
    const bettingPlayers = this.gameState.players.filter(p => !p.isDealer && p.isOnline);
    const nextPlayer = bettingPlayers.find(p => !p.hasActed);
    
    if (nextPlayer) {
      const now = Date.now();
      this.gameState.timer = {
        startedAt: now,
        durationMs: 60000,
        endsAt: now + 60000,
        type: 'acting',
        targetPlayerId: nextPlayer.id
      };
      this.startTimer();
    } else {
      // All players acted, move to dealer phase
      this.gameState.phase = 'dealer';
      const now = Date.now();
      this.gameState.timer = {
        startedAt: now,
        durationMs: 30000,
        endsAt: now + 30000,
        type: 'dealer'
      };
      this.startTimer();
    }

    return this.getState();
  }

  private playDealerHand(): void {
    const dealer = this.gameState.players.find(p => p.isDealer);
    if (!dealer) return;

    // Dealer plays according to blackjack rules
    const rng = this.gameState.seed ? rngFromSeed(this.gameState.seed) : undefined;
    const deck = shuffleDeck(createDeck(), rng);
    let deckIndex = (dealer.cards?.length ?? 0) + 2; // Account for initial cards

    while (true) {
      const handValue = calculateHandValue(dealer.cards ?? []);
      if (!shouldDealerHit(dealer.cards ?? [])) break;
      
      // Deal a card
      const newCard = deck[deckIndex++];
      if (!dealer.cards) dealer.cards = [];
      dealer.cards.push(newCard);
    }

    // End the play
    this.endPlay();
  }

  getLegalActions(playerId: string): string[] {
    return this.rules.getLegalActions(this.gameState, playerId);
  }

  destroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}