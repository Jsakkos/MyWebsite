import { REDIRECTS } from "@/lib/redirects";

const to = (s: string) => REDIRECTS.find((r) => r.source === s)?.destination;

test("retired pages go to their replacements", () => {
  expect(to("/about")).toBe("/work/");
  expect(to("/experience")).toBe("/work/");
  expect(to("/blog")).toBe("/notes/");
  expect(to("/blog/:slug*")).toBe("/notes/:slug*");
  expect(to("/files/SakkosCV.pdf")).toBe("/files/jonathan-sakkos-resume.pdf");
  expect(to("/files/cv.pdf")).toBe("/files/jonathan-sakkos-resume.pdf");
});

test("hugo-era paths no longer point at retired pages", () => {
  for (const r of REDIRECTS) expect(r.destination).not.toMatch(/^\/(about|experience|blog)\b/);
  expect(to("/author/:path*")).toBe("/work/");
  expect(to("/authors/:path*")).toBe("/work/");
  expect(to("/courses/:path*")).toBe("/work/");
  expect(to("/publication/:path*")).toBe("/publications/");
  expect(to("/talk/:path*")).toBe("/publications/");
  expect(to("/slides/:path*")).toBe("/publications/");
  expect(to("/project/:path*")).toBe("/projects/");
  expect(to("/home/:path*")).toBe("/");
  expect(to("/post/:path*")).toBe("/notes/");
});

test("the retired welcome post lands on Notes, ahead of the generic blog rule", () => {
  expect(to("/blog/welcome-to-my-new-site")).toBe("/notes/");
  const specific = REDIRECTS.findIndex((r) => r.source === "/blog/welcome-to-my-new-site");
  const generic = REDIRECTS.findIndex((r) => r.source === "/blog/:slug*");
  expect(specific).toBeLessThan(generic);
});

test("all redirects are permanent", () => {
  expect(REDIRECTS.every((r) => r.permanent === true)).toBe(true);
});
