import { NAV_ITEMS, isActivePath } from "@/lib/nav";

test("nav order", () => {
  expect(NAV_ITEMS.map((i) => i.label)).toEqual(["Work", "Projects", "Papers", "Notes", "Contact"]);
  expect(NAV_ITEMS.find((i) => i.label === "Papers")?.href).toBe("/publications/");
});

test("nested routes activate their section", () => {
  expect(isActivePath("/projects/caltrain-tracker/dashboard/", "/projects/")).toBe(true);
  expect(isActivePath("/work", "/work/")).toBe(true);
  expect(isActivePath("/", "/work/")).toBe(false);
  expect(isActivePath("/workshop/", "/work/")).toBe(false);
});
