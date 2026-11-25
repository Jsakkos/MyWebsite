import path from "node:path";
import { getAllNotes, getNote } from "@/lib/notes";
import { NAV_ITEMS, navItemsFor } from "@/lib/nav";

const dir = path.join(process.cwd(), "tests/fixtures/notes");

test("published notes are sorted newest first and drafts are excluded by default", () => {
  expect(getAllNotes({ dir }).map((n) => n.slug)).toEqual(["newer", "older"]);
});

test("drafts can be included for local preview", () => {
  expect(getAllNotes({ dir, includeDrafts: true }).map((n) => n.slug)).toEqual(["work-in-progress", "newer", "older"]);
});

test("getNote returns content and metadata, or null when missing", () => {
  const note = getNote("newer", { dir })!;
  expect(note.title).toBe("Newer note");
  expect(note.content).toContain("Some words here");
  expect(note.readingMinutes).toBeGreaterThanOrEqual(1);
  expect(getNote("nope", { dir })).toBeNull();
});

test("a draft is not served unless drafts are included", () => {
  expect(getNote("work-in-progress", { dir })).toBeNull();
  expect(getNote("work-in-progress", { dir, includeDrafts: true })?.draft).toBe(true);
});

test("a note without a title fails loudly", () => {
  expect(() => getAllNotes({ dir: path.join(process.cwd(), "tests/fixtures/notes-bad") })).toThrow(/untitled\.mdx.*title/);
});

test("Notes leaves the nav when nothing is published", () => {
  expect(navItemsFor(false).map((i) => i.label)).toEqual(["Work", "Projects", "Papers", "Contact"]);
  expect(navItemsFor(true)).toEqual(NAV_ITEMS);
});
