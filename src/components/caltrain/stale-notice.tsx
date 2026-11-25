"use client";

import { useSyncExternalStore } from "react";
import { daysStale } from "@/lib/caltrain-stories-format";
import { formatDate } from "@/lib/format";

const subscribe = () => () => {};

/** Days since the tracker last reported, or null while that is 3 days or fewer. Pure, for tests. */
export function staleDays(lastReported: string, today: Date): number | null {
  const days = daysStale(lastReported, today);
  return days > 3 ? days : null;
}

/** The notice for a given today: nothing at 0 to 3 days, the notice past that. */
export function StaleMessage({ lastReported, today }: { lastReported: string; today: Date }) {
  if (staleDays(lastReported, today) === null) return null;
  return (
    <p role="status" className="text-sm text-minor">
      The tracker last reported on {formatDate(lastReported)}; these numbers may be out of date.
    </p>
  );
}

/**
 * `lastReported` is a YYYY-MM-DD day the tracker ran. Renders nothing until
 * mounted (build-time HTML can't know today's date), then only when that day
 * is over 3 days old.
 */
export function StaleNotice({ lastReported }: { lastReported: string }) {
  // Today's local date as a string (a stable snapshot). The server snapshot is
  // null, so nothing renders until the client has mounted.
  const today = useSyncExternalStore(
    subscribe,
    () => new Date().toDateString(),
    () => null,
  );
  if (today === null) return null;
  return <StaleMessage lastReported={lastReported} today={new Date(today)} />;
}
