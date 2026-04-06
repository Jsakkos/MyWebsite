"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import type { Incident, IncidentDetail } from "@/lib/api";
import { MareyDiagram } from "./marey-diagram";

interface IncidentAnalysisProps {
  incidents: Incident[];
  trajectories: Record<string, IncidentDetail>;
}

type TierFilter = "all" | 1 | 2;

function TierBadge({ tier }: { tier: 1 | 2 }) {
  if (tier === 2) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
        System
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      Train
    </span>
  );
}

function IncidentCard({
  incident,
  detail,
  isExpanded,
  onToggle,
}: {
  incident: Incident;
  detail?: IncidentDetail;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const borderColor =
    incident.tier === 2
      ? "border-l-red-500"
      : "border-l-amber-500";

  const dateStr = new Date(incident.date + "T00:00:00").toLocaleDateString(
    "en-US",
    { weekday: "short", month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${
        isExpanded ? "ring-1 ring-blue-500/30" : ""
      }`}
    >
      <button
        onClick={onToggle}
        className={`flex w-full items-start gap-3 border-l-4 ${borderColor} bg-white p-4 text-left transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50`}
      >
        <div className="mt-0.5 shrink-0 text-gray-400">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <TierBadge tier={incident.tier} />
            <span className="font-semibold text-gray-900 dark:text-white">
              {dateStr}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {incident.summary}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span>
              <strong className="text-gray-700 dark:text-gray-300">
                {incident.trains_affected}
              </strong>{" "}
              trains affected
            </span>
            <span>
              Max delay:{" "}
              <strong className="text-red-600 dark:text-red-400">
                {incident.max_delay_min} min
              </strong>
            </span>
            <span>
              On-time rate:{" "}
              <strong
                className={
                  incident.on_time_pct >= 80
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {incident.on_time_pct}%
              </strong>
            </span>
            {incident.root_cause_station && (
              <span>
                Held at{" "}
                <strong className="text-gray-700 dark:text-gray-300">
                  {incident.root_cause_station}
                </strong>
              </span>
            )}
          </div>
        </div>
      </button>

      {isExpanded && detail && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          <MareyDiagram detail={detail} />
        </div>
      )}
    </div>
  );
}

export function IncidentAnalysis({
  incidents,
  trajectories,
}: IncidentAnalysisProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");

  const filtered = useMemo(() => {
    if (tierFilter === "all") return incidents;
    return incidents.filter((i) => i.tier === tierFilter);
  }, [incidents, tierFilter]);

  const tier2Count = incidents.filter((i) => i.tier === 2).length;
  const tier1Count = incidents.filter((i) => i.tier === 1).length;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Incident Analysis
          </h2>
        </div>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
          {([
            { key: "all" as TierFilter, label: `All (${incidents.length})` },
            { key: 2 as TierFilter, label: `System (${tier2Count})` },
            { key: 1 as TierFilter, label: `Train (${tier1Count})` },
          ]).map((opt) => (
            <button
              key={String(opt.key)}
              onClick={() => setTierFilter(opt.key)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                tierFilter === opt.key
                  ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Auto-detected disruptions ranked by severity. Click to reveal the
        space-time diagram showing every train&apos;s trajectory that day.
      </p>

      <div className="space-y-3">
        {filtered.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            detail={trajectories[incident.id]}
            isExpanded={expandedId === incident.id}
            onToggle={() =>
              setExpandedId(expandedId === incident.id ? null : incident.id)
            }
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No incidents found for this filter.
        </p>
      )}

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        System incidents: 3+ trains delayed ≥15 min on the same day. Train
        incidents: individual trains delayed ≥15 min.
      </p>
    </section>
  );
}
