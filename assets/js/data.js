/**
 * NetOps Command - CCNA 200-301 Official Question Bank
 * Rebuilt to official Cisco CCNA 200-301 blueprint specifications with
 * gradual cognitive progression: Easy (recall/identify) -> Medium (apply/configure) -> Hard (troubleshoot/analyze).
 */
import { blueprintDef } from "./qb/build.js?v=78";
import v1p1 from "./qb/chapters/v1p1.js?v=78";
import v1p2 from "./qb/chapters/v1p2.js?v=78";
import v1p3 from "./qb/chapters/v1p3.js?v=78";
import v2p1 from "./qb/chapters/v2p1.js?v=78";
import v2p2 from "./qb/chapters/v2p2.js?v=78";

const rawBank = [...v1p1, ...v1p2, ...v1p3, ...v2p1, ...v2p2];

export const blueprint = blueprintDef.map((d) => {
  const count = rawBank.filter((q) => q.domain === d.name).length;
  return {
    ...d,
    count
  };
});

export const questionBank = rawBank;

export function generateBank(rnd = Math.random) {
  const bank = [...questionBank];
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]];
  }
  return bank;
}

export default questionBank;
