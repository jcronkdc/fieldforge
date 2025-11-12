import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import process from 'node:process';

const IGNORE_DIRS = new Set(['node_modules', 'dist', 'build', '.next', '.git']);
const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.scss', '.html',
  '.json', '.md', '.txt'
]);
const LINE_PATTERNS = [
  /<[^>]*>[^<]*\.\.\.[^<]*</,
  /"[^"]*\.\.\.[^"]*"/,
  /'[^']*\.\.\.[^']*'/,
  /`[^`]*\.\.\.[^`]*`/
];
const TARGETS = ['src', 'index.html'];

async function walk(dir, matches) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath, matches);
      continue;
    }

    const ext = extname(entry.name);
    if (!TEXT_EXTENSIONS.has(ext)) {
      continue;
    }

    const content = await readFile(fullPath, 'utf8');
    const lines = content.split('\n');
    if (lines.some((line) => LINE_PATTERNS.some((pattern) => pattern.test(line)))) {
      matches.push(fullPath);
    }
  }
}

async function main() {
  const matches = [];
  for (const target of TARGETS) {
    const fullTarget = join(process.cwd(), target);
    const ext = extname(fullTarget);

    try {
      if (ext && TEXT_EXTENSIONS.has(ext)) {
        const content = await readFile(fullTarget, 'utf8');
        const lines = content.split('\n');
        if (lines.some((line) => LINE_PATTERNS.some((pattern) => pattern.test(line)))) {
          matches.push(fullTarget);
        }
      } else {
        await walk(fullTarget, matches);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }
  }

  if (matches.length > 0) {
    console.error('Found literal "..." strings in the following files:');
    matches.forEach((file) => console.error(` - ${file}`));
    process.exit(1);
  }

  console.log('✅ No literal ellipses found.');
}

main().catch((error) => {
  console.error('Failed to complete ellipsis check:', error);
  process.exit(1);
});
