import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("caltrain write-up describes delay bands as the data defines them", () => {
  const src = readFileSync("src/app/projects/caltrain-tracker/page.tsx", "utf8");
  expect(src).not.toContain("5 to 14");
  expect(src).toContain("more than 4 and up to 15 minutes");
});
