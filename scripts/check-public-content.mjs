#!/usr/bin/env node
// content-check: allow-examples
//
// Blocks internal details from reaching this public repo. Every tracked (or
// new, not-ignored) text file is scanned, not just site content, because
// anything committed here is public.
//
// Generic patterns live here. Named terms (customer, vendor and private
// project names) must NOT be written in this file: they live in the
// gitignored `.content-denylist`, one per line.
//
// A file containing the marker "content-check: allow-examples" may hold fake
// examples of the generic patterns (this script, its tests, the plan). Named
// terms are enforced everywhere regardless.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SEP = String.raw`[\s\-_#:.]*`;

export const GENERIC_PATTERNS = [
  { name: "internal project code", regex: new RegExp(String.raw`\bPLC${SEP}\d{3,6}\b`, "gi") },
  { name: "internal document number", regex: new RegExp(String.raw`\bPMT${SEP}\d{3,6}\b`, "gi") },
  { name: "QR form number", regex: new RegExp(String.raw`\bQR${SEP}\d+\b`, "gi") },
  { name: "CAPA reference", regex: /\bCAPAs?\b/gi },
  { name: "dollar amount", regex: /\$\s?\d/g },
];

const ALLOW_EXAMPLES = "content-check: allow-examples";
const TEXT_FILE = /\.(md|mdx|json|ts|tsx|js|mjs|cjs|css|html|toml|ya?ml|txt|xml)$/i;
// Tooling and build folders, skipped at any depth. Git may not ignore all of them
// (Netlify installs its plugins into .netlify/plugins/node_modules during the build).
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", ".netlify", ".vercel", ".superpowers", ".playwright-mcp", "out", "build", "coverage"]);
const inSkippedDir = (rel) => rel.split("/").slice(0, -1).some((seg) => SKIP_DIRS.has(seg));
const SKIP_FILES = new Set([".content-denylist", "package-lock.json"]);
const DATA_DIR = "public/data/caltrain/";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Words of a term joined by any run of spaces, hyphens, non-breaking spaces or line breaks. */
function termRegex(term) {
  const words = term.split(/[\s\- ]+/).filter(Boolean).map(escapeRegex);
  return new RegExp(`(?<![\\p{L}\\p{N}_])${words.join("[\\s\\-\\u00a0]+")}(?![\\p{L}\\p{N}_])`, "giu");
}

export function loadNamedTerms(file = ".content-denylist") {
  if (!fs.existsSync(file)) return null;
  return fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

export function findViolations(text, file, named) {
  const rules = [
    ...(text.includes(ALLOW_EXAMPLES) ? [] : GENERIC_PATTERNS),
    ...named.map((term) => ({ name: "denylisted term", regex: termRegex(term) })),
  ];
  const violations = [];
  for (const rule of rules) {
    for (const m of text.matchAll(new RegExp(rule.regex.source, rule.regex.flags))) {
      const line = text.slice(0, m.index).split("\n").length;
      violations.push({ file, line, match: m[0], rule: rule.name });
    }
  }
  return violations.sort((a, b) => a.line - b.line);
}

function walk(root, dir = root) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP_DIRS.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(root, full) : [path.relative(root, full)];
  });
}

/** Tracked plus new-but-not-ignored files when in a git repo; every file otherwise. */
function listFiles(root) {
  try {
    const out = execFileSync("git", ["-C", root, "ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.split("\0").filter(Boolean);
  } catch {
    return walk(root);
  }
}

const SELF = new Set(["scripts/check-public-content.mjs", "tests/scripts/check-public-content.test.ts"]);

export function scanRepo(root) {
  const warnings = [];
  const named = loadNamedTerms(path.join(root, ".content-denylist"));
  if (named === null) {
    warnings.push(
      ".content-denylist not found: only generic patterns were checked. Create it locally (it is gitignored) with one named term per line.",
    );
  }
  const files = listFiles(root)
    .map((f) => f.split(path.sep).join("/"))
    .filter((f) => TEXT_FILE.test(f) && !inSkippedDir(f) && !f.startsWith(DATA_DIR) && !SKIP_FILES.has(path.basename(f)))
    .filter((f) => fs.existsSync(path.join(root, f)));
  const violations = files.flatMap((f) => {
    const text = fs.readFileSync(path.join(root, f), "utf8");
    // The checker and its tests necessarily name the patterns; named terms still apply.
    return findViolations(text, f, named ?? []).filter((v) => !(SELF.has(f) && v.rule !== "denylisted term"));
  });
  if (fs.existsSync(path.join(root, "public", "resume.json"))) {
    violations.push({
      file: "public/resume.json",
      line: 0,
      match: "public/resume.json",
      rule: "retired file: career data lives in content/profile.json",
    });
  }
  return { violations, warnings };
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const { violations, warnings } = scanRepo(process.cwd());
  warnings.forEach((w) => console.warn(`warning: ${w}`));
  violations.forEach((v) => console.error(`${v.file}:${v.line} ${v.rule} "${v.match}"`));
  if (violations.length) {
    console.error(`\n${violations.length} confidentiality violation(s). Fix them before building.`);
    process.exit(1);
  }
  console.log("check:content passed");
}
