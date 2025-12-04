
import { MachineConfig, SpinResult, SymbolId } from '../types';

/**
 * Simulates server-side logic for spinning the slot machine.
 * Generates grid based on either weighted randomness OR explicit reel strips.
 * Calculates payouts based on either multiplier formulas OR explicit payout tables.
 */
export const GameEngine = {
  spin: async (machine: MachineConfig, betAmount: number): Promise<SpinResult> => {
    // 1. Generate Grid
    const grid: SymbolId[][] = []; // Cols x Rows
    
    if (machine.reelStrips) {
        // --- Option A: Explicit Reel Strips ---
        // Simulates actual mechanical stops.
        for (let c = 0; c < machine.reels; c++) {
            const strip = machine.reelStrips[c] || machine.reelStrips[0]; // Fallback to first if index invalid
            const stripLength = strip.length;
            
            // Random stop index on the strip
            const stopIndex = Math.floor(Math.random() * stripLength);
            
            const col: SymbolId[] = [];
            for (let r = 0; r < machine.rows; r++) {
                // Wrap around the strip using modulo
                const symIndex = (stopIndex + r) % stripLength;
                col.push(strip[symIndex]);
            }
            grid.push(col);
        }
    } else {
        // --- Option B: Procedural Weighted Generation ---
        // Used for machines without explicit strips defined.
        
        // Create a weighted pool based on symbol value (Inverse relationship: High value = Rare)
        const weightedPool: SymbolId[] = [];
        machine.symbols.forEach(sym => {
          // Simple weight formula: 200 / value. 
          // Example: Value 2 (Cherry) -> weight 100. Value 100 (Diamond) -> weight 2.
          const weight = Math.max(1, Math.floor(200 / sym.value));
          for (let i = 0; i < weight; i++) {
            weightedPool.push(sym.id);
          }
        });

        for (let c = 0; c < machine.reels; c++) {
          const col: SymbolId[] = [];
          for (let r = 0; r < machine.rows; r++) {
            const randomIndex = Math.floor(Math.random() * weightedPool.length);
            col.push(weightedPool[randomIndex]);
          }
          grid.push(col);
        }
    }

    // 2. Calculate Payouts
    const winningLines: SpinResult['winningLines'] = [];
    let totalWin = 0;

    machine.paylines.forEach((line, lineIdx) => {
        // Line is array of [col, row]
        if (line.length > machine.reels) return; // Safety check

        const firstSymbolPos = line[0];
        const firstSymbolId = grid[firstSymbolPos[0]][firstSymbolPos[1]];
        
        let matchCount = 1;
        const matchedCoords = [{col: firstSymbolPos[0], row: firstSymbolPos[1]}];

        for (let i = 1; i < line.length; i++) {
            const pos = line[i];
            const currentSymbolId = grid[pos[0]][pos[1]];
            
            if (currentSymbolId === firstSymbolId || currentSymbolId === 'WILD') {
                matchCount++;
                matchedCoords.push({col: pos[0], row: pos[1]});
            } else {
                break;
            }
        }

        // Determine if this is a win
        let winAmount = 0;
        const symbolDef = machine.symbols.find(s => s.id === firstSymbolId);

        if (symbolDef) {
            if (machine.payouts && machine.payouts[firstSymbolId]) {
                // --- Option A: Explicit Payout Table ---
                // Looks up exact win amount for the match count.
                // Scales by (Bet / MinBet) to support varying bet sizes.
                const basePayout = machine.payouts[firstSymbolId][matchCount] || 0;
                
                if (basePayout > 0) {
                     // Scaling factor: if min bet is 1 and user bets 10, win 10x the table value.
                     const betRatio = betAmount / machine.minBet;
                     winAmount = basePayout * betRatio;
                }

            } else {
                // --- Option B: Generic Multiplier Formula ---
                const minMatches = machine.reels === 3 ? 2 : 3;
                if (matchCount >= minMatches) {
                    let countMultiplier = 1;
                    if (matchCount === 4) countMultiplier = 5;
                    if (matchCount === 5) countMultiplier = 20;
                    
                    const winValue = (symbolDef.value * (betAmount / 10)) * countMultiplier * (matchCount / machine.reels);
                    winAmount = Math.floor(winValue);
                }
            }
        }
                
        if (winAmount > 0) {
            totalWin += winAmount;
            winningLines.push({
                lineIndex: lineIdx,
                symbolId: firstSymbolId,
                count: matchCount,
                amount: Math.floor(winAmount),
                coordinates: matchedCoords
            });
        }
    });

    const isJackpot = totalWin > (betAmount * 50);

    // Artificial delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
        grid,
        winningLines,
        totalWin,
        isJackpot
    };
  }
};
