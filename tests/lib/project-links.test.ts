import { visibleLinks } from "@/lib/project-links";
import { getProfile } from "@/lib/content";

vi.mock("@/lib/caltrain-stories", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/caltrain-stories")>()),
  storiesAvailable: vi.fn(() => false),
}));

const project = {
  links: [
    { label: "Dashboard", url: "/projects/caltrain-tracker/dashboard/" },
    { label: "Stories", url: "/projects/caltrain-tracker/stories/" },
    { label: "GitHub", url: "https://github.com/Jsakkos/caltrain-tracker" },
  ],
};

test("drops the Stories link while the stories data is missing", () => {
  expect(visibleLinks(project).map((l) => l.label)).toEqual(["Dashboard", "GitHub"]);
});

test("keeps every link when the stories data exists", () => {
  expect(visibleLinks(project, true).map((l) => l.label)).toEqual(["Dashboard", "Stories", "GitHub"]);
});

test("the real caltrain-tracker project is filtered the same way", () => {
  const tracker = getProfile().projects.find((p) => p.slug === "caltrain-tracker")!;
  expect(tracker.links.some((l) => l.label === "Stories")).toBe(true);
  expect(visibleLinks(tracker).some((l) => l.label === "Stories")).toBe(false);
  expect(visibleLinks(tracker, true).some((l) => l.label === "Stories")).toBe(true);
});
