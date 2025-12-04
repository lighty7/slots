import React from 'react';
import { MachineConfig } from '../types';
import { Play, TrendingUp, Zap } from 'lucide-react';

interface Props {
  machine: MachineConfig;
  onSelect: (m: MachineConfig) => void;
}

const MachineCard: React.FC<Props> = ({ machine, onSelect }) => {
  return (
    <div 
      className="glass-panel rounded-2xl p-6 flex flex-col hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden"
      onClick={() => onSelect(machine)}
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        {machine.theme === 'classic' && <span className="text-9xl">🎰</span>}
        {machine.theme === 'neon' && <span className="text-9xl">⚡</span>}
        {machine.theme === 'zen' && <span className="text-9xl">🌸</span>}
        {machine.theme === 'jackpot' && <span className="text-9xl">💎</span>}
      </div>

      <div className="z-10 flex-1">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                {machine.name}
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                ${machine.volatility === 'high' ? 'bg-red-500/20 text-red-300' : 
                  machine.volatility === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 
                  'bg-green-500/20 text-green-300'
                }`}>
                {machine.volatility} Vol
            </span>
        </div>
        
        <p className="text-slate-400 text-sm mb-6 h-10 line-clamp-2">
            {machine.description}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6 text-sm text-slate-300">
            <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-400" />
                <span>RTP {machine.rtp * 100}%</span>
            </div>
             <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                <span>{machine.paylines.length} Lines</span>
            </div>
        </div>
      </div>

      <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 group-hover:scale-[1.02] transition-transform">
        <Play size={18} fill="currentColor" />
        Play Now
      </button>
    </div>
  );
};

export default MachineCard;