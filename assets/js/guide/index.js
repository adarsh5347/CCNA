import v1p1 from "./v1p1.js?v=75";
import v1p2 from "./v1p2.js?v=75";
import v1p3 from "./v1p3.js?v=75";
import v2p1 from "./v2p1.js?v=75";
import v2p2 from "./v2p2.js?v=75";

export const studyGuide = [...v1p1, ...v1p2, ...v1p3, ...v2p1, ...v2p2];

export const studyGuideById = Object.fromEntries(studyGuide.map((ch) => [ch.id, ch]));

export function getChapterById(id) {
  return studyGuideById[id] || null;
}
