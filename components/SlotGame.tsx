
import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RefreshCw, Maximize2, RotateCcw, Square, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MachineConfig, SpinResult, WalletState } from '../types';
import { GameEngine } from '../services/GameEngine';
import { soundManager } from '../services/SoundManager';
import Reel from './Reel';

interface Props {
  machine: MachineConfig;
  wallet: WalletState;
  updateWallet: (newWallet: WalletState) => void;
  onBack: () => void;
}

type GameStatus = 'IDLE' | 'SPINNING' | 'STOPPING' | 'RESULT';

const SlotGame: React.FC<Props> = ({ machine, wallet, updateWallet, onBack }) => {
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [reelsStopped, setReelsStopped] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [bet, setBet] = useState(machine.minBet);
  const [winDisplay, setWinDisplay] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Dimensions for overlay
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridDim, setGridDim] = useState({ w: 0, h: 0 });

  const MACHINE_ROW_HEIGHT = 100;

  useEffect(() => {
    const updateDim = () => {
        if (gridRef.current) {
            setGridDim({
                w: gridRef.current.clientWidth,
                h: gridRef.current.clientHeight
            });
        }
    };
    
    // Initial measurement delay to ensure layout is settled
    const t = setTimeout(updateDim, 100);
    window.addEventListener('resize', updateDim);
    return () => {
        window.removeEventListener('resize', updateDim);
        clearTimeout(t);
    };
  }, [machine]);

  // Cleanup timer on unmount
  useEffect(() => {
      return () => {
          if (autoStopTimer.current) clearTimeout(autoStopTimer.current);
      };
  }, []);

  const triggerStop = useCallback(() => {
    if (autoStopTimer.current) clearTimeout(autoStopTimer.current);
    setStatus('STOPPING');
  }, []);

  const handleSpin = useCallback(async () => {
    if (wallet.softCoin < bet) {
        alert("Not enough coins!");
        setAutoPlay(false);
        return;
    }

    // Reset state
    setStatus('SPINNING');
    setReelsStopped(0);
    setResult(null);
    setWinDisplay(0);
    
    // Deduct bet immediately
    updateWallet({ ...wallet, softCoin: wallet.softCoin - bet });
    
    soundManager.playSpinSound();

    try {
        const spinResult = await GameEngine.spin(machine, bet);
        setResult(spinResult);

        // Auto stop after 2s if user doesn't click stop manually
        // We only set this timer once the result is ready to ensure fairness/logic availability
        autoStopTimer.current = setTimeout(() => {
            triggerStop();
        }, 2000);

    } catch (e) {
        console.error("Spin failed", e);
        setStatus('IDLE');
    }
  }, [bet, machine, updateWallet, wallet, triggerStop]);

  // AutoPlay Logic
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (autoPlay && status === 'IDLE') {
        timeout = setTimeout(() => {
            handleSpin();
        }, 1500);
    }
    return () => clearTimeout(timeout);
  }, [autoPlay, status, handleSpin]);

  // Handle Reel Completion
  useEffect(() => {
    if (status === 'STOPPING' && reelsStopped === machine.reels && result) {
        setStatus('RESULT');
        
        if (result.totalWin > 0) {
            setWinDisplay(result.totalWin);
            updateWallet({ ...wallet, softCoin: wallet.softCoin + result.totalWin });
            
            const winType = result.isJackpot ? 'big' : (result.totalWin > bet * 5 ? 'medium' : 'small');
            soundManager.playWin(winType);

            if (result.isJackpot) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#FFA500', '#00FFFF']
                });
            }
        }

        // Transition back to IDLE after a moment so user can see the result
        // or let them click spin immediately.
        // We'll leave it in RESULT state until they spin again, or if autoplay is on, the effect above handles it.
        const resetDelay = setTimeout(() => {
            setStatus('IDLE');
        }, result.totalWin > 0 ? 2000 : 500);
        
        return () => clearTimeout(resetDelay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reelsStopped, result, machine.reels, status]);

  const handleReelStop = () => {
    setReelsStopped(prev => prev + 1);
  };

  const getSymbolDef = (id: string) => machine.symbols.find(s => s.id === id);

  // Calculate coordinates for SVG
  const cellW = gridDim.w / machine.reels;
  const cellH = MACHINE_ROW_HEIGHT;

  // Show overlay only when fully stopped and we have a win
  const showWinOverlay = (status === 'RESULT' || status === 'IDLE') && result && result.totalWin > 0;

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} /> Back to Lobby
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                {machine.name}
            </h2>
            <div className="w-24"></div> 
        </div>

        {/* Machine Display */}
        <div className="relative glass-panel rounded-3xl p-1 md:p-4 mb-6 shadow-2xl border-t border-white/20">
            
            {/* Messages Overlay */}
            <AnimatePresence>
                {status === 'SPINNING' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute -top-12 left-0 right-0 text-center"
                    >
                        <span className="text-cyan-400 font-bold tracking-widest text-sm uppercase animate-pulse">Good Luck...</span>
                    </motion.div>
                )}
                {showWinOverlay && (
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="absolute -top-16 left-0 right-0 flex justify-center"
                    >
                        <div className="bg-yellow-500/20 backdrop-blur border border-yellow-500/50 px-6 py-2 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                            <Trophy className="text-yellow-400" size={24} />
                            <span className="text-2xl font-black text-white drop-shadow-md">
                                WIN {winDisplay}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Jackpot Overlay */}
            {result?.isJackpot && showWinOverlay && (
                 <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
                     <div className="bg-black/80 backdrop-blur-md px-12 py-8 rounded-3xl animate-bounce border-2 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.5)]">
                         <span className="text-6xl font-black text-yellow-400 drop-shadow-lg tracking-tighter">
                            JACKPOT!
                         </span>
                         <div className="text-3xl text-white text-center mt-2 font-mono">
                            {winDisplay}
                         </div>
                     </div>
                 </div>
            )}

            <div 
                ref={gridRef}
                className="grid gap-1 bg-black/40 rounded-xl overflow-hidden reel-mask relative"
                style={{ 
                    gridTemplateColumns: `repeat(${machine.reels}, 1fr)`,
                    height: MACHINE_ROW_HEIGHT * machine.rows
                }}
            >
                {/* Reels */}
                {Array.from({ length: machine.reels }).map((_, i) => (
                    <Reel 
                        key={i}
                        reelIndex={i}
                        symbols={machine.symbols}
                        finalSymbolId={null}
                        gridColumn={result ? result.grid[i] : []}
                        spinning={status === 'SPINNING'} // Only spin when status is specifically SPINNING
                        delay={i * 0.2}
                        onStop={handleReelStop}
                        machineRowHeight={MACHINE_ROW_HEIGHT}
                        visibleRows={machine.rows}
                    />
                ))}

                {/* Winning Payline Overlay */}
                <AnimatePresence>
                    {showWinOverlay && gridDim.w > 0 && result.winningLines.map((line, i) => {
                        const symbolDef = getSymbolDef(line.symbolId);
                        const color = symbolDef?.color || '#FFD700';

                        // Build path data
                        const pathD = line.coordinates.reduce((acc, coord, idx) => {
                            const x = coord.col * cellW + cellW / 2;
                            const y = coord.row * cellH + cellH / 2;
                            return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                        }, '');

                        return (
                            <div key={`win-line-${i}`} className="absolute inset-0 z-30 pointer-events-none">
                                <svg className="w-full h-full overflow-visible">
                                    <defs>
                                        <filter id={`glow-${i}`}>
                                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                            <feMerge>
                                                <feMergeNode in="coloredBlur"/>
                                                <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    
                                    {/* Connection Line */}
                                    <motion.path
                                        d={pathD}
                                        stroke={color}
                                        strokeWidth="6"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        filter={`url(#glow-${i})`}
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    />
                                    
                                    {/* Highlight Boxes for Symbols */}
                                    {line.coordinates.map((coord, idx) => (
                                        <motion.rect
                                            key={`${i}-${idx}`}
                                            x={coord.col * cellW + 4} // +4 for gap adjustment roughly
                                            y={coord.row * cellH}
                                            width={cellW - 8}
                                            height={cellH}
                                            rx="12"
                                            fill="none"
                                            stroke={color}
                                            strokeWidth="4"
                                            filter={`url(#glow-${i})`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ 
                                                opacity: [0, 1, 0.5, 1], 
                                                scale: 1,
                                                strokeWidth: [4, 6, 4]
                                            }}
                                            transition={{ 
                                                duration: 2, // Highlight lasts 2s
                                                repeat: Infinity,
                                                repeatType: "reverse"
                                            }}
                                        />
                                    ))}
                                </svg>
                            </div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>

        {/* Controls */}
        <div className="glass-panel rounded-2xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Bet Control */}
            <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Bet Amount</label>
                <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-1">
                    <button 
                        onClick={() => setBet(Math.max(machine.minBet, bet - machine.minBet))}
                        className="p-2 hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                        disabled={status === 'SPINNING' || status === 'STOPPING'}
                    >
                        -
                    </button>
                    <span className="flex-1 text-center font-mono text-lg font-bold text-cyan-300">
                        {bet}
                    </span>
                    <button 
                         onClick={() => setBet(Math.min(machine.maxBet, bet + machine.minBet))}
                         className="p-2 hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                         disabled={status === 'SPINNING' || status === 'STOPPING'}
                    >
                        +
                    </button>
                </div>
                <button 
                    onClick={() => setBet(machine.maxBet)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 self-start"
                    disabled={status === 'SPINNING' || status === 'STOPPING'}
                >
                    <Maximize2 size={12} /> MAX BET
                </button>
            </div>

            {/* Main Action Button */}
            <div className="flex justify-center">
                <button
                    onClick={() => {
                        if (status === 'SPINNING') {
                            triggerStop();
                        } else if (status === 'IDLE' || status === 'RESULT') {
                            handleSpin();
                        }
                    }}
                    disabled={status === 'STOPPING'}
                    className={`
                        w-24 h-24 rounded-full border-4 border-white/10 shadow-[0_0_30px_rgba(6,182,212,0.3)]
                        flex items-center justify-center relative overflow-hidden group transition-all duration-200
                        ${status === 'STOPPING' 
                            ? 'scale-95 opacity-80 cursor-not-allowed bg-slate-800' 
                            : status === 'SPINNING' 
                                ? 'bg-rose-500 hover:bg-rose-600 border-rose-400/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
                                : 'hover:scale-105 active:scale-95 bg-gradient-to-br from-cyan-500 to-blue-600'
                        }
                    `}
                >
                    <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {status === 'SPINNING' ? (
                        <div className="flex flex-col items-center animate-pulse">
                            <Square size={32} fill="currentColor" className="text-white mb-1" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">STOP</span>
                        </div>
                    ) : (
                        <RefreshCw 
                            size={40} 
                            className={`text-white drop-shadow-md ${status === 'STOPPING' ? 'animate-spin' : ''}`} 
                        />
                    )}
                </button>
            </div>

            {/* Auto & Info */}
            <div className="flex flex-col gap-2 items-end">
                 <div className="flex gap-4">
                     <button 
                        onClick={() => setAutoPlay(!autoPlay)}
                        disabled={status === 'SPINNING' || status === 'STOPPING'}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm border transition-all
                            ${autoPlay 
                                ? 'bg-green-500/20 border-green-500/50 text-green-300 animate-pulse' 
                                : 'bg-slate-800/50 border-white/10 hover:bg-white/5 text-slate-300'}
                        `}
                    >
                        <RotateCcw size={16} />
                        AUTO {autoPlay ? 'ON' : 'OFF'}
                     </button>
                 </div>
                 <div className="mt-2 text-right">
                    <p className="text-xs text-slate-400">Last Win</p>
                    <motion.p 
                        key={winDisplay}
                        initial={{ scale: 1 }}
                        animate={{ scale: winDisplay > 0 ? [1, 1.2, 1] : 1 }}
                        className="text-xl font-bold text-yellow-400 font-mono"
                    >
                        {winDisplay}
                    </motion.p>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default SlotGame;
