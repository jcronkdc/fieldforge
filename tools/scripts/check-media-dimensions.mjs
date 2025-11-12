import { readdir, readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import process from "node:process";

const ROOT = join(process.cwd(), "src");
const ALLOWED_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"]);
const IGNORE_DIRS = new Set(["node_modules", "tests", "scripts", "dist"]);
const MEDIA_TAG_REGEX = /<(img|video)\b[^>]*>/g;
const WIDTH_REGEX = /\bwidth\s*=\s*("[^"]+"|'[^']+'|\{[^}]+\})/i;
const HEIGHT_REGEX = /\bheight\s*=\s*("[^"]+"|'[^']+'|\{[^}]+\})/i;

async function walk(dir, violations) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath, violations);
      continue;
    }

    const ext = extname(entry.name);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      continue;
    }

    const content = await readFile(fullPath, "utf8");
    const matches = content.match(MEDIA_TAG_REGEX);

    if (!matches) {
      continue;
    }

    matches.forEach((tag) => {
      const hasWidth = WIDTH_REGEX.test(tag);
      const hasHeight = HEIGHT_REGEX.test(tag);

      if (!hasWidth || !hasHeight) {
        violations.push({ file: fullPath, snippet: tag.trim() });
      }
    });
  }
}

async function main() {
  const violations = [];
  await walk(ROOT, violations);

  if (violations.length > 0) {
    console.error("Images and videos must include width and height attributes. Fix the following instances:\n");
    violations.forEach(({ file, snippet }) => {
      console.error(`- ${file}\n  ${snippet}\n`);
    });
    process.exit(1);
  }

  console.log("✅ All media elements provide intrinsic dimensions.");
}

main().catch((error) => {
  console.error("Failed to complete media dimension check:", error);
  process.exit(1);
});
