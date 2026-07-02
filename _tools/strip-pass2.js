#!/usr/bin/env node
/**
 * strip-pass2.js — Second pass stripper for JS, remaining CSS, and special files
 * Run: node strip-pass2.js
 */

const fs = require('fs');
const path = require('path');

let totalChanged = 0;

function readFile(fp) { return fs.readFileSync(fp, 'utf8'); }
function writeFile(fp, content) { fs.writeFileSync(fp, content, 'utf8'); }

function processFile(fp, processFn) {
  const original = readFile(fp);
  const updated = processFn(original, fp);
  if (updated !== original) {
    writeFile(fp, updated);
    console.log(`  ✓ ${path.relative(__dirname, fp)}`);
    totalChanged++;
  }
}

// All text replacements (same as pass 1)
const REPLACEMENTS = [
  ['Beyond Concierge Healthcare', '[COMPANY NAME]'],
  ['Beyond Concierge', '[COMPANY NAME]'],
  ['beyondhealthcarefl.com', '[DOMAIN]'],
  ['beyondconcierge.netlify.app', '[STAGING URL]'],
  ['Gabrielle Radabaugh', '[PROVIDER NAME]'],
  ['Gabrielle', '[PROVIDER NAME]'],
  ['Gabby', '[PROVIDER NAME]'],
  ['gabby@arnpfl.com', '[EMAIL]'],
  ['ARNP, FNP-C', '[CREDENTIALS]'],
  ['ARNP,FNP-C', '[CREDENTIALS]'],
  ['FNP-C', '[CREDENTIALS]'],
  ['ARNP', '[CREDENTIALS]'],
  ['(561) 216-7066', '[PHONE]'],
  ['(561) 247-1554', '[PHONE]'],
  ['561-216-7066', '[PHONE]'],
  ['561-247-1554', '[PHONE]'],
  ['5612167066', '[PHONE]'],
  ['12783 Forest Hill Blvd', '[ADDRESS]'],
  ['Wellington, FL 33414', '[CITY, STATE ZIP]'],
  ['Palm Beach County', '[COUNTY]'],
  ['Royal Palm Beach', '[CITY]'],
  ['West Palm Beach', '[CITY]'],
  ['Loxahatchee', '[CITY]'],
  ['Westlake', '[CITY]'],
  ['Wellington', '[CITY]'],
  ['Jupiter', '[CITY]'],
  ['Palm Beach', '[COUNTY]'],
  ['Florida', '[STATE]'],
  ['mangomint.com/770971', '[BOOKING URL]'],
  ['BCH Website Assistant', '[COMPANY NAME] Website Assistant'],
  ['beyondconciergefl.com', '[DOMAIN]'],
  ['beyond-concierge', '[company-slug]'],
  ['bch/', ''],
];

function applyReplacements(content) {
  let result = content;
  for (const [from, to] of REPLACEMENTS) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), to);
  }
  // Replace Cloudinary URLs
  result = result.replace(
    /https:\/\/res\.cloudinary\.com\/dcprgumqz\/[^\s"'`\)>]*/g,
    'https://placehold.co/800x600/e8e8e8/aaaaaa?text=Image'
  );
  // Replace any remaining BCH references
  result = result.replace(/\bBCH\b/g, '[COMPANY]');
  return result;
}

const ROOT = __dirname;

console.log('\n═══════════════════════════════════════════');
console.log('  strip-pass2.js — JS/CSS/Assets Stripper');
console.log('═══════════════════════════════════════════\n');

// JS files to strip
const JS_FILES = [
  'build.js',
  'mirrors.js',
  'js/wizard.js',
  'js/megamenu.js',
  'js/header-inject.js',
  'wizard/modules.js',
  'wizard/engine.js',
  'build-sitemap.js',
  'patch-links.js',
];

console.log('🔧 Stripping JS files...');
for (const f of JS_FILES) {
  const fp = path.join(ROOT, f);
  if (fs.existsSync(fp)) {
    processFile(fp, applyReplacements);
  }
}

// Netlify function
const nlFunc = path.join(ROOT, 'netlify/functions/portal-chat.js');
if (fs.existsSync(nlFunc)) {
  console.log('🔧 Stripping netlify function...');
  processFile(nlFunc, applyReplacements);
}

// CSS assets
const CSS_ASSETS = [
  'assets/css/service.css',
  'assets/css/tokens.css',
  'css/styles.css',
];
console.log('🎨 Stripping CSS assets...');
for (const f of CSS_ASSETS) {
  const fp = path.join(ROOT, f);
  if (fs.existsSync(fp)) {
    processFile(fp, applyReplacements);
  }
}

// scripts/ directory
const scriptsDir = path.join(ROOT, 'scripts');
if (fs.existsSync(scriptsDir)) {
  console.log('📜 Stripping scripts/ directory...');
  const files = fs.readdirSync(scriptsDir);
  for (const f of files) {
    const fp = path.join(scriptsDir, f);
    if (fs.statSync(fp).isFile()) {
      processFile(fp, applyReplacements);
    }
  }
}

// Check for any remaining .mjs files
const mjs = path.join(ROOT, 'planning/fix-maps-v3.mjs');
if (fs.existsSync(mjs)) {
  processFile(mjs, applyReplacements);
}

// Check {templates,partials,wizard,data directory (oddly named)
const weirdDir = path.join(ROOT, '{templates,partials,wizard,data');
if (fs.existsSync(weirdDir)) {
  console.log('📁 Found oddly-named dir, processing...');
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else processFile(full, applyReplacements);
    }
  };
  walk(weirdDir);
}

// Reference directory - remove entirely (BCH-specific scraped content)
const refDir = path.join(ROOT, 'reference');
if (fs.existsSync(refDir)) {
  console.log('\n🗑️  Removing reference/ directory (BCH-specific scraped content)...');
  fs.rmSync(refDir, { recursive: true, force: true });
  console.log('  ✓ reference/ removed');
}

console.log(`\n═══════════════════════════════════════════`);
console.log(`  ✅ Pass 2 done! Modified ${totalChanged} files`);
console.log(`═══════════════════════════════════════════\n`);
