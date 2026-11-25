import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StaleMessage, StaleNotice, staleDays } from "@/components/caltrain/stale-notice";

// Local noon on Nov 25, 2026.
const today = new Date(2026, 10, 25, 12);

describe("staleDays", () => {
  test("is null for 0 to 3 days, the count from 4 days on", () => {
    expect(staleDays("2026-11-25", today)).toBeNull();
    expect(staleDays("2026-11-24", today)).toBeNull();
    expect(staleDays("2026-11-22", today)).toBeNull();
    expect(staleDays("2026-11-21", today)).toBe(4);
    expect(staleDays("2026-11-01", today)).toBe(24);
  });

  test("a date in the future is not stale", () => {
    expect(staleDays("2026-11-30", today)).toBeNull();
  });
});

describe("StaleMessage", () => {
  const render = (lastReported: string) =>
    renderToStaticMarkup(createElement(StaleMessage, { lastReported, today }));

  test("renders nothing at 0 to 3 days", () => {
    for (const d of ["2026-11-25", "2026-11-24", "2026-11-23", "2026-11-22"]) expect(render(d)).toBe("");
  });

  test("renders the notice past 3 days", () => {
    const html = render("2026-11-21");
    expect(html).toContain('role="status"');
    expect(html).toContain("The tracker last reported on Nov 21, 2026");
  });
});

test("StaleNotice renders nothing on the server, since build-time HTML can't know today's date", () => {
  expect(renderToStaticMarkup(createElement(StaleNotice, { lastReported: "2020-01-01" }))).toBe("");
});

test("the stories page keys the notice to the nightly build, not data_through", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const src = fs.readFileSync(
    path.join(process.cwd(), "src", "app", "projects", "caltrain-tracker", "stories", "page.tsx"),
    "utf8",
  );
  expect(src).toContain("<StaleNotice lastReported={data.generated_at.slice(0, 10)} />");
  expect(src).toContain("Data through {formatDate(data.data_through)}");
});
