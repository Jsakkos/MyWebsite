import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { CaltrainSnapshot as Snapshot } from "@/lib/caltrain-snapshot";

const snap = vi.hoisted(() => ({ current: null as Snapshot | null }));

vi.mock("@/lib/caltrain-snapshot", () => ({ getCaltrainSnapshot: () => snap.current }));
vi.mock("@/lib/caltrain-stories", () => ({ storiesAvailable: () => false }));

import { CaltrainSnapshot } from "@/components/caltrain-snapshot";

const base: Snapshot = {
  onTimePct: "92.8%",
  arrivals: "650,000",
  days: 430,
  since: "Aug 2025",
  label: "within 4 minutes of schedule",
  cleaned: true,
};

describe.each(["card", "inline"] as const)("CaltrainSnapshot %s", (variant) => {
  test("cleaned figures are arrivals counted", () => {
    snap.current = base;
    const html = renderToStaticMarkup(createElement(CaltrainSnapshot, { variant }));
    expect(html).toContain("arrivals counted");
    expect(html).not.toContain("arrivals logged");
  });

  test("legacy figures are arrivals logged", () => {
    snap.current = { ...base, cleaned: false, label: "all stops, unadjusted" };
    const html = renderToStaticMarkup(createElement(CaltrainSnapshot, { variant }));
    expect(html).toContain("arrivals logged");
    expect(html).not.toContain("arrivals counted");
  });
});
