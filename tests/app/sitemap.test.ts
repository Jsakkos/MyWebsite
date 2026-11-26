import { buildSitemap } from "@/app/sitemap";
import { storiesAvailable } from "@/lib/caltrain-stories";

vi.mock("@/lib/caltrain-stories", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/caltrain-stories")>()),
  storiesAvailable: vi.fn(() => false),
}));

const base = "https://www.jonathanksakkos.com";

test("sitemap lists live routes and no retired ones", () => {
  const urls = buildSitemap([]).map((e) => e.url);
  for (const p of ["/", "/work/", "/resume/", "/projects/", "/projects/caltrain-tracker/", "/projects/caltrain-tracker/dashboard/", "/publications/", "/contact/"])
    expect(urls).toContain(`${base}${p}`);
  expect(urls.some((u) => /\/(about|experience|blog)\//.test(u))).toBe(false);
});

test("notes appear only when published", () => {
  expect(buildSitemap([]).map((e) => e.url)).not.toContain(`${base}/notes/`);
  const urls = buildSitemap([
    { slug: "hello", title: "Hello", date: "2026-12-01", summary: "x", readingMinutes: 1, draft: false },
  ]).map((e) => e.url);
  expect(urls).toContain(`${base}/notes/`);
  expect(urls).toContain(`${base}/notes/hello/`);
});

test("the stories page is listed only when its data exists", () => {
  const path = `${base}/projects/caltrain-tracker/stories/`;
  vi.mocked(storiesAvailable).mockReturnValue(true);
  const entry = buildSitemap([]).find((e) => e.url === path);
  expect(entry?.priority).toBe(0.7);
  expect(entry?.changeFrequency).toBe("daily");
  vi.mocked(storiesAvailable).mockReturnValue(false);
  expect(buildSitemap([]).map((e) => e.url)).not.toContain(path);
});
