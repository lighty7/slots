import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { SymbolDef, SymbolId } from '../types';
import { soundManager } from '../services/SoundManager';
import clsx from 'clsx';

interface ReelProps {
  reelIndex: number;
  symbols: SymbolDef[];
  finalSymbolId: SymbolId | null; // The symbol to land on (center)
  spinning: boolean;
  delay: number; // Stagger delay
  onStop: () => void;
  machineRowHeight: number; // Height of one row in pixels
  visibleRows: number;
  gridColumn: SymbolId[]; // The actual result column for this reel
}

const Reel: React.FC<ReelProps> = ({ 
  reelIndex, 
  symbols, 
  finalSymbolId, 
  spinning, 
  delay, 
  onStop,
  machineRowHeight,
  visibleRows,
  gridColumn
}) => {
  const controls = useAnimation();
  const [renderList, setRenderList] = useState<SymbolDef[]>([]);

  // Initialize random render list
  useEffect(() => {
    const initialList = Array.from({ length: visibleRows + 4 }).map(() => 
      symbols[Math.floor(Math.random() * symbols.length)]
    );
    setRenderList(initialList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const spinSequence = async () => {
      if (spinning) {
        // START SPINNING
        // 1. Wind up (move up slightly)
        await controls.start({
            y: -20,
            transition: { duration: 0.2, ease: "easeIn" }
        });

        // 2. Infinite spin (blur effect handled via CSS class mostly, but motion handles position)
        // We simulate spinning by resetting Y repeatedly or just moving extremely fast
        controls.start({
            y: [0, -machineRowHeight * symbols.length],
            transition: { 
                repeat: Infinity, 
                duration: 0.2 + (Math.random() * 0.1), // Slight variance
                ease: "linear" 
            }
        });
      } else {
        // STOP SPINNING
        // Wait for delay
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
        
        // Prepare landing strip:
        // We need the `gridColumn` (the result) to be in the visible area.
        // We construct a new list: [Random, ...Result, Random]
        const resultSymbols = gridColumn.map(id => symbols.find(s => s.id === id)!);
        
        // We just swap the render list instantly to the result set padded with randoms
        // In a real canvas app we'd stitch them, but in DOM, we can cheat during the blur.
        setRenderList([
            ...Array.from({length: 2}).map(() => symbols[Math.floor(Math.random() * symbols.length)]),
            ...resultSymbols,
            ...Array.from({length: 2}).map(() => symbols[Math.floor(Math.random() * symbols.length)]),
        ]);

        soundManager.playReelStop();

        // Animate to the specific position where `resultSymbols` are centered
        // Assuming visibleRows is typically 3. The list has 2 padding top. 
        // We want to land such that index 2 is at the top of the view.
        // The view height is visibleRows * machineRowHeight.
        // We essentially animate from "blurred movement" to "snapped position".
        
        // Hard stop animation
        await controls.start({
            y: [-machineRowHeight * 2 - 50, -machineRowHeight * 2], // Overshoot
            transition: { 
                type: "spring",
                stiffness: 300,
                damping: 15,
                duration: 0.5 
            }
        });
        
        onStop();
      }
    };

    spinSequence();
  }, [spinning, delay, controls, machineRowHeight, gridColumn, symbols, onStop]);


  return (
    <div 
        className="relative overflow-hidden border-r border-white/10 last:border-r-0 bg-slate-900/40"
        style={{ height: machineRowHeight * visibleRows }}
    >
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-950/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/80 to-transparent z-10 pointer-events-none" />
        
        <motion.div
            animate={controls}
            className={clsx("flex flex-col items-center", spinning && "blur-[2px]")}
        >
            {renderList.map((sym, i) => (
                <div 
                    key={`${sym.id}-${i}`} 
                    className="flex items-center justify-center w-full"
                    style={{ height: machineRowHeight }}
                >
                    <div className={clsx(
                        "relative flex items-center justify-center w-3/4 h-3/4 rounded-xl shadow-inner",
                        "bg-white/5 backdrop-blur-sm border border-white/5"
                    )}>
                       <span className="text-4xl md:text-6xl filter drop-shadow-lg transform scale-100 hover:scale-110 transition-transform duration-300">
                          {sym.icon}
                       </span>
                    </div>
                </div>
            ))}
        </motion.div>
    </div>
  );
};

export default Reel;