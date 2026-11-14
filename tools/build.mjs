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

  // 1. Copy static root files (and minify sw.js)
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
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  // 2. Process all files in assets/
  const assetsSrcDir = path.join(ROOT, "assets");
  const allAssetFiles = getAllFiles(assetsSrcDir);

  let totalRawBytes = 0;
  let totalMinBytes = 0;

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
      console.log(
        `[minify] ${relPath}: ${(rawBytes / 1024).toFixed(1)} KiB -> ${(minBytes / 1024).toFixed(1)} KiB`
      );
    } else {
      fs.copyFileSync(srcFile, destFile);
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
