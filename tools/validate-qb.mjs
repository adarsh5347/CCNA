#!/usr/bin/env node
/**
 * Content validator for the question bank and study-guide data.
 *   node tools/validate-qb.mjs qb    assets/js/qb/chapters/v1c08.js [--min 14]
 *   node tools/validate-qb.mjs guide assets/js/guide/v1c08.js
 * Exits 1 when any error is found. Warnings do not fail the run.
 */
import path from "path";
import { pathToFileURL } from "url";
import { blueprintDef } from "../assets/js/qb/build.js";

const [mode, file, ...rest] = process.argv.slice(2);
const minIdx = rest.indexOf("--min");
const MIN = minIdx >= 0 ? +rest[minIdx + 1] : 12;
if (!mode || !file) { console.error("usage: validate-qb.mjs <qb|guide> <file> [--min N]"); process.exit(2); }

const mod = await import(pathToFileURL(path.resolve(file)).href);
const data = mod.default;
const errors = [], warns = [];
const err = (m) => errors.push(m), warn = (m) => warns.push(m);
if (!Array.isArray(data) || !data.length) { console.error("default export must be a non-empty array"); process.exit(1); }

const topicsOf = Object.fromEntries(blueprintDef.map((d) => [d.name, new Set(d.topics)]));
const CH = /^v[12]c\d\d$/;

if (mode === "qb") {
  const stems = new Map();
  const perChapter = {};
  let singles = 0, longest = 0;
  for (const q of data) {
    const t = `#${q.id} ${q.chapter}/${q.topic}`;
    for (const f of ["id", "domain", "topic", "type", "difficulty", "text", "expl", "chapter"]) if (q[f] == null || q[f] === "") err(`${t}: missing ${f}`);
    if (!topicsOf[q.domain]) { err(`${t}: unknown domain "${q.domain}"`); continue; }
    if (!topicsOf[q.domain].has(q.topic)) err(`${t}: topic "${q.topic}" not in domain "${q.domain}" (allowed: ${[...topicsOf[q.domain]].join(", ")})`);
    if (!CH.test(q.chapter || "")) err(`${t}: bad chapter id`);
    if (!["Easy", "Medium", "Hard"].includes(q.difficulty)) err(`${t}: bad difficulty`);
    const pc = (perChapter[q.chapter] ||= { Easy: 0, Medium: 0, Hard: 0, n: 0 });
    pc[q.difficulty]++; pc.n++;
    const key = (q.text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (stems.has(key)) err(`${t}: duplicate stem of #${stems.get(key)}`); else stems.set(key, q.id);
    if (/^a (systems|network) administrator is (configuring|working|setting)/i.test(q.text || "")) err(`${t}: filler stem`);
    if ((q.text || "").length < 25) err(`${t}: stem too short`);
    const e = q.expl || {};
    if (!e.why || e.why.length < 40) err(`${t}: expl.why missing/too short`);
    if (!e.tip || e.tip.length < 10) err(`${t}: expl.tip missing/too short`);
    if (!Array.isArray(e.commands)) err(`${t}: expl.commands must be an array`);
    if (q.type === "single" || q.type === "scenario" || q.type === "multi") {
      const o = q.options || [];
      if (o.length < 4 || o.length > 6) err(`${t}: needs 4-6 options`);
      if (new Set(o.map((x) => x.toLowerCase())).size !== o.length) err(`${t}: duplicate options`);
      if (!Array.isArray(q.correct) || q.correct.some((i) => !(i >= 0 && i < o.length))) err(`${t}: bad correct index`);
      if (q.type === "multi" && !(q.correct.length >= 2)) err(`${t}: multi needs >=2 correct`);
      if (q.type !== "multi" && q.correct.length !== 1) err(`${t}: single needs exactly 1 correct`);
      if ((e.wrong || []).length !== o.length - q.correct.length) err(`${t}: expl.wrong length ${(e.wrong || []).length} != ${o.length - q.correct.length}`);
      (e.wrong || []).forEach((w) => { if (w.replace(/^[A-F]\.\s*/, "").length < 15) err(`${t}: wrong-option reason too short: "${w}"`); });
      const reasons = (e.wrong || []).map((w) => w.replace(/^[A-F]\.\s*/, ""));
      if (new Set(reasons).size !== reasons.length) err(`${t}: identical wrong-option reasons`);
      if (q.type === "single" || q.type === "scenario") {
        singles++;
        const c = o[q.correct[0]].length;
        if (o.every((x, i) => i === q.correct[0] || x.length < c)) longest++;
      }
    } else if (q.type === "dragdrop") {
      if (!Array.isArray(q.order) || q.order.length < 3 || q.order.length > 7) err(`${t}: dragdrop needs 3-7 steps`);
      else if (new Set(q.order).size !== q.order.length) err(`${t}: duplicate steps`);
    } else if (q.type === "matching") {
      if (!Array.isArray(q.pairs) || q.pairs.length < 3 || q.pairs.length > 6) err(`${t}: matching needs 3-6 pairs`);
      else if (new Set(q.pairs.map((p) => p[1])).size !== q.pairs.length) err(`${t}: duplicate match targets`);
    } else err(`${t}: unknown type ${q.type}`);
  }
  // near-duplicate stems
  const words = data.map((q) => new Set((q.text || "").toLowerCase().split(/\W+/).filter((w) => w.length > 3)));
  for (let i = 0; i < data.length; i++) for (let j = i + 1; j < data.length; j++) {
    let inter = 0; for (const w of words[i]) if (words[j].has(w)) inter++;
    const u = words[i].size + words[j].size - inter;
    if (u > 5 && inter / u > 0.8) warn(`near-duplicate stems #${data[i].id} / #${data[j].id}`);
  }
  const rate = singles ? longest / singles : 0;
  if (singles >= 8 && rate > 0.35) err(`correct answer is strictly the longest option in ${(rate * 100).toFixed(0)}% of single-choice questions (limit 35%). Lengthen/enrich distractors or shorten correct answers so lengths are comparable.`);
  for (const [c, pc] of Object.entries(perChapter)) {
    if (pc.n < MIN) err(`chapter ${c}: only ${pc.n} questions (minimum ${MIN})`);
    if (pc.Easy < 2 || pc.Hard < 2) err(`chapter ${c}: needs at least 2 Easy and 2 Hard (has ${pc.Easy}E/${pc.Medium}M/${pc.Hard}H)`);
  }
  console.log(`questions: ${data.length}; per chapter:`, JSON.stringify(perChapter));
  console.log(`strictly-longest-correct rate: ${(rate * 100).toFixed(0)}% of ${singles}`);
} else if (mode === "guide") {
  for (const c of data) {
    const t = c.id || "?";
    if (!CH.test(c.id || "")) err(`${t}: bad id`);
    for (const f of ["title", "domain", "summary", "pages"]) if (!c[f]) err(`${t}: missing ${f}`);
    if (!topicsOf[c.domain]) err(`${t}: unknown domain`);
    const need = { examTopics: 1, keyPoints: 8, keyTerms: 8, commands: 0, tips: 3 };
    for (const [k, n] of Object.entries(need)) if (!Array.isArray(c[k]) || c[k].length < n) err(`${t}: ${k} needs >= ${n} items`);
    (c.keyTerms || []).forEach((k) => { if (!k.term || !k.def || k.def.length < 15) err(`${t}: weak key term ${JSON.stringify(k).slice(0, 60)}`); });
    (c.commands || []).forEach((k) => { if (!k.cmd || !k.desc) err(`${t}: bad command entry`); });
    (c.keyPoints || []).forEach((k) => { if (typeof k !== "string" || k.length < 30) err(`${t}: keyPoint too short`); });
    if ((c.summary || "").length < 120) err(`${t}: summary too short`);
    if (!Array.isArray(c.commands) || (c.commands.length === 0)) warn(`${t}: no commands (ok only for concept-only chapters)`);
  }
  console.log(`guide chapters: ${data.length}`);
}
warns.slice(0, 15).forEach((w) => console.log("WARN", w));
errors.slice(0, 60).forEach((e) => console.log("ERROR", e));
console.log(errors.length ? `FAILED: ${errors.length} error(s)` : "PASSED");
process.exit(errors.length ? 1 : 0);
