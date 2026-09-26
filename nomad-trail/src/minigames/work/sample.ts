import type { Puzzle } from '../../core/types';

/** Fallback puzzle when the payload carries none (harness, quick play before the bank exists). */
export const SAMPLE_PUZZLE: Puzzle = {
  id: 'constant-product', title: 'The pool that never empties',
  prompt: 'A pool holds 100 ETH and 200,000 USDC under x*y=k. A trader buys 10 ETH. Ignoring fees, how much USDC do they pay?',
  kind: 'choice', choices: ['20,000', '22,222', '18,182', '25,000'], answer: 1,
  hint: 'k must stay the same after the trade. Solve for the new USDC balance with 90 ETH left.',
  explain: 'k = 20,000,000. With 90 ETH, USDC must be 222,222. The trader paid 22,222.', art: 'pool',
};
export const SAMPLE_NUMBER_PUZZLE: Puzzle = {
  id: 'fee-tier', title: 'Thirty basis points',
  prompt: 'A swap of 5,000 USDC goes through a 0.30% fee pool. How many USDC does the pool keep as the fee?',
  kind: 'number', answer: 15,
  hint: '0.30% is 30 basis points: 30 / 10,000 of the input.',
  explain: '5,000 × 0.003 = 15 USDC stays with the liquidity providers.', art: 'chart',
};
/** Puzzle bank access: the real bank (src/data/puzzles.json) when present, else the two samples. */
export function puzzleById(bank: Puzzle[] | undefined, id?: string | null): Puzzle {
  const all = bank && bank.length ? bank : [SAMPLE_PUZZLE, SAMPLE_NUMBER_PUZZLE];
  return all.find(p => p.id === id) ?? all[0];
}
