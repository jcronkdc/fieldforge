import { readFileSync } from "fs";

const text = readFileSync("docs/review/GAPS.md", "utf8");

const missingOwner = [...text.matchAll(/- \[ \] .*?\(Owner:\s*\)/g)];
const missingPriority = [...text.matchAll(/\[Priority:\s*\]/g)];

if (missingOwner.length || missingPriority.length) {
  console.error("Backlog validation failed: some items missing Owner or Priority.");
  process.exit(1);
}

