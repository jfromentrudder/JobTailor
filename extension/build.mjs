import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";

const browserTarget = process.argv[2] || "chrome";
const isWatch = process.argv.includes("--watch");
const outdir = path.resolve(`dist/${browserTarget}`);

// Ensure output directories exist
fs.mkdirSync(path.join(outdir, "popup"), { recursive: true });
fs.mkdirSync(path.join(outdir, "icons"), { recursive: true });

// Copy static files
function copyStatic() {
  // Manifest
  const manifestSrc = path.resolve(`src/manifest.${browserTarget}.json`);
  if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, path.join(outdir, "manifest.json"));
  } else {
    console.error(`Manifest not found: ${manifestSrc}`);
    process.exit(1);
  }

  // Popup HTML + CSS
  fs.copyFileSync(
    path.resolve("src/popup/popup.html"),
    path.join(outdir, "popup/popup.html")
  );
  fs.copyFileSync(
    path.resolve("src/popup/popup.css"),
    path.join(outdir, "popup/popup.css")
  );

  // Icons
  const iconsDir = path.resolve("icons");
  if (fs.existsSync(iconsDir)) {
    for (const file of fs.readdirSync(iconsDir)) {
      fs.copyFileSync(
        path.join(iconsDir, file),
        path.join(outdir, "icons", file)
      );
    }
  }
}

async function build() {
  const commonOptions = {
    bundle: true,
    format: "esm",
    target: "es2020",
    minify: !isWatch,
    sourcemap: isWatch,
    outdir,
  };

  // Background script
  await esbuild.build({
    ...commonOptions,
    entryPoints: ["src/background.ts"],
    outdir,
  });

  // Content script (needs to be iife, not esm, since it runs in page context)
  await esbuild.build({
    ...commonOptions,
    entryPoints: ["src/content.ts"],
    format: "iife",
    outdir,
  });

  // Popup script
  await esbuild.build({
    ...commonOptions,
    entryPoints: ["src/popup/popup.ts"],
    outdir: path.join(outdir, "popup"),
  });

  copyStatic();
  console.log(`Built for ${browserTarget} → ${outdir}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
