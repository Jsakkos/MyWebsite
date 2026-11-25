"use client";

import Link from "next/link";
import { ArrowLeft, Github, Database, Clock } from "lucide-react";
import {
  useCaltrainStats,
  useCaltrainDailyPerformance,
  useCaltrainStations,
  useCaltrainTrains,
  useCaltrainHeatmap,
  useCaltrainCommute,
  useCaltrainWeekly,
  useCaltrainMonthly,
  useCaltrainIncidents,
  useCaltrainIncidentTrajectories,
} from "@/hooks/useCaltrain";
import {
  HeroSection,
  PerformanceOverview,
  DailyTrendsChart,
  Heatmap,
  CalendarHeatmap,
  StationRankings,
  TrainLeaderboard,
  CommuteAnalysis,
  TimeBreakdown,
  IncidentAnalysis,
} from "@/components/caltrain";
import { Methodology } from "@/components/caltrain/methodology";
import { StaleNotice } from "@/components/caltrain/stale-notice";
import { headline } from "@/lib/caltrain-headline";

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-64 rounded-md bg-rule" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-md bg-rule" />
        ))}
      </div>
      <div className="h-96 rounded-md bg-rule" />
    </div>
  );
}

export default function CaltrainDashboardPage() {
  const { data: stats, loading: statsLoading } = useCaltrainStats();
  const { data: daily } = useCaltrainDailyPerformance();
  const { data: stations } = useCaltrainStations();
  const { data: trains } = useCaltrainTrains();
  const { data: heatmap } = useCaltrainHeatmap();
  const { data: commute } = useCaltrainCommute();
  const { data: weekly } = useCaltrainWeekly();
  const { data: monthly } = useCaltrainMonthly();
  const { data: incidents } = useCaltrainIncidents();
  const { data: trajectories } = useCaltrainIncidentTrajectories();

  const head = stats ? headline(stats) : null;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Navigation */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/projects/caltrain-tracker"
            className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-strong"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to project details
          </Link>
          <Link
            href="https://github.com/jsakkos/caltrain-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-rule bg-paper px-3 py-2 text-sm font-medium text-ink-2 hover:bg-paper-2"
          >
            <Github className="h-4 w-4" />
            View Source
          </Link>
        </div>

        {statsLoading ? (
          <LoadingSkeleton />
        ) : !stats || !head ? (
          <div className="rounded-md border border-rule bg-paper p-12 text-center">
            <Database className="mx-auto h-12 w-12 text-muted" />
            <h2 className="mt-4 font-serif text-xl text-ink">
              Unable to load dashboard data
            </h2>
            <p className="mt-2 text-muted">
              Please check that the data files are available.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Hero */}
            <HeroSection
              onTimePct={head.onTimePct}
              totalArrivals={head.totalArrivals}
              daysTracked={head.daysTracked}
              dateRange={stats.date_range}
              rolling7d={head.rolling7d}
              rolling30d={head.rolling30d}
              label={head.label}
              cleaned={head.cleaned}
            />
            <StaleNotice lastReported={stats.date_range.end} />

            {/* Performance Overview */}
            <PerformanceOverview
              onTimePct={head.onTimePct}
              minorPct={head.minorPct}
              majorPct={head.majorPct}
              avgDelay={head.avgDelay}
              medianDelay={head.medianDelay}
              totalArrivals={head.totalArrivals}
            />

            {/* Daily Trends */}
            {/* Daily trends and the calendar (#days) */}
            {daily && daily.length > 0 && (
              <div id="days" className="scroll-mt-24 space-y-10">
                <DailyTrendsChart data={daily} />
                <CalendarHeatmap data={daily} />
              </div>
            )}

            {/* Day-Hour Heatmap */}
            {heatmap && heatmap.length > 0 && (
              <div id="hours" className="scroll-mt-24">
                <Heatmap data={heatmap} cleaned={head.cleaned} />
              </div>
            )}

            {/* Commute Analysis */}
            {commute && Object.keys(commute).length > 0 && (
              <div id="commute" className="scroll-mt-24">
                <CommuteAnalysis data={commute} cleaned={head.cleaned} />
              </div>
            )}

            {/* Incident Analysis */}
            {incidents && incidents.length > 0 && trajectories && (
              <div id="incidents" className="scroll-mt-24">
                <IncidentAnalysis incidents={incidents} trajectories={trajectories} />
              </div>
            )}

            {/* Station Rankings */}
            {stations && stations.length > 0 && (
              <div id="stations" className="scroll-mt-24">
                <StationRankings data={stations} />
              </div>
            )}

            {/* Train Leaderboard */}
            {trains && trains.length > 0 && (
              <div id="trains" className="scroll-mt-24">
                <TrainLeaderboard data={trains} />
              </div>
            )}

            {/* Time Breakdown */}
            {weekly && monthly && weekly.length > 0 && monthly.length > 0 && (
              <TimeBreakdown weekly={weekly} monthly={monthly} />
            )}

            {/* Methodology & Footer */}
            <Methodology cleaned={head.cleaned} />

            {/* Data freshness */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Last updated: {new Date(stats.last_updated).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5" />
                <span>
                  {stats.total_arrivals.toLocaleString()} arrivals over {stats.days_tracked} days
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
