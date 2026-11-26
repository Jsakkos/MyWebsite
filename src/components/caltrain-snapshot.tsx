import { getCaltrainSnapshot } from "@/lib/caltrain-snapshot";
import { STORIES_PATH } from "@/lib/caltrain-stories-format";
import { storiesAvailable } from "@/lib/caltrain-stories";
import { TextLink } from "@/components/ui";

export function CaltrainSnapshot({ variant }: { variant: "card" | "inline" }) {
  const s = getCaltrainSnapshot();
  if (!s) return null;
  // Cleaned counts are what passed the cleaning rules; legacy counts are everything logged.
  const arrivals = s.cleaned ? "arrivals counted" : "arrivals logged";

  if (variant === "inline") {
    return (
      <p className="text-ink-2">
        So far: <span className="font-mono text-ink">{s.arrivals}</span> {arrivals} over{" "}
        <span className="font-mono text-ink">{s.days}</span> days since {s.since}, with{" "}
        <span className="font-mono text-ink">{s.onTimePct}</span> on time ({s.label}).
      </p>
    );
  }

  return (
    <div className="mt-5 inline-flex flex-col rounded-md bg-paper-2 px-5 py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-3xl font-medium text-accent">{s.onTimePct}</span>
        <span className="text-sm text-muted">on time · {s.label}</span>
      </div>
      <p className="mt-1 text-sm text-muted">
        <span className="font-mono">{s.arrivals}</span> {arrivals} over {s.days} days, since {s.since}
      </p>
      {storiesAvailable() && (
        <p className="mt-2 text-sm">
          <TextLink href={STORIES_PATH}>Read the stories</TextLink>
        </p>
      )}
    </div>
  );
}
