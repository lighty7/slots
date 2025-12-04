
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MachineConfig, WalletState } from './types';
import { MACHINES, INITIAL_WALLET } from './constants';
import MachineCard from './components/MachineCard';
import SlotGame from './components/SlotGame';
import Wallet from './components/Wallet';
import SettingsModal from './components/SettingsModal';
import { Ghost, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [currentMachine, setCurrentMachine] = useState<MachineConfig | null>(null);
  const [wallet, setWallet] = useState<WalletState>(INITIAL_WALLET);
  const [showSettings, setShowSettings] = useState(false);

  // Simple persistence
  useEffect(() => {
    const saved = localStorage.getItem('neonSlots_wallet');
    if (saved) {
      setWallet(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('neonSlots_wallet', JSON.stringify(wallet));
  }, [wallet]);

  const handleTopUp = () => {
    // Admin function simulation
    setWallet(prev => ({
        ...prev,
        softCoin: prev.softCoin + 1000
    }));
  };

  const handleReset = () => {
      setWallet(INITIAL_WALLET);
      localStorage.removeItem('neonSlots_wallet');
      setShowSettings(false);
      if (currentMachine) setCurrentMachine(null); // Return to lobby
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-white selection:bg-cyan-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-40 px-6 py-4 flex justify-between items-center border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentMachine(null)}>
            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Ghost size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden md:block">
                NEON<span className="text-cyan-400">SLOTS</span>
            </h1>
        </div>
        
        <div className="flex items-center gap-4">
            <Wallet wallet={wallet} onTopUp={handleTopUp} />
            <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
            >
                <Settings size={20} />
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        
        {currentMachine ? (
            <SlotGame 
                machine={currentMachine} 
                wallet={wallet}
                updateWallet={setWallet}
                onBack={() => setCurrentMachine(null)}
            />
        ) : (
            <div className="space-y-8 animate-fade-in-up">
                <header className="text-center space-y-4 py-8">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                        Choose Your Game
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Experience the thrill of next-gen slots. High RTP, massive jackpots, and instant payouts.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MACHINES.map(machine => (
                        <MachineCard 
                            key={machine.id} 
                            machine={machine} 
                            onSelect={setCurrentMachine} 
                        />
                    ))}
                </div>
            </div>
        )}

      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
            <SettingsModal 
                onClose={() => setShowSettings(false)}
                onReset={handleReset}
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
