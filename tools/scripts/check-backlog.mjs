import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");
const backlogPath = path.join(root, "docs", "review", "GAPS.md");

const text = readFileSync(backlogPath, "utf8");

const missingOwner = [...text.matchAll(/- \[ \] .*?\(Owner:\s*\)/g)];
const missingPriority = [...text.matchAll(/\[Priority:\s*\]/g)];

if (missingOwner.length || missingPriority.length) {
  console.error("Backlog validation failed: some items missing Owner or Priority.");
  process.exit(1);
}

