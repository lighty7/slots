import { MachineConfig, SpinResult, SymbolId } from '../types';

/**
 * Simulates server-side logic for spinning the slot machine.
 * Generates a random grid based on weights (simulated via array distribution here)
 * and calculates payouts.
 */
export const GameEngine = {
  spin: async (machine: MachineConfig, betAmount: number): Promise<SpinResult> => {
    // 1. Generate Grid
    const grid: SymbolId[][] = []; // Cols x Rows
    
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
        // Logic: Usually need at least 3 matches, or 2 for high value symbols.
        // For this demo, let's say 3 matches minimum for 5-reel, 2 for 3-reel if it's high value.
        const minMatches = machine.reels === 3 ? 2 : 3;
        
        if (matchCount >= minMatches) {
            const symbolDef = machine.symbols.find(s => s.id === firstSymbolId);
            if (symbolDef) {
                // Formula: BetPerLine * SymbolValue * (Factor based on match count)
                // BetPerLine estimate: betAmount / paylines.length (simplified for demo: just use betAmount * multiplier)
                
                let countMultiplier = 1;
                if (matchCount === 4) countMultiplier = 5;
                if (matchCount === 5) countMultiplier = 20;
                
                // For the demo, we scale the win relative to the TOTAL bet to make it satisfying
                const winValue = (symbolDef.value * (betAmount / 10)) * countMultiplier * (matchCount / machine.reels);
                
                const winAmount = Math.floor(winValue);
                
                if (winAmount > 0) {
                    totalWin += winAmount;
                    winningLines.push({
                        lineIndex: lineIdx,
                        symbolId: firstSymbolId,
                        count: matchCount,
                        amount: winAmount,
                        coordinates: matchedCoords
                    });
                }
            }
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