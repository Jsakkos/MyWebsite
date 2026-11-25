"use client";

import { useSyncExternalStore } from "react";
import { daysStale } from "@/lib/caltrain-stories-format";
import { formatDate } from "@/lib/format";

const subscribe = () => () => {};

/** Renders nothing until mounted (build-time HTML can't know today's date), then only when the data is over 3 days old. */
export function StaleNotice({ dataThrough }: { dataThrough: string }) {
  // Server snapshot is null, so nothing renders until the client has mounted.
  const days = useSyncExternalStore(
    subscribe,
    () => daysStale(dataThrough, new Date()),
    () => null,
  );

  if (days === null || days <= 3) return null;
  return (
    <p role="status" className="text-sm text-minor">
      The tracker last reported on {formatDate(dataThrough)}; these numbers may be out of date.
    </p>
  );
}
