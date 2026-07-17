/**
 * fix-gold-labels.mjs
 * Replaces all rgba(201,X,X,alpha) TEXT color values with var(--gold-label)
 * so section headers, dates and labels are readable in both light and dark mode.
 *
 * Only touches "color:" contexts (not background:, border:, boxShadow:, stroke=).
 * Skips sidebar files that are always on dark backgrounds.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import path from "path";

const SRC = path.resolve("src");

// Skip files on permanently-dark backgrounds (sidebar/nav)
const SKIP_FILES = new Set(["Sidebar.tsx", "BottomNav.tsx", "MobileNav.tsx", "MenuModal.tsx"]);

function walkDir(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walkDir(full, results);
    else if (/\.(tsx|ts)$/.test(entry)) results.push(full);
  }
  return results;
}

// Matches rgba(201,X,X,alpha) or rgba(201, X, X, alpha) where alpha is 0.4–0.85
// Used as a text color (preceded by `color:` or `color =`)
const GOLD_TEXT_RE = /(?<=color:\s*["'`]?)rgba\(201\s*,\s*(?:162|168)\s*,\s*(?:39|76)\s*,\s*(0\.[4-9]\d*)\)(?=["'`]?)/g;

const files = walkDir(SRC);
let totalFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  const basename = path.basename(file);
  if (SKIP_FILES.has(basename)) continue;
  if (file.includes("node_modules") || file.includes(".next")) continue;

  const content = readFileSync(file, "utf8");
  if (!content.match(/color.*rgba\(201/)) continue;

  let count = 0;
  // Process line-by-line to ensure we only touch color: contexts
  const lines = content.split("\n");
  const fixed = lines.map(line => {
    // Skip lines that don't have a gold rgba color
    if (!line.includes("rgba(201")) return line;
    // Skip lines that are pure comments
    if (/^\s*\/\//.test(line)) return line;

    let newLine = line;

    // Match rgba(201,...) in color contexts
    // We look for `color:` or `color =` before the rgba on the same line
    newLine = newLine.replace(
      /rgba\(201\s*,\s*(?:162|168)\s*,\s*(?:39|76)\s*,\s*(0\.[4-9]\d*)\)/g,
      (match, alpha, offset) => {
        // Get text before this match on the line
        const before = newLine.slice(0, offset).toLowerCase();

        // Only replace if the context is a color property
        // (not background, border, boxShadow, stroke)
        const isColorCtx =
          /color\s*[:=]\s*["'`]?$/.test(before.trimEnd()) ||
          /color\s*[:=]\s*["'`]?\s*$/.test(before) ||
          // ternary: `condition ? "val" : "rgba(...)"`
          /color[^:]*:.*:\s*["'`]$/.test(before) ||
          // object shorthand: `color: isActive ? "#..." : "rgba(...)`
          /color[^:]*:.*\?\s*"[^"]*"\s*:\s*["'`]$/.test(before);

        const isBackgroundCtx =
          /background[^:]*:\s*["'`]?/.test(before) ||
          /box-?shadow[^:]*:\s*["'`]?/.test(before) ||
          /border[^:]*:\s*["'`]?/.test(before) ||
          /stroke[^:]*=\s*["'`]?/.test(before);

        if (isBackgroundCtx) return match;
        if (isColorCtx) {
          count++;
          return "var(--gold-label)";
        }
        return match;
      }
    );

    return newLine;
  });

  const result = fixed.join("\n");
  if (result !== content && count > 0) {
    writeFileSync(file, result, "utf8");
    totalFiles++;
    totalReplacements += count;
    console.log(`  ✓ ${path.relative(SRC, file).replace(/\\/g, "/")} — ${count} replacement(s)`);
  }
}

console.log(`\nDone: ${totalReplacements} replacements across ${totalFiles} files.`);
