"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, MapPin } from "lucide-react";
import type { StationPerformance } from "@/lib/api";

type SortKey = "on_time_pct" | "avg_delay_min" | "total_arrivals";

interface StationRankingsProps {
  data: StationPerformance[];
}

function SortIcon({ column, sortKey, ascending }: { column: SortKey; sortKey: SortKey; ascending: boolean }) {
  if (sortKey !== column) return <ChevronUp className="h-3 w-3 opacity-30" />;
  return ascending ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
}

export function StationRankings({ data }: StationRankingsProps) {
  const [sortKey, setSortKey] = useState<SortKey>("on_time_pct");
  const [ascending, setAscending] = useState(false);

  const sorted = [...data].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return ascending ? diff : -diff;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setAscending(!ascending);
    } else {
      setSortKey(key);
      setAscending(key === "avg_delay_min");
    }
  }


  function cleanStationName(name: string): string {
    return name
      .replace(" Caltrain Station", "")
      .replace(" Northbound", " NB")
      .replace(" Southbound", " SB");
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-accent" />
        <h2 className="font-serif text-2xl tracking-tight text-ink">Station Rankings</h2>
      </div>

      <div className="rounded-md border border-rule bg-paper">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rule">
                <th className="px-4 py-3 text-left font-medium text-muted">#</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Station</th>
                <th
                  className="cursor-pointer px-4 py-3 text-right font-medium text-muted hover:text-ink"
                  onClick={() => toggleSort("on_time_pct")}
                >
                  <span className="inline-flex items-center gap-1">
                    On-Time % <SortIcon sortKey={sortKey} ascending={ascending} column="on_time_pct" />
                  </span>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-right font-medium text-muted hover:text-ink"
                  onClick={() => toggleSort("avg_delay_min")}
                >
                  <span className="inline-flex items-center gap-1">
                    Avg Delay <SortIcon sortKey={sortKey} ascending={ascending} column="avg_delay_min" />
                  </span>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-right font-medium text-muted hover:text-ink"
                  onClick={() => toggleSort("total_arrivals")}
                >
                  <span className="inline-flex items-center gap-1">
                    Arrivals <SortIcon sortKey={sortKey} ascending={ascending} column="total_arrivals" />
                  </span>
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted hidden sm:table-cell">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((station, i) => (
                <tr
                  key={station.stop_id}
                  className="border-b border-rule transition-colors hover:bg-paper-2 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-muted">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-ink">
                    {cleanStationName(station.stop_name)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-semibold ${
                        station.on_time_pct >= 90
                          ? "text-ontime"
                          : station.on_time_pct >= 80
                          ? "text-minor"
                          : "text-major"
                      }`}
                    >
                      {station.on_time_pct}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-ink-2">
                    {station.avg_delay_min} min
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {station.total_arrivals}
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <div className="inline-flex h-2 w-20 overflow-hidden rounded-full bg-rule">
                      <div
                        className="bg-ontime transition-all duration-500"
                        style={{ width: `${station.on_time_pct}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
