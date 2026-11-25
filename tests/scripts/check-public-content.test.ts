import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { findViolations, loadNamedTerms, scanRepo } from "../../scripts/check-public-content.mjs";

function tempRepo(files: Record<string, string>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "content-check-"));
  for (const [rel, body] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, body);
  }
  return root;
}

test("flags spaced and unspaced project codes", () => {
  expect(findViolations("PLC 1234 and plc5678", "x.mdx", [])).toHaveLength(2);
});

test("flags dollar amounts and CAPA on their own lines", () => {
  const v = findViolations("saved $99K\nclosed the CAPA", "x.json", []);
  expect(v.map((x: { line: number }) => x.line)).toEqual([1, 2]);
});

test("named terms are case-insensitive whole words", () => {
  expect(findViolations("worked with ACME LABS", "x", ["Acme Labs"])).toHaveLength(1);
  expect(findViolations("acmelabsville", "x", ["Acme Labs"])).toHaveLength(0);
});

test("public/resume.json is always a violation", () => {
  const root = tempRepo({ ".content-denylist": "", "public/resume.json": "{}" });
  expect(scanRepo(root).violations).toHaveLength(1);
});

test("missing denylist warns but generic patterns still run", () => {
  const root = tempRepo({ "content/notes/a.mdx": "Worked on PMT9999 triage." });
  const result = scanRepo(root);
  expect(result.violations).toHaveLength(1);
  expect(result.warnings).toHaveLength(1);
});

test("named terms from the local denylist are enforced in content and public JSON", () => {
  const root = tempRepo({
    ".content-denylist": "# customers\nAcme Labs\n",
    "content/profile.json": '{"x": "tiles for acme labs"}',
    "public/extra.json": '{"y": "Acme Labs"}',
  });
  expect(scanRepo(root).violations).toHaveLength(2);
});

test("caltrain data is not scanned", () => {
  const root = tempRepo({ ".content-denylist": "", "public/data/caltrain/x.json": '{"fare": "$5"}' });
  expect(scanRepo(root).violations).toHaveLength(0);
});

test("loadNamedTerms ignores comments and blanks, returns null when missing", () => {
  const root = tempRepo({ ".content-denylist": "# c\n\nAcme Labs\n  Foo Co  \n" });
  expect(loadNamedTerms(path.join(root, ".content-denylist"))).toEqual(["Acme Labs", "Foo Co"]);
  expect(loadNamedTerms(path.join(root, "nope"))).toBeNull();
});
