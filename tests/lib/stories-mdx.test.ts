import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compileMDX } from "next-mdx-remote/rsc";
import { STORY_FIGURE_KEYS, type ExampleDay, type StoriesData, type StoryId } from "@/lib/caltrain-stories-format";
import { storyComponents } from "@/components/caltrain/stories/mdx-components";

const FIXTURES = path.join(process.cwd(), "tests", "fixtures", "caltrain");
const MDX_FILE = path.join(process.cwd(), "content", "caltrain", "stories.mdx");

const data: StoriesData = JSON.parse(fs.readFileSync(path.join(FIXTURES, "stories.json"), "utf8"));
const day: ExampleDay = JSON.parse(fs.readFileSync(path.join(FIXTURES, "stories_example_day.json"), "utf8"));
const mdx = () => fs.readFileSync(MDX_FILE, "utf8");

const STORY_IDS: readonly StoryId[] = ["recovery", "express", "afternoons", "saturday"];
const DASHBOARD_ANCHORS = ["trains", "stations", "hours", "incidents", "days"];

/** All values of `attr="…"` on `<Tag` in the MDX source. */
function attrValues(source: string, tag: string, attr: string): string[] {
  const re = new RegExp(`<${tag}\\b[^>]*?\\b${attr}="([^"]*)"`, "g");
  return [...source.matchAll(re)].map((m) => m[1]);
}

async function render(source: string, exampleDay: ExampleDay | null, stories: StoriesData = data): Promise<string> {
  const { content } = await compileMDX({ source, components: storyComponents(stories, exampleDay) });
  return renderToStaticMarkup(content);
}

describe("content/caltrain/stories.mdx", () => {
  test("every <Fig k> key is a known figure present in the fixture", () => {
    const keys = attrValues(mdx(), "Fig", "k");
    expect(keys.length).toBeGreaterThan(10);
    for (const k of keys) {
      expect(STORY_FIGURE_KEYS, k).toContain(k);
      expect(data.figures, k).toHaveProperty(k);
    }
  });

  test("every capitalised tag is a story component", () => {
    const provided = Object.keys(storyComponents(data, null));
    const used = new Set([...mdx().matchAll(/<([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]));
    expect(used.size).toBeGreaterThan(5);
    for (const tag of used) expect(provided, tag).toContain(tag);
  });

  test("every ClaimNote names a story", () => {
    const stories = attrValues(mdx(), "ClaimNote", "story");
    expect(stories.length).toBeGreaterThan(0);
    for (const s of stories) expect(STORY_IDS).toContain(s);
  });

  test("every CheckYourTrain points at a dashboard section", () => {
    const targets = attrValues(mdx(), "CheckYourTrain", "to");
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets) expect(DASHBOARD_ANCHORS).toContain(t);
  });

  test("compiles and renders with the example day", async () => {
    const html = await render(mdx(), day);
    for (const n of [1, 2, 3, 4]) expect(html).toContain(`id="story-${n}"`);
    expect(html).toContain('id="trust"');
    expect(html).toContain("train by train"); // the playable diagram
  });

  test("compiles and renders without the example day", async () => {
    const html = await render(mdx(), null);
    expect(html).toContain('id="story-3"');
    expect(html).not.toContain("train by train");
  });
});

describe("storyComponents", () => {
  test("Fig formats the figure in mono", async () => {
    const html = await render('<Fig k="sat_late_pct" />', null);
    expect(html).toContain("10.7%");
    expect(html).toContain("font-mono");
  });

  test("Fig throws on an unknown key, naming it", async () => {
    await expect(render('<Fig k="nope" />', null)).rejects.toThrow(/"nope"/);
  });

  test("ClaimNote is silent while the claim holds", async () => {
    expect(await render('<ClaimNote story="recovery" />', null)).toBe("");
  });

  test("ClaimNote warns, with the data date, when the claim no longer holds", async () => {
    const stale: StoriesData = {
      ...data,
      stories: { ...data.stories, saturday: { ...data.stories.saturday, holds: false } },
    };
    const html = await render('<ClaimNote story="saturday" />', null, stale);
    expect(html).toContain("As of Nov 25, 2026, this no longer holds in the latest data.");
    expect(html).toContain("text-minor");
  });

  test("Story is a numbered section with an h2", async () => {
    const html = await render('<Story n={2} title="The fastest trains">\n\nHello.\n\n</Story>', null);
    expect(html).toMatch(/<section[^>]*id="story-2"/);
    expect(html).toContain("font-serif");
    expect(html).toMatch(/<h2[^>]*>The fastest trains<\/h2>/);
  });

  test("CheckYourTrain links to the dashboard section", async () => {
    const html = await render('<CheckYourTrain to="incidents" />', null);
    // next/link drops the trailing slash outside a Next build (trailingSlash comes from next.config).
    expect(html).toMatch(/href="\/projects\/caltrain-tracker\/dashboard\/?#incidents"/);
  });

  test("AfternoonDiagram renders nothing without an example day", async () => {
    expect(await render("<AfternoonDiagram />", null)).toBe("");
  });

  test("renders a plain element tree", () => {
    const { Fig } = storyComponents(data, null);
    expect(renderToStaticMarkup(createElement(Fig, { k: "worst_train" }))).toContain("523");
  });
});
