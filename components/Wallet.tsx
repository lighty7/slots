import React from 'react';
import { WalletState } from '../types';
import { Coins, Diamond, Plus } from 'lucide-react';

interface Props {
  wallet: WalletState;
  onTopUp: () => void;
}

const Wallet: React.FC<Props> = ({ wallet, onTopUp }) => {
  return (
    <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl">
      <div className="flex items-center gap-2 text-amber-400">
        <Coins size={18} />
        <span className="font-mono font-bold text-lg">{wallet.softCoin.toLocaleString()}</span>
      </div>
      <div className="w-px h-6 bg-white/20"></div>
      <div className="flex items-center gap-2 text-cyan-400">
        <Diamond size={18} />
        <span className="font-mono font-bold text-lg">{wallet.gems.toLocaleString()}</span>
      </div>
      <button 
        onClick={onTopUp}
        className="ml-2 w-6 h-6 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-slate-900 transition-colors"
        title="Admin Top Up"
      >
        <Plus size={14} strokeWidth={3} />
      </button>
    </div>
  );
};

export default Wallet;