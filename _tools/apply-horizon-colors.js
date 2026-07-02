/**
 * apply-horizon-colors.js
 * Rewrites CSS to use Horizon Space / Tribune color tokens.
 * Horizon Space: white bg, --crimson #c41e3a buttons, --purple #6b2aa8 accent, --grad linear-gradient
 */

const fs = require('fs');
const path = require('path');

// --- Color map: BCH → Tribune/Horizon ---
const hexMap = [
  // Teal (BCH primary) → Crimson (Tribune primary)
  ['#5a95d8', '#d94a60'],      // teal-light → crimson-light
  ['#4a82c8', '#c02040'],      // teal-mid hover
  ['#2c61a4', '#c41e3a'],      // teal → crimson
  ['#1e4a85', '#a8192f'],      // teal-dark → crimson-hover
  ['#eef3fb', 'rgba(196,30,58,0.06)'], // teal-light bg
  // Orange accent → Purple (Horizon secondary)
  ['#FF9F00', '#6b2aa8'],
  ['#e08c00', '#562289'],
  ['#fff3e0', 'rgba(107,42,168,0.07)'],
  // Shadow rgba matches
  ['rgba(44,97,164,', 'rgba(196,30,58,'],
  ['rgba(44, 97, 164,', 'rgba(196,30,58,'],
];

// --- Variable token rewrites in :root ---
const varMap = [
  ['--orange:       #FF9F00', '--crimson:      #c41e3a'],
  ['--orange-dark:  #e08c00', '--crimson-hover:#a8192f'],
  ['--orange-light: #fff3e0', '--crimson-light:rgba(196,30,58,0.07)'],
  ['--teal:         #2c61a4', '--teal:         #c41e3a'],  // keep name for compat, swap value
  ['--teal-dark:    #1e4a85', '--teal-dark:    #a8192f'],
  ['--teal-light:   #eef3fb', '--teal-light:   rgba(196,30,58,0.06)'],
];

// --- CSS text replacements ---
const textMap = [
  ['text-orange { color: var(--orange)', 'text-crimson { color: var(--crimson)'],
  ['text-teal   { color: var(--teal)',   'text-teal   { color: var(--teal)'],
  // gradient overwrites
  ["background: linear-gradient(135deg, #5a95d8 0%, #2c61a4 100%)",
   "background: linear-gradient(135deg, #c41e3a 0%, #6b2aa8 100%)"],
  ["background: linear-gradient(135deg, #4a82c8 0%, #1e4a85 100%)",
   "background: linear-gradient(135deg, #a8192f 0%, #562289 100%)"],
  // CSS header comment
  ["Design system: white bg, #FF9F00 orange, #2c61a4 brand blue (exact logo color)",
   "Design system: white bg, #c41e3a crimson (Tribune/Horizon), #6b2aa8 purple accent"],
  ["[COMPANY NAME] — Custom Styles", "Tribune Inc. — Custom Styles"],
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Apply var map
  for (const [from, to] of varMap) {
    if (content.includes(from)) { content = content.split(from).join(to); changed = true; }
  }
  // Apply hex map
  for (const [from, to] of hexMap) {
    if (content.includes(from)) { content = content.split(from).join(to); changed = true; }
  }
  // Apply text map
  for (const [from, to] of textMap) {
    if (content.includes(from)) { content = content.split(from).join(to); changed = true; }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('  updated:', filePath);
  }
}

// Walk all CSS and HTML files
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules', '.git', '_tools', 'source'].includes(e.name)) {
      walk(full);
    } else if (e.isFile() && /\.(css|html)$/.test(e.name)) {
      processFile(full);
    }
  }
}

console.log('Applying Horizon Space color tokens to Tribune Inc. website...');
walk('.');
console.log('Done.');
