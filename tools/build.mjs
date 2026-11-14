import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const STATIC_ROOT_FILES = ["index.html", "ccna.html", "manifest.json", "sw.js"];

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

async function build() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
  }
  ensureDir(DIST);

  // 1. Process all files in assets/ first so minified CSS is ready for inlining
  const assetsSrcDir = path.join(ROOT, "assets");
  const allAssetFiles = getAllFiles(assetsSrcDir);

  let totalRawBytes = 0;
  let totalMinBytes = 0;
  let minifiedStylesCss = "";

  for (const srcFile of allAssetFiles) {
    const relPath = path.relative(ROOT, srcFile);
    const destFile = path.join(DIST, relPath);
    ensureDir(path.dirname(destFile));

    const ext = path.extname(srcFile).toLowerCase();
    if (ext === ".js" || ext === ".css") {
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
      if (relPath.replace(/\\/g, "/") === "assets/css/styles.css") {
        minifiedStylesCss = res.code.trim();
      }
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
    } else if (file === "index.html" && minifiedStylesCss) {
      let html = fs.readFileSync(srcPath, "utf8");
      html = html.replace(
        /<style id="critical-css">[\s\S]*?<\/style>\s*<link rel="preload" href="assets\/css\/styles\.css\?v=\d+" as="style" onload="this\.onload=null;this\.rel='stylesheet'" \/>\s*<noscript><link rel="stylesheet" href="assets\/css\/styles\.css\?v=\d+" \/><\/noscript>/,
        `<style id="critical-css">${minifiedStylesCss}</style>`
      );
      fs.writeFileSync(destPath, html, "utf8");
      console.log(`[inline-css] dist/index.html: inlined ${(Buffer.byteLength(minifiedStylesCss, "utf8") / 1024).toFixed(1)} KiB minified CSS (0 render-blocking CSS, 0 CLS)`);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  console.log(
    `Build complete: ${(totalRawBytes / 1024).toFixed(1)} KiB -> ${(totalMinBytes / 1024).toFixed(1)} KiB (saved ${((totalRawBytes - totalMinBytes) / 1024).toFixed(1)} KiB raw)`
  );
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
