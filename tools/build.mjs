import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuildBuild, transform } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const STATIC_ROOT_FILES = ["index.html", "ccna.html", "manifest.json", "sw.js", "robots.txt", "sitemap.xml"];
const INLINE_CSS_START_MARKER = "<!-- INLINE_CSS_START -->";
const INLINE_CSS_END_MARKER = "<!-- INLINE_CSS_END -->";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

function countOccurrences(str, substr) {
  let count = 0;
  let pos = 0;
  while ((pos = str.indexOf(substr, pos)) !== -1) {
    count++;
    pos += substr.length;
  }
  return count;
}

export function inlineCssIntoHtml(html, minifiedStylesCss) {
  if (!minifiedStylesCss || typeof minifiedStylesCss !== "string" || !minifiedStylesCss.trim()) {
    throw new Error("CSS inlining failed: bundled minifiedStylesCss is empty.");
  }

  const startCount = countOccurrences(html, INLINE_CSS_START_MARKER);
  const endCount = countOccurrences(html, INLINE_CSS_END_MARKER);

  if (startCount !== 1) {
    throw new Error(
      `CSS inlining failed: expected exactly 1 ${INLINE_CSS_START_MARKER} marker in index.html, found ${startCount}.`
    );
  }
  if (endCount !== 1) {
    throw new Error(
      `CSS inlining failed: expected exactly 1 ${INLINE_CSS_END_MARKER} marker in index.html, found ${endCount}.`
    );
  }

  const startIdx = html.indexOf(INLINE_CSS_START_MARKER);
  const endIdx = html.indexOf(INLINE_CSS_END_MARKER);

  if (startIdx >= endIdx) {
    throw new Error(
      "CSS inlining failed: INLINE_CSS_END marker appears before INLINE_CSS_START marker in index.html."
    );
  }

  const replacement = `<style id="critical-css">${minifiedStylesCss}</style>`;
  const result =
    html.slice(0, startIdx) +
    replacement +
    html.slice(endIdx + INLINE_CSS_END_MARKER.length);

  if (result.includes("assets/css/styles.css")) {
    throw new Error(
      "CSS inlining failed: residual assets/css/styles.css reference remained in dist/index.html."
    );
  }

  return result;
}

async function build() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
  }
  ensureDir(DIST);

  // 1. Process all files in assets/ first so bundled & minified CSS is ready for inlining
  const assetsSrcDir = path.join(ROOT, "assets");
  const allAssetFiles = getAllFiles(assetsSrcDir);

  let totalRawBytes = 0;
  let totalMinBytes = 0;
  let minifiedStylesCss = "";

  // Calculate total raw bytes across all CSS partials imported by assets/css/styles.css
  const cssPartialsRawBytes = allAssetFiles
    .filter((f) => {
      const rel = path.relative(ROOT, f).replace(/\\/g, "/");
      return rel.startsWith("assets/css/") && rel !== "assets/css/styles.css" && rel.endsWith(".css");
    })
    .reduce((sum, f) => sum + Buffer.byteLength(fs.readFileSync(f, "utf8"), "utf8"), 0);

  for (const srcFile of allAssetFiles) {
    const relPath = path.relative(ROOT, srcFile);
    const normalizedRelPath = relPath.replace(/\\/g, "/");
    const ext = path.extname(srcFile).toLowerCase();

    // Skip standalone emission of modular CSS partials; they are bundled into assets/css/styles.css
    if (
      ext === ".css" &&
      normalizedRelPath.startsWith("assets/css/") &&
      normalizedRelPath !== "assets/css/styles.css"
    ) {
      continue;
    }

    const destFile = path.join(DIST, relPath);
    ensureDir(path.dirname(destFile));

    if (normalizedRelPath === "assets/css/styles.css") {
      const entryRawBytes = Buffer.byteLength(fs.readFileSync(srcFile, "utf8"), "utf8");
      const rawBytes = cssPartialsRawBytes > 0 ? cssPartialsRawBytes : entryRawBytes;
      const bundleRes = await esbuildBuild({
        entryPoints: [srcFile],
        bundle: true,
        minify: true,
        write: false,
        target: "es2020",
        external: ["https://*", "http://*", "data:*"]
      });
      const bundledCss = bundleRes.outputFiles[0].text;
      const minBytes = Buffer.byteLength(bundledCss, "utf8");
      totalRawBytes += rawBytes;
      totalMinBytes += minBytes;
      fs.writeFileSync(destFile, bundledCss, "utf8");
      minifiedStylesCss = bundledCss.trim();
      console.log(
        `[minify] ${relPath}: ${(rawBytes / 1024).toFixed(1)} KiB -> ${(minBytes / 1024).toFixed(1)} KiB`
      );
    } else if (ext === ".js" || ext === ".css") {
      const raw = fs.readFileSync(srcFile, "utf8");
      const rawBytes = Buffer.byteLength(raw, "utf8");
      const res = await transform(raw, {
        loader: ext === ".css" ? "css" : "js",
        minify: true,
        format: ext === ".js" ? "esm" : undefined,
        target: "es2020"
      });
      const minBytes = Buffer.byteLength(res.code, "utf8");
      totalRawBytes += rawBytes;
      totalMinBytes += minBytes;
      fs.writeFileSync(destFile, res.code, "utf8");
      console.log(
        `[minify] ${relPath}: ${(rawBytes / 1024).toFixed(1)} KiB -> ${(minBytes / 1024).toFixed(1)} KiB`
      );
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  }

  // 2. Copy static root files (minifying sw.js and inlining full minified CSS into dist/index.html to prevent render-blocking and CLS)
  for (const file of STATIC_ROOT_FILES) {
    const srcPath = path.join(ROOT, file);
    if (!fs.existsSync(srcPath)) continue;
    const destPath = path.join(DIST, file);
    if (file.endsWith(".js")) {
      const raw = fs.readFileSync(srcPath, "utf8");
      const res = await transform(raw, {
        loader: "js",
        minify: true,
        target: "es2020"
      });
      fs.writeFileSync(destPath, res.code, "utf8");
    } else if (file === "index.html") {
      const html = fs.readFileSync(srcPath, "utf8");
      const inlinedHtml = inlineCssIntoHtml(html, minifiedStylesCss);
      fs.writeFileSync(destPath, inlinedHtml, "utf8");
      console.log(
        `[inline-css] dist/index.html: inlined ${(Buffer.byteLength(minifiedStylesCss, "utf8") / 1024).toFixed(1)} KiB minified CSS (0 render-blocking CSS, 0 CLS)`
      );
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  console.log(
    `Build complete: ${(totalRawBytes / 1024).toFixed(1)} KiB -> ${(totalMinBytes / 1024).toFixed(1)} KiB (saved ${((totalRawBytes - totalMinBytes) / 1024).toFixed(1)} KiB raw)`
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch((err) => {
    console.error("Build failed:", err);
    process.exit(1);
  });
}
