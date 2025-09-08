# Royale Platform

A production-ready multiplayer blackjack platform with custom rules and a polished poker-table design. Built with React, TypeScript, Node.js, and Socket.IO.

## 🎮 Features

- **Custom Blackjack Rules**: "Dealer Blackjack" with rotating dealer mechanics
- **Real-time Multiplayer**: WebSocket-based communication with Socket.IO
- **Authoritative Server**: Secure game logic with seeded random number generation
- **Polished UI**: Dark poker table design with glassmorphism effects
- **Responsive Design**: Works on desktop and mobile devices
- **Type Safety**: Full TypeScript implementation across the stack

## 🏗️ Architecture

### Monorepo Structure
```
royale-platform/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── server/       # Node.js + Fastify + Socket.IO backend
├── packages/
│   ├── shared/       # Shared TypeScript types and utilities
│   └── ui/           # React UI components
└── public/           # Static assets
```

### Tech Stack

**Frontend (apps/web)**
- React 18 + TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Framer Motion for animations
- Zustand for state management
- Socket.IO client for real-time communication

**Backend (apps/server)**
- Node.js 20 + TypeScript
- Fastify web framework
- Socket.IO for WebSocket communication
- Zod for validation
- seedrandom for deterministic randomness

**Shared (packages/shared)**
- TypeScript types and interfaces
- Game logic utilities
- Card and table utilities

**UI (packages/ui)**
- Reusable React components
- Design system primitives
- TailwindCSS integration

## 🎯 Game Rules: Dealer Blackjack

### Core Mechanics
- **Rounds**: Every player becomes dealer once per round
- **Plays**: Single dealer hand + betting players complete outcome
- **Dealer Rotation**: Clockwise rotation each play
- **Balances**: Start at $0, can go negative (zero-sum game)

### Play Sequence
1. **Dealer Selection**: Next player clockwise becomes dealer
2. **Betting Phase**: 60s timer, all non-dealers must bet minimum
3. **Card Dealing**: 
   - Each betting player: 2 face-up cards
   - Dealer: 1 face-up, 1 face-down
4. **Player Actions**: Hit/Stand only (no split/double)
5. **Dealer Play**: Reveals face-down, hits ≤16, stands ≥17
6. **Resolution**: Each player vs dealer, zero-sum winnings

### Commitment Rules
- Players must complete all plays in a round
- Absent players auto-bet minimum and auto-stand
- No leaving mid-round

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd royale-platform
npm install
```

2. **Start development servers**
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev --workspace=apps/web
npm run dev --workspace=apps/server
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health check: http://localhost:3001/healthz

### Development Commands

```bash
# Build all packages
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Clean build artifacts
npm run clean
```

## 🎨 Design System

### Color Palette
- **Ink**: `#0e1622` - Primary dark background
- **Ink-2**: `#142135` - Secondary dark
- **Ink-3**: `#1a2b45` - Tertiary dark
- **Rail**: `#233752` - Border color
- **Glass**: `#2a3f5d` - Glassmorphism base
- **Felt**: `#1f3b58` - Table felt
- **Accent**: `#5dd6ff` - Primary accent
- **Danger**: `#ff5d7a` - Error/danger
- **Success**: `#36d399` - Success states

### Components
- **Table**: Oval poker table with glassmorphism
- **Seat**: Player position with avatar and chips
- **Card**: Animated playing cards with flip effects
- **ChipStack**: Stacked betting chips with animations
- **Button**: Glassy action buttons with hover effects

### Design Demo
Visit `/design` route to see the complete design system showcase.

## 🌐 Deployment

### Frontend (Vercel)

1. **Connect to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from apps/web directory
cd apps/web
vercel
```

2. **Environment Variables**
```
VITE_SERVER_URL=wss://your-server.fly.dev
```

3. **Build Settings**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Root Directory: `apps/web`

### Backend (Fly.io)

1. **Install Fly CLI**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Deploy**
```bash
cd apps/server
fly launch
fly deploy
```

3. **Environment Variables**
```bash
fly secrets set PORT=3001
fly secrets set CORS_ORIGINS=https://your-app.vercel.app
fly secrets set SEED_SALT=your-secret-salt
```

### GitHub Actions

The repository includes automated deployment:
- Server deploys to Fly.io on push to main
- Web deploys to Vercel (configure in Vercel dashboard)

## 🔧 Configuration

### Environment Variables

**Web (apps/web)**
```env
VITE_SERVER_URL=wss://your-server.fly.dev
```

**Server (apps/server)**
```env
PORT=3001
CORS_ORIGINS=https://your-app.vercel.app
SEED_SALT=your-secret-salt
```

### Game Configuration

**Room Settings**
- Minimum bet: $10 - $1,000
- Maximum players: 2-9
- Hand timer: 60 seconds
- Betting timer: 60 seconds

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run specific package tests
npm run test --workspace=apps/web
npm run test --workspace=apps/server
```

### Test Coverage
- Unit tests for game logic
- Integration tests for Socket.IO events
- E2E tests with Playwright (planned)

## 📁 Project Structure

```
royale-platform/
├── apps/
│   ├── web/                    # React frontend
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── pages/          # Route pages
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── store/          # Zustand store
│   │   │   └── main.tsx        # App entry point
│   │   ├── public/             # Static assets
│   │   └── package.json
│   └── server/                 # Node.js backend
│       ├── src/
│       │   ├── engine/         # Game engine
│       │   ├── socket/         # Socket.IO handlers
│       │   └── index.ts        # Server entry point
│       ├── Dockerfile
│       └── fly.toml
├── packages/
│   ├── shared/                 # Shared types
│   │   ├── src/
│   │   │   ├── types/          # TypeScript types
│   │   │   └── utils/          # Utility functions
│   │   └── package.json
│   └── ui/                     # UI components
│       ├── src/
│       │   ├── components/     # React components
│       │   └── utils/          # UI utilities
│       └── package.json
├── .github/workflows/          # CI/CD
├── public/                     # Global assets
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the GitHub Issues
2. Review the documentation
3. Create a new issue with detailed information

## 🎯 Roadmap

- [ ] Additional game variants
- [ ] Tournament mode
- [ ] Spectator mode
- [ ] Mobile app
- [ ] Analytics dashboard
- [ ] Social features

---

Built with ❤️ using modern web technologies for the ultimate multiplayer blackjack experience.
