/**
 * fix-cream-colors.mjs
 * Replaces rgba(245,242,235,X) — the hardcoded off-white/cream text color
 * used throughout the app — with adaptive CSS variables.
 *
 * Skips sidebar/nav layout files that intentionally stay dark in all modes.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import path from "path";

const SRC = path.resolve("src");

// These files are on permanently-dark backgrounds — leave cream colors as-is
const SKIP_FILES = new Set([
  "Sidebar.tsx",
  "BottomNav.tsx",
  "MobileNav.tsx",
  "MenuModal.tsx",
]);

function alphaToVar(alpha) {
  if (alpha <= 0.5)  return "var(--text-subtle)";
  if (alpha <= 0.75) return "var(--text-muted)";
  return "var(--text)";
}

function walkDir(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walkDir(full, results);
    else if (/\.(tsx|ts)$/.test(entry)) results.push(full);
  }
  return results;
}

const CREAM_RE = /rgba\(245\s*,\s*242\s*,\s*235\s*,\s*(0\.\d+|1(?:\.0)?)\)/g;

const files = walkDir(SRC);
let totalFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  const basename = path.basename(file);
  if (SKIP_FILES.has(basename)) continue;
  if (file.includes("node_modules") || file.includes(".next")) continue;

  const content = readFileSync(file, "utf8");
  if (!content.includes("rgba(245")) continue;

  let count = 0;
  const result = content.replace(CREAM_RE, (_, alphaStr) => {
    count++;
    return alphaToVar(parseFloat(alphaStr));
  });

  if (result !== content && count > 0) {
    writeFileSync(file, result, "utf8");
    totalFiles++;
    totalReplacements += count;
    console.log(`  ✓ ${path.relative(SRC, file).replace(/\\/g, "/")} — ${count} replacement(s)`);
  }
}

console.log(`\nDone: ${totalReplacements} replacements across ${totalFiles} files.`);
