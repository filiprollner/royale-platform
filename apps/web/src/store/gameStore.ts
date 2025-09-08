import { create } from 'zustand';
import { GameState, Player, RoomConfig, PlayerAction, ChatMessage } from '@royale-platform/shared';

interface GameStore {
  // Connection state
  isConnected: boolean;
  currentRoomId: string | null;
  currentPlayer: Player | null;
  
  // Game state
  gameState: GameState | null;
  legalActions: string[];
  
  // UI state
  isCreatingRoom: boolean;
  isJoiningRoom: boolean;
  error: string | null;
  
  // Chat
  messages: ChatMessage[];
  
  // Actions
  setConnected: (connected: boolean) => void;
  setCurrentRoom: (roomId: string | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setGameState: (gameState: GameState | null) => void;
  setLegalActions: (actions: string[]) => void;
  setCreatingRoom: (creating: boolean) => void;
  setJoiningRoom: (joining: boolean) => void;
  setError: (error: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  
  // Game actions
  createRoom: (config: RoomConfig, player: Omit<Player, 'balance' | 'currentBet' | 'cards' | 'hasActed' | 'isAllIn'>) => void;
  joinRoom: (roomId: string, player: Omit<Player, 'balance' | 'currentBet' | 'cards' | 'hasActed' | 'isAllIn'>) => void;
  leaveRoom: () => void;
  startHand: () => void;
  performAction: (action: Omit<PlayerAction, 'playerId'>) => void;
  sendChatMessage: (message: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  isConnected: false,
  currentRoomId: null,
  currentPlayer: null,
  gameState: null,
  legalActions: [],
  isCreatingRoom: false,
  isJoiningRoom: false,
  error: null,
  messages: [],
  
  // Setters
  setConnected: (connected) => set({ isConnected: connected }),
  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  setGameState: (gameState) => {
    set({ gameState });
    
    // Update legal actions for current player
    const { currentPlayer } = get();
    if (currentPlayer && gameState) {
      // This would be set by the socket handler
      // set({ legalActions: getLegalActions(gameState, currentPlayer.id) });
    }
  },
  setLegalActions: (actions) => set({ legalActions: actions }),
  setCreatingRoom: (creating) => set({ isCreatingRoom: creating }),
  setJoiningRoom: (joining) => set({ isJoiningRoom: joining }),
  setError: (error) => set({ error }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  clearMessages: () => set({ messages: [] }),
  
  // Game actions (these will be implemented by the socket hook)
  createRoom: (config, player) => {
    set({ isCreatingRoom: true, error: null });
    // Implementation provided by useSocket hook
  },
  
  joinRoom: (roomId, player) => {
    set({ isJoiningRoom: true, error: null });
    // Implementation provided by useSocket hook
  },
  
  leaveRoom: () => {
    set({ 
      currentRoomId: null, 
      gameState: null, 
      legalActions: [],
      messages: []
    });
    // Implementation provided by useSocket hook
  },
  
  startHand: () => {
    // Implementation provided by useSocket hook
  },
  
  performAction: (action: { type: 'bet'; amount: number } | { type: 'hit' } | { type: 'stand' }) => {
    const { currentPlayer } = get();
    if (!currentPlayer) return;
    
    const fullAction: PlayerAction = {
      ...action,
      playerId: currentPlayer.id
    } as PlayerAction;
    
    // Implementation provided by useSocket hook
  },
  
  sendChatMessage: (message) => {
    const { currentPlayer, currentRoomId } = get();
    if (!currentPlayer || !currentRoomId) return;
    
    // Implementation provided by useSocket hook
  }
}));
