"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, MapPin } from "lucide-react";
import type { StationPerformance } from "@/lib/api";

type SortKey = "on_time_pct" | "avg_delay_min" | "total_arrivals";

interface StationRankingsProps {
  data: StationPerformance[];
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

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ChevronUp className="h-3 w-3 opacity-30" />;
    return ascending ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
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
        <MapPin className="h-5 w-5 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Station Rankings</h2>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">#</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Station</th>
                <th
                  className="cursor-pointer px-4 py-3 text-right font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  onClick={() => toggleSort("on_time_pct")}
                >
                  <span className="inline-flex items-center gap-1">
                    On-Time % <SortIcon column="on_time_pct" />
                  </span>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-right font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  onClick={() => toggleSort("avg_delay_min")}
                >
                  <span className="inline-flex items-center gap-1">
                    Avg Delay <SortIcon column="avg_delay_min" />
                  </span>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-right font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  onClick={() => toggleSort("total_arrivals")}
                >
                  <span className="inline-flex items-center gap-1">
                    Arrivals <SortIcon column="total_arrivals" />
                  </span>
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((station, i) => (
                <tr
                  key={station.stop_id}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/50 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {cleanStationName(station.stop_name)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-semibold ${
                        station.on_time_pct >= 90
                          ? "text-emerald-600 dark:text-emerald-400"
                          : station.on_time_pct >= 80
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {station.on_time_pct}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    {station.avg_delay_min} min
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                    {station.total_arrivals}
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <div className="inline-flex h-2 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                      <div
                        className="bg-emerald-500 transition-all duration-500"
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
