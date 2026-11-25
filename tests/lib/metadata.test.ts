import { DEFAULT_TITLE, pageMetadata } from "@/lib/metadata";

test("default title is a plain string with the current role", () => {
  expect(DEFAULT_TITLE).toBe("Jonathan Sakkos · Staff Engineer, Spatial Genomics R&D");
});

test("pages without a title use the default absolutely; titled pages use the template", () => {
  expect(pageMetadata({ path: "/" }).title).toEqual({ absolute: DEFAULT_TITLE });
  expect(pageMetadata({ path: "/work/", title: "Work" }).title).toBe("Work");
});

test("canonical URLs use the real domain and the page path", () => {
  expect(pageMetadata({ path: "/work/" }).alternates?.canonical).toBe("https://www.jonathanksakkos.com/work/");
});
