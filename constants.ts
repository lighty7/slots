
import { MachineConfig, SymbolDef } from './types';

// --- Symbols ---
const SYMBOLS: Record<string, SymbolDef> = {
  CHERRY: { id: 'CHERRY', name: 'Cherry', icon: '🍒', color: '#ef4444', value: 2 },
  LEMON: { id: 'LEMON', name: 'Lemon', icon: '🍋', color: '#eab308', value: 3 },
  GRAPE: { id: 'GRAPE', name: 'Grape', icon: '🍇', color: '#a855f7', value: 5 },
  BELL: { id: 'BELL', name: 'Bell', icon: '🔔', color: '#f59e0b', value: 10 },
  BAR: { id: 'BAR', name: 'Bar', icon: '➖', color: '#94a3b8', value: 20 },
  SEVEN: { id: 'SEVEN', name: 'Seven', icon: '7️⃣', color: '#ef4444', value: 50 },
  DIAMOND: { id: 'DIAMOND', name: 'Diamond', icon: '💎', color: '#06b6d4', value: 100 },
  WILD: { id: 'WILD', name: 'Wild', icon: '🃏', color: '#d946ef', value: 0 }, // Special handling
  
  // Neon Theme
  BOLT: { id: 'BOLT', name: 'Bolt', icon: '⚡', color: '#facc15', value: 5 },
  HEART: { id: 'HEART', name: 'Heart', icon: '💜', color: '#d946ef', value: 8 },
  ATOM: { id: 'ATOM', name: 'Atom', icon: '⚛️', color: '#3b82f6', value: 15 },
  
  // Zen Theme
  LOTUS: { id: 'LOTUS', name: 'Lotus', icon: '🌸', color: '#f472b6', value: 5 },
  YIN: { id: 'YIN', name: 'YinYang', icon: '☯️', color: '#1e293b', value: 10 },
  BAMBOO: { id: 'BAMBOO', name: 'Bamboo', icon: '🎍', color: '#22c55e', value: 4 },
};

// --- Machines ---

export const MACHINES: MachineConfig[] = [
  {
    id: 'classic-reel',
    name: 'Classic Reel',
    description: 'Old school mechanical feel. Low volatility, frequent small wins.',
    theme: 'classic',
    reels: 3,
    rows: 3,
    costPerSpin: 1,
    minBet: 1,
    maxBet: 100,
    rtp: 0.94,
    volatility: 'medium',
    symbols: [SYMBOLS.SEVEN, SYMBOLS.BAR, SYMBOLS.CHERRY, SYMBOLS.LEMON],
    // Explicit Reel Strips (Mapped "7" -> SEVEN, etc.)
    reelStrips: [
      ['SEVEN','BAR','CHERRY','LEMON','CHERRY','BAR','SEVEN'],
      ['LEMON','CHERRY','BAR','SEVEN','CHERRY','LEMON','BAR'],
      ['CHERRY','LEMON','BAR','SEVEN','BAR','CHERRY','LEMON']
    ],
    // Explicit Payouts (Coins per bet unit)
    payouts: {
        'SEVEN': { 3: 500, 2: 50 },
        'BAR': { 3: 100, 2: 10 },
        'CHERRY': { 3: 40, 2: 5 },
        'LEMON': { 3: 20 }
    },
    // Converted paylines from [row, row, row] to [[col, row], ...]
    paylines: [
      [[0, 0], [1, 0], [2, 0]], // Top (0,0,0)
      [[0, 1], [1, 1], [2, 1]], // Middle (1,1,1)
      [[0, 2], [1, 2], [2, 2]], // Bottom (2,2,2)
      [[0, 0], [1, 1], [2, 2]], // Diagonal Top-Bot (0,1,2)
      [[0, 2], [1, 1], [2, 0]], // Diagonal Bot-Top (2,1,0)
    ]
  },
  {
    id: 'neon-pulse',
    name: 'Neon Pulse',
    description: 'Electrifying 5-reel action. Stacked wilds and big multipliers.',
    theme: 'neon',
    reels: 5,
    rows: 3,
    costPerSpin: 20,
    minBet: 20,
    maxBet: 500,
    rtp: 0.92,
    volatility: 'medium',
    symbols: [SYMBOLS.BOLT, SYMBOLS.HEART, SYMBOLS.ATOM, SYMBOLS.DIAMOND, SYMBOLS.SEVEN],
    paylines: [
        // Standard 5-reel paylines (simplified)
        [[0,1], [1,1], [2,1], [3,1], [4,1]],
        [[0,0], [1,0], [2,0], [3,0], [4,0]],
        [[0,2], [1,2], [2,2], [3,2], [4,2]],
        [[0,0], [1,1], [2,2], [3,1], [4,0]], // V shape
        [[0,2], [1,1], [2,0], [3,1], [4,2]], // Inverted V
    ]
  },
  {
    id: 'zen-flow',
    name: 'Zen Flow',
    description: 'Relax with high RTP and gentle payouts. Perfect for long sessions.',
    theme: 'zen',
    reels: 5,
    rows: 4,
    costPerSpin: 5,
    minBet: 5,
    maxBet: 50,
    rtp: 0.98,
    volatility: 'low',
    symbols: [SYMBOLS.BAMBOO, SYMBOLS.LOTUS, SYMBOLS.YIN, SYMBOLS.GRAPE, SYMBOLS.LEMON],
    paylines: [
        [[0,1], [1,1], [2,1], [3,1], [4,1]],
        [[0,2], [1,2], [2,2], [3,2], [4,2]],
        [[0,0], [1,1], [2,2], [3,3], [4,3]],
        [[0,3], [1,2], [2,1], [3,0], [4,0]],
    ]
  },
  {
    id: 'jackpot-tower',
    name: 'Jackpot Tower',
    description: 'High risk, massive rewards. Can you hit the diamonds?',
    theme: 'jackpot',
    reels: 3,
    rows: 3,
    costPerSpin: 100,
    minBet: 100,
    maxBet: 1000,
    rtp: 0.88,
    volatility: 'high',
    symbols: [SYMBOLS.DIAMOND, SYMBOLS.SEVEN, SYMBOLS.BAR, SYMBOLS.BELL],
    paylines: [
        [[0, 1], [1, 1], [2, 1]], 
    ]
  }
];

export const INITIAL_WALLET: { softCoin: number; gems: number } = {
  softCoin: 5000,
  gems: 10
};
