/**
 * fix-light-mode-colors.mjs — v3
 * Global alpha-based replacement of rgba(255,255,255,X).
 * Skips values >= 0.9 (intentional white bg) and values inside CSS comments.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import path from "path";

const SRC = path.resolve("src");

function replace(alpha) {
  // Skip near-opaque white (intentional white backgrounds like rgba(255,255,255,0.97))
  if (alpha >= 0.9) return null;
  // Very faint (used as subtle bg or border) → --bg-2
  if (alpha <= 0.12) return "var(--bg-2)";
  // Faint text / border
  if (alpha <= 0.45) return "var(--text-subtle)";
  // Medium text
  if (alpha <= 0.72) return "var(--text-muted)";
  // Fairly visible text
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

const RGBA_RE = /rgba\(255\s*,\s*255\s*,\s*255\s*,\s*(0\.\d+|1(?:\.0)?)\)/g;

const files = walkDir(SRC);
let totalFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  if (file.includes("node_modules") || file.includes(".next")) continue;

  const content = readFileSync(file, "utf8");
  if (!content.includes("rgba(255")) continue;

  let count = 0;
  const result = content.replace(RGBA_RE, (match, alphaStr) => {
    const cssVar = replace(parseFloat(alphaStr));
    if (!cssVar) return match; // leave near-white as-is
    count++;
    return cssVar;
  });

  if (result !== content && count > 0) {
    writeFileSync(file, result, "utf8");
    totalFiles++;
    totalReplacements += count;
    console.log(`  ✓ ${path.relative(SRC, file).replace(/\\/g, "/")} — ${count} replacement(s)`);
  }
}

console.log(`\nDone: ${totalReplacements} replacements across ${totalFiles} files.`);
