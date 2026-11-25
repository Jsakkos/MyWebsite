import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`no ${selector} block in globals.css`);
  const body = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2].toLowerCase()]),
  );
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const tokens = { light: block(":root"), dark: block(".dark") };
const pairs = [
  ["ink", "paper"],
  ["ink-2", "paper"],
  ["muted", "paper"],
  ["accent", "paper"],
  ["ink", "paper-2"],
  ["muted", "paper-2"],
  ["accent", "paper-2"],
  ["chart-axis", "paper"],
] as const;

test.each(["light", "dark"] as const)("%s tokens pass WCAG AA for text", (mode) => {
  for (const [fg, bg] of pairs) {
    const ratio = contrast(tokens[mode][fg], tokens[mode][bg]);
    expect(ratio, `${mode} ${fg} on ${bg} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
  }
});

test("light tokens match the spec", () => {
  expect(tokens.light).toMatchObject({
    paper: "#fbf8f1",
    ink: "#23201b",
    "ink-2": "#4a453c",
    muted: "#5d574c",
    rule: "#e3dccd",
    accent: "#2f6b4f",
  });
});

test("both themes define the same tokens", () => {
  expect(Object.keys(tokens.dark).sort()).toEqual(Object.keys(tokens.light).sort());
});
