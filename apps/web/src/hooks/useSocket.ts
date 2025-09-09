import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import { PlayerAction, ChatMessage } from '@royale-platform/shared';

// Define SocketEvents locally to avoid import issues
const SocketEvents = {
  "room:state": "room:state",
  "timer:tock": "timer:tock",
  "chat:message": "chat:message",
  "notice": "notice",
  "error": "error",
  "room:create": "room:create",
  "room:join": "room:join",
  "room:leave": "room:leave",
  "hand:start": "hand:start",
  "action": "action",
  "chat:post": "chat:post",
} as const;

const SERVER_URL = (import.meta as any).env.VITE_SERVER_URL || 'https://royale-platform.fly.dev'; // Production server URL

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const {
    setConnected,
    setGameState,
    setError,
    addMessage,
    setLegalActions,
    setCurrentRoom,
    setCurrentPlayer,
    currentPlayer,
    currentRoomId
  } = useGameStore();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(`${SERVER_URL}/game`, {
      transports: ['websocket'],
      autoConnect: true
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    // Game events
    socket.on(SocketEvents["room:state"], (gameState) => {
      console.log('Room state updated:', gameState);
      setGameState(gameState);
      
      // Set current room ID if not set
      if (gameState.id && !currentRoomId) {
        setCurrentRoom(gameState.id);
      }
      
      // Update legal actions for current player
      if (currentPlayer && gameState) {
        const bettingPlayers = gameState.players.filter(p => !p.isDealer && p.isOnline);
        const activePlayer = bettingPlayers.find(p => !p.hasActed);
        
        if (activePlayer?.id === currentPlayer.id) {
          const actions = [];
          if (gameState.phase === 'betting') {
            actions.push('bet');
          } else if (gameState.phase === 'acting') {
            const handValue = activePlayer.cards.reduce((sum, card) => sum + card.value, 0);
            if (handValue < 21) {
              actions.push('hit', 'stand');
            } else {
              actions.push('stand');
            }
          }
          setLegalActions(actions);
        } else {
          setLegalActions([]);
        }
      }
    });

    socket.on(SocketEvents["timer:tock"], (timerData) => {
      console.log('Timer update:', timerData);
      // Handle timer updates if needed
    });

    socket.on(SocketEvents["chat:message"], (message: ChatMessage) => {
      console.log('Chat message:', message);
      addMessage(message);
    });

    socket.on(SocketEvents["notice"], (notice) => {
      console.log('Notice:', notice);
      // Handle notices if needed
    });

    socket.on(SocketEvents["error"], (error) => {
      console.error('Socket error:', error);
      setError(error.message || 'An error occurred');
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [setConnected, setGameState, setError, addMessage, setLegalActions, currentPlayer, currentRoomId]);

  const createRoom = (config: any, player: any) => {
    if (!socketRef.current) return;
    
    socketRef.current.emit(SocketEvents["room:create"], { config, player });
  };

  const joinRoom = (roomId: string, player: any) => {
    if (!socketRef.current) return;
    
    socketRef.current.emit(SocketEvents["room:join"], { roomId, player });
  };

  const leaveRoom = () => {
    if (!socketRef.current || !currentRoomId) return;
    
    socketRef.current.emit(SocketEvents["room:leave"], { 
      roomId: currentRoomId, 
      playerId: currentPlayer?.id 
    });
  };

  const startHand = () => {
    if (!socketRef.current || !currentRoomId || !currentPlayer) return;
    
    socketRef.current.emit(SocketEvents["hand:start"], { 
      roomId: currentRoomId, 
      playerId: currentPlayer.id 
    });
  };

  const performAction = (action: { type: 'bet'; amount: number } | { type: 'hit' } | { type: 'stand' }) => {
    if (!socketRef.current || !currentRoomId || !currentPlayer) return;
    
    const fullAction: PlayerAction = {
      ...action,
      playerId: currentPlayer.id
    } as PlayerAction;
    
    socketRef.current.emit(SocketEvents["action"], { 
      roomId: currentRoomId, 
      action: fullAction 
    });
  };

  const sendChatMessage = (message: string) => {
    if (!socketRef.current || !currentRoomId || !currentPlayer) return;
    
    socketRef.current.emit(SocketEvents["chat:post"], { 
      roomId: currentRoomId, 
      message, 
      playerId: currentPlayer.id 
    });
  };

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    startHand,
    performAction,
    sendChatMessage
  };
};
