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
        ) : !stats ? (
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
              onTimePct={stats.on_time_percentage}
              totalArrivals={stats.total_arrivals}
              daysTracked={stats.days_tracked}
              dateRange={stats.date_range}
              rolling7d={stats.rolling_7d_on_time}
              rolling30d={stats.rolling_30d_on_time}
            />

            {/* Performance Overview */}
            <PerformanceOverview
              onTimePct={stats.on_time_percentage}
              minorPct={stats.minor_delay_percentage}
              majorPct={stats.major_delay_percentage}
              avgDelay={stats.avg_delay_minutes}
              medianDelay={stats.median_delay_minutes}
              totalArrivals={stats.total_arrivals}
            />

            {/* Daily Trends */}
            {daily && daily.length > 0 && <DailyTrendsChart data={daily} />}

            {/* Calendar Heatmap */}
            {daily && daily.length > 0 && <CalendarHeatmap data={daily} />}

            {/* Day-Hour Heatmap */}
            {heatmap && heatmap.length > 0 && <Heatmap data={heatmap} />}

            {/* Commute Analysis */}
            {commute && Object.keys(commute).length > 0 && <CommuteAnalysis data={commute} />}

            {/* Incident Analysis */}
            {incidents && incidents.length > 0 && trajectories && (
              <IncidentAnalysis incidents={incidents} trajectories={trajectories} />
            )}

            {/* Station Rankings */}
            {stations && stations.length > 0 && <StationRankings data={stations} />}

            {/* Train Leaderboard */}
            {trains && trains.length > 0 && <TrainLeaderboard data={trains} />}

            {/* Time Breakdown */}
            {weekly && monthly && weekly.length > 0 && monthly.length > 0 && (
              <TimeBreakdown weekly={weekly} monthly={monthly} />
            )}

            {/* Methodology & Footer */}
            <section className="rounded-md border border-rule bg-paper p-6">
              <h2 className="mb-4 font-serif text-2xl tracking-tight text-ink">Methodology</h2>
              <div className="grid grid-cols-1 gap-6 text-sm text-ink-2 md:grid-cols-3">
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
                <div>
                  <h3 className="mb-2 font-semibold text-ink">Delay Classification</h3>
                  <ul className="mt-1 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-ontime" /> On-time: within 4 min
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-minor" /> Minor: 5-14 min late
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-major" /> Major: 15+ min late
                    </li>
                  </ul>
                </div>
              </div>
            </section>

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
