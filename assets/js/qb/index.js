import { blueprintDef } from "./build.js?v=76";
import v1p1 from "./chapters/v1p1.js?v=76";
import v1p2 from "./chapters/v1p2.js?v=76";
import v1p3 from "./chapters/v1p3.js?v=76";
import v2p1 from "./chapters/v2p1.js?v=76";
import v2p2 from "./chapters/v2p2.js?v=76";

// Concatenate all 48 Official Cert Guide chapters (Vol 1 Ch 1-29, Vol 2 Ch 1-19) in fixed order so ID sequences remain stable.
const rawBank = [...v1p1, ...v1p2, ...v1p3, ...v2p1, ...v2p2];

// Populate exact question count into blueprint definition
export const blueprint = blueprintDef.map((d) => {
  const count = rawBank.filter((q) => q.domain === d.name).length;
  return {
    ...d,
    count
  };
});

export const questionBank = rawBank;

/**
 * Generates an instance of the question bank shuffled with the provided PRNG.
 * @param {Function} [rnd=Math.random]
 * @returns {Array} Shuffled shallow copy of questionBank
 */
export function generateBank(rnd = Math.random) {
  const bank = [...questionBank];
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]];
  }
  return bank;
}

export default questionBank;
