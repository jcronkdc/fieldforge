import { readFileSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../..");
const sourceRoot = path.join(root, "apps/swipe-feed/src");

const excludeSegments = [
  "apps/swipe-feed/src/lib/",
  "apps/swipe-feed/src/tests/",
  "apps/swipe-feed/src/scripts/",
  "apps/swipe-feed/src/data/",
  "apps/swipe-feed/src/utils/",
  "apps/swipe-feed/src/context/",
  "apps/swipe-feed/src/hooks/",
  "apps/swipe-feed/src/components/DebugClickHandler.tsx",
  "apps/swipe-feed/src/components/GlobalClickEnhancer.tsx",
];

const files = [];

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (/\.(tsx|ts|html)$/.test(entry.name)) {
      const relative = path.relative(root, fullPath);
      if (excludeSegments.some((segment) => relative.startsWith(segment))) {
        continue;
      }
      files.push({ absolute: fullPath, relative });
    }
  }
}

walk(sourceRoot);

const bad = [];

const weakCtaMarkup = (source) => />\s*(Click here|Submit|OK)\s*</.test(source);

const weakCtaStrings = (source) => {
  const pattern = /["'`]\s*(Click here|Submit|OK)\s*["'`]/g;
  let match;
  while ((match = pattern.exec(source))) {
    const start = match.index;
    const before = source.slice(Math.max(0, start - 20), start);

    // Allow technical usages like type="submit" or selector attribute lookups.
    if (
      /\btype\s*=\s*$/i.test(before) ||
      /\[\s*type\s*=\s*$/i.test(before) ||
      /:contains\($/i.test(before) ||
      /\.type\s*(===|==)\s*$/i.test(before) ||
      /(dispatchEvent|new Event)\s*\($/i.test(before)
    ) {
      continue;
    }

    return true;
  }
  return false;
};

const tests = [
  (source) => /["'`][^"'`\n]*!(?=[\s"'`.,;!?]|$)[^"'`\n]*["'`]/.test(source), // exclamation inside quotes ending with punctuation
  weakCtaMarkup, // weak CTA in markup
  weakCtaStrings, // weak CTA in strings (excluding attribute selectors)
  (source) => /\.{3}(?!\w)/.test(source), // ellipses
  (source) => /\b(ASAP|right now|immediately)\b/i.test(source), // hype or urgency
];

for (const file of files) {
  const source = readFileSync(file.absolute, "utf8");
  if (tests.some((check) => check(source))) {
    bad.push(file.relative);
  }
}

if (bad.length) {
  console.error("Copy style violations in:");
  bad.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
} else {
  console.log("✅ Copy style check passed.");
}

