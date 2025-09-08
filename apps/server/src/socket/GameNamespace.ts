import { Server as SocketIOServer, Socket } from 'socket.io';
import { GameEngine } from '../engine/GameEngine';
import { RoomConfig, PlayerAction, ChatMessage, SocketEvents } from '@royale-platform/shared';
import { ServerEvents } from '../engine/types';

export class GameNamespace {
  private io: SocketIOServer;
  private games: Map<string, GameEngine> = new Map();
  private playerSockets: Map<string, string> = new Map(); // playerId -> socketId

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupNamespace();
  }

  private setupNamespace(): void {
    const gameNamespace = this.io.of('/game');

    gameNamespace.on('connection', (socket: Socket) => {
      console.log(`Player connected: ${socket.id}`);

      // Room creation
      socket.on(ServerEvents["room:create"], (data: { config: RoomConfig; player: any }) => {
        this.handleRoomCreate(socket, data);
      });

      // Room joining
      socket.on(ServerEvents["room:join"], (data: { roomId: string; player: any }) => {
        this.handleRoomJoin(socket, data);
      });

      // Room leaving
      socket.on(ServerEvents["room:leave"], (data: { roomId: string; playerId: string }) => {
        this.handleRoomLeave(socket, data);
      });

      // Hand starting
      socket.on(ServerEvents["hand:start"], (data: { roomId: string; playerId: string }) => {
        this.handleHandStart(socket, data);
      });

      // Player actions
      socket.on(ServerEvents["action"], (data: { roomId: string; action: PlayerAction }) => {
        this.handleAction(socket, data);
      });

      // Chat messages
      socket.on(ServerEvents["chat:post"], (data: { roomId: string; message: string; playerId: string }) => {
        this.handleChatMessage(socket, data);
      });

      // Disconnect handling
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private handleRoomCreate(socket: Socket, data: { config: RoomConfig; player: any }): void {
    try {
      const gameId = this.generateGameId();
      const game = new GameEngine(data.config);
      
      // Add the creator as a player
      const success = game.addPlayer({
        id: data.player.id,
        name: data.player.name,
        seat: 0,
        balance: 0,
        isOnline: true,
        isDealer: false,
        seatIndex: 0,
        avatar: data.player.avatar
      });

      if (!success) {
        socket.emit(ServerEvents["error"], { message: 'Failed to create room' });
        return;
      }

      this.games.set(gameId, game);
      this.playerSockets.set(data.player.id, socket.id);

      socket.join(gameId);
      socket.emit(SocketEvents["room:state"], game.getState());
      
      console.log(`Room created: ${gameId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit(ServerEvents["error"], { message: 'Failed to create room' });
    }
  }

  private handleRoomJoin(socket: Socket, data: { roomId: string; player: any }): void {
    try {
      const game = this.games.get(data.roomId);
      if (!game) {
        socket.emit(ServerEvents["error"], { message: 'Room not found' });
        return;
      }

      // Find available seat
      const gameState = game.getState();
      const occupiedSeats = gameState.players.map(p => p.seatIndex);
      const maxPlayers = gameState.maxPlayers ?? 9;
      let availableSeat = -1;
      
      for (let i = 0; i < maxPlayers; i++) {
        if (!occupiedSeats.includes(i)) {
          availableSeat = i;
          break;
        }
      }

      if (availableSeat === -1) {
        socket.emit(ServerEvents["error"], { message: 'Room is full' });
        return;
      }

      const success = game.addPlayer({
        id: data.player.id,
        name: data.player.name,
        seat: availableSeat,
        balance: 0,
        isOnline: true,
        isDealer: false,
        seatIndex: availableSeat,
        avatar: data.player.avatar
      });

      if (!success) {
        socket.emit(ServerEvents["error"], { message: 'Failed to join room' });
        return;
      }

      this.playerSockets.set(data.player.id, socket.id);
      socket.join(data.roomId);
      
      // Broadcast updated state to all players in room
      this.broadcastRoomState(data.roomId);
      
      console.log(`Player ${data.player.name} joined room ${data.roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit(ServerEvents["error"], { message: 'Failed to join room' });
    }
  }

  private handleRoomLeave(socket: Socket, data: { roomId: string; playerId: string }): void {
    try {
      const game = this.games.get(data.roomId);
      if (!game) {
        return;
      }

      game.removePlayer(data.playerId);
      this.playerSockets.delete(data.playerId);
      socket.leave(data.roomId);
      
      // Broadcast updated state to remaining players
      this.broadcastRoomState(data.roomId);
      
      console.log(`Player ${data.playerId} left room ${data.roomId}`);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  private handleHandStart(socket: Socket, data: { roomId: string; playerId: string }): void {
    try {
      const game = this.games.get(data.roomId);
      if (!game) {
        socket.emit(ServerEvents["error"], { message: 'Room not found' });
        return;
      }

      const gameState = game.getState();
      const player = gameState.players.find(p => p.id === data.playerId);
      
      if (!player || !player.isOnline) {
        socket.emit(ServerEvents["error"], { message: 'Player not found or offline' });
        return;
      }

      // Start the play
      const updatedState = game.startPlay();
      this.broadcastRoomState(data.roomId);
      
      console.log(`Hand started in room ${data.roomId}`);
    } catch (error) {
      console.error('Error starting hand:', error);
      socket.emit(ServerEvents["error"], { message: 'Failed to start hand' });
    }
  }

  private handleAction(socket: Socket, data: { roomId: string; action: PlayerAction }): void {
    try {
      const game = this.games.get(data.roomId);
      if (!game) {
        socket.emit(ServerEvents["error"], { message: 'Room not found' });
        return;
      }

      const gameState = game.getState();
      const player = gameState.players.find(p => p.id === data.action.playerId);
      
      if (!player || !player.isOnline) {
        socket.emit(ServerEvents["error"], { message: 'Player not found or offline' });
        return;
      }

      // Check if action is legal
      const legalActions = game.getLegalActions(data.action.playerId);
      if (!legalActions.includes(data.action.type)) {
        socket.emit(ServerEvents["error"], { message: 'Illegal action' });
        return;
      }

      // Process the action
      const updatedState = game.processAction(data.action);
      this.broadcastRoomState(data.roomId);
      
      console.log(`Action ${data.action.type} processed for player ${data.action.playerId}`);
    } catch (error) {
      console.error('Error processing action:', error);
      socket.emit(ServerEvents["error"], { message: 'Failed to process action' });
    }
  }

  private handleChatMessage(socket: Socket, data: { roomId: string; message: string; playerId: string }): void {
    try {
      const game = this.games.get(data.roomId);
      if (!game) {
        return;
      }

      const gameState = game.getState();
      const player = gameState.players.find(p => p.id === data.playerId);
      
      if (!player) {
        return;
      }

      const chatMessage: ChatMessage = {
        id: this.generateMessageId(),
        from: data.playerId,
        text: data.message,
        at: Date.now()
      };

      // Broadcast to all players in room
      this.io.of('/game').to(data.roomId).emit(SocketEvents["chat:message"], chatMessage);
      
      console.log(`Chat message from ${player.name}: ${data.message}`);
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  }

  private handleDisconnect(socket: Socket): void {
    // Find player by socket ID
    const playerId = Array.from(this.playerSockets.entries())
      .find(([_, socketId]) => socketId === socket.id)?.[0];

    if (playerId) {
      // Mark player as offline in all their games
      this.games.forEach((game, gameId) => {
        game.updatePlayerOnlineStatus(playerId, false);
        this.broadcastRoomState(gameId);
      });

      this.playerSockets.delete(playerId);
      console.log(`Player ${playerId} disconnected`);
    }
  }

  private broadcastRoomState(roomId: string): void {
    const game = this.games.get(roomId);
    if (!game) return;

    const state = game.getState();
    this.io.of('/game').to(roomId).emit(SocketEvents["room:state"], state);
  }

  private generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}