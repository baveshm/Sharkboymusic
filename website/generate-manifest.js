#!/usr/bin/env node
/**
 * generate-manifest.js
 * Run this script whenever you add or remove files from the asset folders:
 *   node generate-manifest.js
 *
 * It scans each dynamic folder and writes assets/manifest.json.
 * The website reads manifest.json at load time to know what files exist.
 *
 * DYNAMIC FOLDERS (edit content by dropping files in/out):
 *   assets/hero/           → hero background — site picks 1 at random
 *   assets/about/          → about section photo — site picks 1 at random
 *   assets/gallery-photos/ → photo carousel — site shows ALL in order
 *   assets/gallery-videos/ → video reel — site shows ALL in order
 *
 * STATIC FOLDER (referenced directly in HTML/CSS — not scanned):
 *   assets/static/         → logos, fixed UI graphics — call by exact filename
 */

const fs   = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');

// Folders to scan and what media types are valid in each
const DYNAMIC_FOLDERS = {
  'hero':            { types: ['jpg','jpeg','png','webp'] },
  'about':           { types: ['jpg','jpeg','png','webp'] },
  'gallery-photos':  { types: ['jpg','jpeg','png','webp','gif'] },
  'gallery-videos':  { types: ['mp4','webm','mov'] },
};

const manifest = {};

for (const [folder, config] of Object.entries(DYNAMIC_FOLDERS)) {
  const dir = path.join(ASSETS_DIR, folder);
  if (!fs.existsSync(dir)) {
    manifest[folder] = [];
    continue;
  }

  const files = fs.readdirSync(dir)
    .filter(f => {
      const ext = f.split('.').pop().toLowerCase();
      return config.types.includes(ext) && !f.startsWith('.');
    })
    .sort()
    .map(f => `assets/${folder}/${f}`);

  manifest[folder] = files;
}

const outPath = path.join(ASSETS_DIR, 'manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));

console.log('manifest.json written:');
for (const [key, files] of Object.entries(manifest)) {
  console.log(`  ${key}: ${files.length} file(s)`);
}
