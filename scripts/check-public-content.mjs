#!/usr/bin/env node
// Blocks internal details from reaching this public repo's content.
//
// Generic patterns live here. Named terms (customer, vendor and private
// project names) must NOT be written in this file, because the repo is
// public: they live in a gitignored `.content-denylist`, one per line.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const GENERIC_PATTERNS = [
  { name: "internal project code", regex: /\bPLC\s?\d{3,4}\b/gi },
  { name: "internal document number", regex: /\bPMT\s?\d{3,4}\b/gi },
  { name: "QR form number", regex: /\bQR-\d+\b/gi },
  { name: "CAPA reference", regex: /\bCAPA\b/g },
  { name: "dollar amount", regex: /\$\s?\d/g },
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
    ...GENERIC_PATTERNS,
    ...named.map((term) => ({
      name: "denylisted term",
      regex: new RegExp(`(?<![\\w])${escapeRegex(term)}(?![\\w])`, "gi"),
    })),
  ];
  const violations = [];
  text.split(/\r?\n/).forEach((lineText, i) => {
    for (const rule of rules) {
      for (const m of lineText.matchAll(new RegExp(rule.regex.source, rule.regex.flags))) {
        violations.push({ file, line: i + 1, match: m[0], rule: rule.name });
      }
    }
  });
  return violations;
}

function walk(dir, accept) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, accept);
    return accept(full) ? [full] : [];
  });
}

export function scanRepo(root) {
  const warnings = [];
  const named = loadNamedTerms(path.join(root, ".content-denylist"));
  if (named === null) {
    warnings.push(
      ".content-denylist not found: only generic patterns were checked. Create it locally (it is gitignored) with one named term per line.",
    );
  }
  const caltrainData = path.join(root, "public", "data", "caltrain") + path.sep;
  const files = [
    ...walk(path.join(root, "content"), (f) => /\.(json|md|mdx)$/.test(f)),
    ...walk(path.join(root, "public"), (f) => f.endsWith(".json") && !f.startsWith(caltrainData)),
  ];
  const violations = files.flatMap((f) =>
    findViolations(fs.readFileSync(f, "utf8"), path.relative(root, f), named ?? []),
  );
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
