import { blueprintDef } from "./build.js?v=74";
import nf from "./nf.js?v=74";
import na from "./na.js?v=74";
import ipc from "./ipc.js?v=74";
import ips from "./ips.js?v=74";
import sec from "./sec.js?v=74";
import auto from "./auto.js?v=74";

// Concatenate all domains in fixed blueprint order so ID sequences remain stable.
const rawBank = [...nf, ...na, ...ipc, ...ips, ...sec, ...auto];

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
