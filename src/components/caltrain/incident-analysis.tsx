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
      <span className="inline-flex items-center gap-1 rounded-full bg-paper-2 px-2 py-0.5 text-xs font-semibold text-major">
        System
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-paper-2 px-2 py-0.5 text-xs font-semibold text-minor">
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
      className={`overflow-hidden rounded-lg border border-rule ${
        isExpanded ? "ring-1 ring-accent/30" : ""
      }`}
    >
      <button
        onClick={onToggle}
        className={`flex w-full items-start gap-3 border-l-4 ${borderColor} bg-paper p-4 text-left transition-colors hover:bg-paper-2`}
      >
        <div className="mt-0.5 shrink-0 text-muted">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <TierBadge tier={incident.tier} />
            <span className="font-semibold text-ink">
              {dateStr}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-2">
            {incident.summary}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span>
              <strong className="text-ink-2">
                {incident.trains_affected}
              </strong>{" "}
              trains affected
            </span>
            <span>
              Max delay:{" "}
              <strong className="text-major">
                {incident.max_delay_min} min
              </strong>
            </span>
            <span>
              On-time rate:{" "}
              <strong
                className={
                  incident.on_time_pct >= 80
                    ? "text-minor"
                    : "text-major"
                }
              >
                {incident.on_time_pct}%
              </strong>
            </span>
            {incident.held_near && (
              <span>
                Trains held near{" "}
                <strong className="text-ink-2">{incident.held_near}</strong>
              </span>
            )}
          </div>
        </div>
      </button>

      {isExpanded && detail && (
        <div className="border-t border-rule bg-paper-2 p-4">
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
          <AlertTriangle className="h-5 w-5 text-major" />
          <h2 className="font-serif text-2xl tracking-tight text-ink">
            Incident Analysis
          </h2>
        </div>
        <div className="flex gap-1 rounded-lg bg-paper-2 p-1">
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
                  ? "bg-paper text-accent "
                  : "text-ink-2 hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-muted">
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
        <p className="py-8 text-center text-sm text-muted">
          No incidents found for this filter.
        </p>
      )}

      <p className="mt-3 text-xs text-muted">
        System incidents: 3+ trains delayed more than 15 min on the same day. Train
        incidents: individual trains delayed more than 15 min.
      </p>
    </section>
  );
}
