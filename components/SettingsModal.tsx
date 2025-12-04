
import React, { useState, useEffect } from 'react';
import { X, Volume2, Trash2, AlertTriangle, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { soundManager } from '../services/SoundManager';

interface Props {
  onClose: () => void;
  onReset: () => void;
}

const SettingsModal: React.FC<Props> = ({ onClose, onReset }) => {
  const [volume, setVolume] = useState(soundManager.getVolume());
  const [confirmReset, setConfirmReset] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value);
    setVolume(newVal);
    soundManager.setVolume(newVal);
  };

  const handleTestSound = () => {
    soundManager.playTestSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

        <div className="space-y-8">
            {/* Audio Section */}
            <div>
                <div className="flex items-center gap-2 mb-4 text-cyan-400">
                    <Music size={20} />
                    <h3 className="font-bold text-lg">Audio</h3>
                </div>
                
                <div className="bg-white/5 rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-center text-sm text-slate-300">
                        <span>Master Volume</span>
                        <span>{Math.round(volume * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Volume2 size={18} className="text-slate-400" />
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05"
                            value={volume}
                            onChange={handleVolumeChange}
                            onMouseUp={handleTestSound}
                            onTouchEnd={handleTestSound}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </div>
                </div>
            </div>

            {/* Data Section */}
            <div>
                <div className="flex items-center gap-2 mb-4 text-red-400">
                    <AlertTriangle size={20} />
                    <h3 className="font-bold text-lg">Danger Zone</h3>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-sm text-slate-300 mb-4">
                        Resetting will clear all your SoftCoins, Gems, and play history. This action cannot be undone.
                    </p>
                    
                    {!confirmReset ? (
                        <button 
                            onClick={() => setConfirmReset(true)}
                            className="w-full py-2 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg border border-red-500/50 transition-colors font-bold text-sm"
                        >
                            <Trash2 size={16} />
                            Reset Game Data
                        </button>
                    ) : (
                        <div className="flex gap-2 animate-fade-in">
                            <button 
                                onClick={() => setConfirmReset(false)}
                                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-bold"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={onReset}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors text-sm font-bold shadow-lg shadow-red-900/50"
                            >
                                Confirm Reset
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-8 text-center">
            <p className="text-xs text-slate-600 font-mono">NeonSlots v1.0.0</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
