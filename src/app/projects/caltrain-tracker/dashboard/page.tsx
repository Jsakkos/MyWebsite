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
} from "@/components/caltrain";

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
      <div className="h-96 rounded-xl bg-gray-200 dark:bg-gray-700" />
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/projects/caltrain-tracker"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to project details
          </Link>
          <Link
            href="https://github.com/jsakkos/caltrain-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Github className="h-4 w-4" />
            View Source
          </Link>
        </div>

        {statsLoading ? (
          <LoadingSkeleton />
        ) : !stats ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <Database className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Unable to load dashboard data
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
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

            {/* Station Rankings */}
            {stations && stations.length > 0 && <StationRankings data={stations} />}

            {/* Train Leaderboard */}
            {trains && trains.length > 0 && <TrainLeaderboard data={trains} />}

            {/* Time Breakdown */}
            {weekly && monthly && weekly.length > 0 && monthly.length > 0 && (
              <TimeBreakdown weekly={weekly} monthly={monthly} />
            )}

            {/* Methodology & Footer */}
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Methodology</h2>
              <div className="grid grid-cols-1 gap-6 text-sm text-gray-600 dark:text-gray-300 md:grid-cols-3">
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Data Collection</h3>
                  <p>
                    Real-time train positions collected every minute from the 511.org GTFS-RT API.
                    Each data point includes train ID, GPS coordinates, destination station, and timestamp.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Arrival Detection</h3>
                  <p>
                    Arrival times are calculated using the Haversine formula to determine when each train
                    reaches minimum distance to its scheduled station stop.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Delay Classification</h3>
                  <ul className="mt-1 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> On-time: within 4 min
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" /> Minor: 5-14 min late
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" /> Major: 15+ min late
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data freshness */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400 dark:text-gray-500">
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
