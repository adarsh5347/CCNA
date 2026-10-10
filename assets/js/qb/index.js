import { blueprintDef } from "./build.js";
import nf from "./nf.js";
import na from "./na.js";
import ipc from "./ipc.js";
import ips from "./ips.js";
import sec from "./sec.js";
import auto from "./auto.js";

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
