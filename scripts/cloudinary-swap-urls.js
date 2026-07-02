#!/usr/bin/env node
// PHASE 5 — Replace all old URLs with new [COMPANY] Cloudinary URLs across the entire repo
// Reads planning/url-map.json, dry-run first, then writes

const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..');
const MAP_PATH = path.join(BASE, 'planning', 'url-map.json');
const REPORT_PATH = path.join(BASE, 'planning', 'swap-report.json');

const map = JSON.parse(fs.readFileSync(MAP_PATH));
// Sort by length descending so longer/more-specific strings match first
const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);

const DRY_RUN = process.argv.includes('--dry-run');
if (DRY_RUN) console.log('🔍 DRY RUN — no files will be written\n');

const EXTENSIONS = ['.html', '.js', '.json', '.css', '.md'];
const SKIP_DIRS = ['.git', 'node_modules', 'reference'];
const SKIP_FILES = ['url-map.json', 'upload-log.json', 'migrate-log.json', 'swap-report.json', 'cloudinary-migration-plan.md'];

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.includes(entry.name)) results.push(...walk(path.join(dir, entry.name)));
    } else if (EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      if (!SKIP_FILES.includes(entry.name)) results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

const files = walk(BASE);
const report = { changed: [], unchanged: [], total_replacements: 0 };

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  let replacements = 0;

  for (const [oldStr, newStr] of entries) {
    if (content.includes(oldStr)) {
      const count = content.split(oldStr).length - 1;
      content = content.split(oldStr).join(newStr);
      replacements += count;
    }
  }

  if (replacements > 0) {
    const rel = path.relative(BASE, filePath);
    report.changed.push({ file: rel, replacements });
    report.total_replacements += replacements;
    if (!DRY_RUN) fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ ${rel} — ${replacements} replacement(s)`);
  }
}

fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

console.log(`\n📊 Summary:`);
console.log(`  Files changed: ${report.changed.length}`);
console.log(`  Total replacements: ${report.total_replacements}`);
console.log(`  Report: ${REPORT_PATH}`);
if (DRY_RUN) console.log('\n⚠️  DRY RUN complete — re-run without --dry-run to apply changes');
