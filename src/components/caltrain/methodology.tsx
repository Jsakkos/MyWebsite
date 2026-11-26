import { cn } from "@/lib/utils";

interface MethodologyProps {
  /** True when the dashboard shows the cleaned figures; legacy exports have no cleaning to describe. */
  cleaned: boolean;
}

/** The dashboard's methodology panel. The cleaning rules appear only over cleaned data. */
export function Methodology({ cleaned }: MethodologyProps) {
  return (
    <section className="rounded-md border border-rule bg-paper p-6">
      <h2 className="mb-4 font-serif text-2xl tracking-tight text-ink">Methodology</h2>
      <div
        className={cn(
          "grid grid-cols-1 gap-6 text-sm text-ink-2 md:grid-cols-2",
          cleaned ? "lg:grid-cols-4" : "lg:grid-cols-3",
        )}
      >
        <div>
          <h3 className="mb-2 font-semibold text-ink">Data Collection</h3>
          <p>
            Real-time train positions collected every minute from the 511.org GTFS-RT API.
            Each data point includes train ID, GPS coordinates, destination station, and timestamp.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-semibold text-ink">Arrival Detection</h3>
          <p>
            Arrival times are calculated using the Haversine formula to determine when each train
            reaches minimum distance to its scheduled station stop.
          </p>
        </div>
        {cleaned && (
          <div>
            <h3 className="mb-2 font-semibold text-ink">Cleaning Rules</h3>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              <li>
                First stops are left out, because a train waiting at its origin platform looks on time whatever
                happens next.
              </li>
              <li>Calls scheduled after midnight are left out, because 511 drops every train from the feed at midnight.</li>
              <li>An arrival counts only when the train&apos;s closest position is within 1 km of the platform.</li>
              <li>Arrivals are counted for real train numbers only.</li>
              <li>
                Days when the feed&apos;s positions were stale or mislocated are left out of the figures and marked
                &ldquo;feed unreliable&rdquo;.
              </li>
            </ul>
          </div>
        )}
        <div>
          <h3 className="mb-2 font-semibold text-ink">Delay Classification</h3>
          <ul className="mt-1 space-y-1">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-ontime" /> On-time: within 4 min
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-minor" /> Minor: over 4, up to 15 min
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-major" /> Major: over 15 min
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
