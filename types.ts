
export type SymbolId = string;

export interface SymbolDef {
  id: SymbolId;
  name: string;
  icon: string; // Emoji or Lucide icon name mapping
  color: string;
  value: number; // Base payout multiplier (fallback)
}

export interface MachineConfig {
  id: string;
  name: string;
  description: string;
  theme: 'classic' | 'neon' | 'zen' | 'jackpot';
  reels: number;
  rows: number;
  symbols: SymbolDef[];
  paylines: number[][][]; // Array of coordinate sets [[0,0], [0,1], ...]
  
  // Advanced Config (Optional)
  reelStrips?: SymbolId[][]; // Explicit symbol order for each reel
  payouts?: Record<SymbolId, Record<number, number>>; // Explicit payout table: SymbolId -> Count -> Multiplier/Coins
  
  costPerSpin: number;
  rtp: number; // 0-1
  volatility: 'low' | 'medium' | 'high';
  minBet: number;
  maxBet: number;
}

export interface SpinResult {
  grid: SymbolId[][]; // [col][row]
  winningLines: {
    lineIndex: number;
    symbolId: SymbolId;
    count: number;
    amount: number;
    coordinates: {col: number, row: number}[];
  }[];
  totalWin: number;
  isJackpot: boolean;
}

export interface WalletState {
  softCoin: number;
  gems: number;
}
