import React from 'react';
import { motion } from 'framer-motion';
import { Table, Card, ChipStack, Button, Avatar } from '@royale-platform/ui';
import { GameState, Player, Card as CardType } from '@royale-platform/shared';

// Mock data for design showcase
const mockPlayers: Player[] = [
  {
    id: 'player1',
    name: 'Alice',
    avatar: '',
    balance: 2500,
    isOnline: true,
    isDealer: true,
    seat: 0,
    seatIndex: 0,
    currentBet: 100,
    cards: [
      { s: 'hearts', r: 'A' },
      { s: 'spades', r: 'K' }
    ],
    hasActed: false,
    isAllIn: false
  },
  {
    id: 'player2',
    name: 'Bob',
    avatar: '',
    balance: 1800,
    isOnline: true,
    isDealer: false,
    seat: 1,
    seatIndex: 1,
    currentBet: 150,
    cards: [
      { s: 'diamonds', r: 'T' },
      { s: 'clubs', r: '7' }
    ],
    hasActed: false,
    isAllIn: false
  },
  {
    id: 'player3',
    name: 'Charlie',
    avatar: '',
    balance: 3200,
    isOnline: true,
    isDealer: false,
    seat: 2,
    seatIndex: 2,
    currentBet: 200,
    cards: [
      { s: 'hearts', r: 'Q' },
      { s: 'spades', r: '6' }
    ],
    hasActed: true,
    isAllIn: false
  },
  {
    id: 'player4',
    name: 'Diana',
    avatar: '',
    balance: 950,
    isOnline: true,
    isDealer: false,
    seat: 3,
    seatIndex: 3,
    currentBet: 75,
    cards: [
      { s: 'clubs', r: '9' },
      { s: 'diamonds', r: '8' }
    ],
    hasActed: false,
    isAllIn: false
  }
];

const mockGameState: GameState = {
  id: 'demo-game',
  name: 'Design Showcase',
  minBet: 50,
  maxPlayers: 9,
  players: mockPlayers,
  currentDealerIndex: 0,
  currentPlayIndex: 1,
  phase: 'acting',
  dealerCards: [
    { s: 'hearts', r: 'A' },
    { s: 'spades', r: '5' }
  ],
  communityCards: [],
  pot: 525,
  timer: {
    endsAt: Date.now() + 45000,
    type: 'acting',
    remaining: 45,
  },
  roundNumber: 1,
  playNumber: 1,
  seed: 'demo-seed',
  seedHash: 'demo-hash'
};

export const Design: React.FC = () => {
  return (
    <div className="min-h-screen bg-ink p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-accent mb-4 text-glow">
            Design System
          </h1>
          <p className="text-glass text-lg">
            Royale Platform - Multiplayer Blackjack Interface
          </p>
        </motion.div>

        {/* Game Table Showcase */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-white">Game Table</h2>
          <div className="relative h-[600px] bg-ink-2/30 rounded-3xl p-8">
            <Table
              gameState={mockGameState}
              className="w-full h-full"
            />
          </div>
        </motion.div>

        {/* Component Showcase */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Cards</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Card
                  card={{ s: 'hearts', r: 'A' }}
                  size="sm"
                  isFaceUp={true}
                />
                <Card
                  card={{ s: 'spades', r: 'K' }}
                  size="sm"
                  isFaceUp={true}
                />
                <Card
                  card={{ s: 'diamonds', r: 'Q' }}
                  size="sm"
                  isFaceUp={true}
                />
                <Card
                  card={{ s: 'clubs', r: 'J' }}
                  size="sm"
                  isFaceUp={true}
                />
              </div>
              <div className="flex gap-2">
                <Card
                  card={{ s: 'hearts', r: 'A' }}
                  size="md"
                  isFaceUp={false}
                />
                <Card
                  card={{ s: 'spades', r: 'K' }}
                  size="md"
                  isFaceUp={false}
                />
              </div>
            </div>
          </div>

          {/* Chips */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Chip Stacks</h3>
            <div className="space-y-4">
              <ChipStack amount={100} size="sm" />
              <ChipStack amount={500} size="md" />
              <ChipStack amount={2500} size="lg" />
            </div>
          </div>

          {/* Avatars */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Avatars</h3>
            <div className="flex gap-4">
              <Avatar
                player={{ id: '1', name: 'Alice', avatar: '', balance: 0, isOnline: true, isDealer: false, seatIndex: 0, currentBet: 0, cards: [], hasActed: false, isAllIn: false }}
                size={48}
                isOnline={true}
                isDealer={false}
              />
              <Avatar
                player={{ id: '2', name: 'Bob', avatar: '', balance: 0, isOnline: true, isDealer: true, seatIndex: 1, currentBet: 0, cards: [], hasActed: false, isAllIn: false }}
                size={56}
                isOnline={true}
                isDealer={true}
              />
              <Avatar
                player={{ id: '3', name: 'Charlie', avatar: '', balance: 0, isOnline: false, isDealer: false, seatIndex: 2, currentBet: 0, cards: [], hasActed: false, isAllIn: false }}
                size={48}
                isOnline={false}
                isDealer={false}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Buttons</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button variant="primary" size="sm">Hit</Button>
                <Button variant="secondary" size="sm">Stand</Button>
                <Button variant="danger" size="sm">Fold</Button>
              </div>
              <div className="flex gap-2">
                <Button variant="success" size="md">Bet $100</Button>
                <Button variant="ghost" size="md">All In</Button>
              </div>
              <Button variant="primary" size="lg" className="w-full">
                Start Hand
              </Button>
            </div>
          </div>

          {/* Color Palette */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Color Palette</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="w-full h-8 bg-ink rounded"></div>
                <p className="text-xs text-glass">Ink</p>
              </div>
              <div className="space-y-1">
                <div className="w-full h-8 bg-ink-2 rounded"></div>
                <p className="text-xs text-glass">Ink-2</p>
              </div>
              <div className="space-y-1">
                <div className="w-full h-8 bg-ink-3 rounded"></div>
                <p className="text-xs text-glass">Ink-3</p>
              </div>
              <div className="space-y-1">
                <div className="w-full h-8 bg-rail rounded"></div>
                <p className="text-xs text-glass">Rail</p>
              </div>
              <div className="space-y-1">
                <div className="w-full h-8 bg-glass rounded"></div>
                <p className="text-xs text-glass">Glass</p>
              </div>
              <div className="space-y-1">
                <div className="w-full h-8 bg-felt rounded"></div>
                <p className="text-xs text-glass">Felt</p>
              </div>
              <div className="space-y-1">
                <div className="w-full h-8 bg-accent rounded"></div>
                <p className="text-xs text-glass">Accent</p>
              </div>
              <div className="space-y-1">
                <div className="w-full h-8 bg-danger rounded"></div>
                <p className="text-xs text-glass">Danger</p>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Typography</h3>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-accent">Heading 1</h1>
              <h2 className="text-2xl font-bold text-white">Heading 2</h2>
              <h3 className="text-xl font-semibold text-white">Heading 3</h3>
              <p className="text-base text-glass">Body text with glass color</p>
              <p className="text-sm text-glass/60">Small text with reduced opacity</p>
            </div>
          </div>
        </motion.div>

        {/* Back to Lobby */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="secondary"
            onClick={() => window.history.back()}
            size="lg"
          >
            Back to Lobby
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
