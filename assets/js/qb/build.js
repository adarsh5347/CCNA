/**
 * Question bank builder.
 *
 * Questions are authored compactly per domain (see nf.js, na.js ...) and expanded here into the
 * schema consumed by quiz-engine.js. Option order is shuffled with a seeded PRNG so the correct
 * answer position is unbiased but stable between page loads.
 *
 * Difficulty ladder used across the whole bank (this drives the gradual progression):
 *   Easy   = recall a definition / identify a feature
 *   Medium = apply a rule, read a short output, pick the right command
 *   Hard   = multi-step reasoning, troubleshooting from CLI output, compare close alternatives
 */

const LETTERS = "ABCDEFGH";

function seeded(seed) {
  let s = (seed * 2654435761) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(arr, rnd) {
  const a = arr.map((v, i) => ({ v, i }));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FREQ = { Easy: "High", Medium: "Medium", Hard: "Low" };

let counter = 0;

export function mk(domain, weight) {
  const base = (topic, diff, text, extra) => ({
    domain,
    topic,
    difficulty: diff,
    examWeight: weight + "%",
    frequency: FREQ[diff],
    text,
    ...(extra && extra.cli ? { cli: extra.cli } : {}),
    ...(extra && extra.topology ? { topology: extra.topology } : {})
  });

  // Single choice. wrongs = [[optionText, whyWrong] x3]
  const s = (topic, diff, text, right, wrongs, why, tip, cmds = [], extra = null) => {
    const id = ++counter;
    const rnd = seeded(id);
    const opts = [{ t: right, r: null }, ...wrongs.map(([t, r]) => ({ t, r }))];
    const order = shuffled(opts, rnd);
    const correctIdx = order.findIndex((o) => o.i === 0);
    return {
      ...base(topic, diff, text, extra),
      id,
      type: extra ? "scenario" : "single",
      options: order.map((o) => o.v.t),
      correct: [correctIdx],
      expl: {
        correct: LETTERS[correctIdx],
        why,
        wrong: order
          .map((o, i) => (o.i === 0 ? null : `${LETTERS[i]}. ${o.v.r}`))
          .filter(Boolean),
        tip,
        commands: cmds
      }
    };
  };

  // Choose-two. rights = [t1, t2]; wrongs = [[t, why] x3]
  const m = (topic, diff, text, rights, wrongs, why, tip, cmds = [], extra = null) => {
    const id = ++counter;
    const rnd = seeded(id);
    const opts = [
      ...rights.map((t) => ({ t, r: null })),
      ...wrongs.map(([t, r]) => ({ t, r }))
    ];
    const order = shuffled(opts, rnd);
    const correct = order.map((o, i) => (o.i < rights.length ? i : -1)).filter((i) => i >= 0);
    return {
      ...base(topic, diff, text + " (Choose two.)", extra),
      id,
      type: "multi",
      options: order.map((o) => o.v.t),
      correct,
      expl: {
        correct: correct.map((i) => LETTERS[i]).join(", "),
        why,
        wrong: order
          .map((o, i) => (o.i < rights.length ? null : `${LETTERS[i]}. ${o.v.r}`))
          .filter(Boolean),
        tip,
        commands: cmds
      }
    };
  };

  // Ordering. order = steps in correct sequence
  const d = (topic, diff, text, order, why, tip, cmds = []) => {
    const id = ++counter;
    return {
      ...base(topic, diff, text),
      id,
      type: "dragdrop",
      order,
      expl: {
        correct: "Correct order",
        why,
        wrong: ["Any other sequence breaks the dependency between the steps."],
        tip,
        commands: cmds
      }
    };
  };

  // Matching. pairs = [[left, right] ...]
  const t = (topic, diff, text, pairs, why, tip, cmds = []) => {
    const id = ++counter;
    return {
      ...base(topic, diff, text),
      id,
      type: "matching",
      pairs,
      expl: {
        correct: "All pairs matched",
        why,
        wrong: ["Each item has exactly one correct partner; re-check the pair you were unsure of."],
        tip,
        commands: cmds
      }
    };
  };

  return { s, m, d, t };
}

// Blueprint: weights mirror the CCNA 200-301 exam objectives.
export const blueprintDef = [
  { name: "Network Fundamentals", weight: 20, topics: ["OSI/TCP-IP", "Cabling", "IPv4", "Subnetting", "IPv6", "TCP/UDP", "Wireless", "Virtualization", "Switching"] },
  { name: "Network Access", weight: 20, topics: ["VLANs", "Trunking", "DTP/VTP", "CDP/LLDP", "STP", "EtherChannel", "WLAN"] },
  { name: "IP Connectivity", weight: 25, topics: ["Routing table", "Static routes", "OSPF", "FHRP"] },
  { name: "IP Services", weight: 10, topics: ["NAT", "NTP", "DHCP", "DNS", "SNMP", "Syslog", "QoS", "SSH/TFTP"] },
  { name: "Security Fundamentals", weight: 15, topics: ["Threats", "ACLs", "Port security", "DHCP snooping/DAI", "AAA", "VPN", "Wireless security"] },
  { name: "Automation and Programmability", weight: 10, topics: ["SDN", "Controllers", "REST/JSON", "Config management"] }
];
