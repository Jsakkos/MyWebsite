"use client";

import { useCaltrainStats } from "@/hooks/useCaltrain";
import { Clock, AlertTriangle, CheckCircle, Database, TrendingUp } from "lucide-react";
import Link from "next/link";

export function CaltrainDashboard() {
  const { data: stats, loading } = useCaltrainStats();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded dark:bg-gray-700" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-gray-600 dark:text-gray-400">Unable to load Caltrain data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key metric */}
      <div className="text-center">
        <div className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">
          {stats.on_time_percentage.toFixed(1)}%
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Overall On-Time Performance</p>
      </div>

      {/* Performance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On Time</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.on_time_percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Minor Delays</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.minor_delay_percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Major Delays</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.major_delay_percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex items-center gap-2">
          <Database className="h-3 w-3" />
          <span>
            {stats.total_arrivals.toLocaleString()} arrivals tracked over {stats.days_tracked} days
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>
            {new Date(stats.date_range.start).toLocaleDateString()} - {new Date(stats.date_range.end).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/projects/caltrain-tracker/dashboard"
        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <TrendingUp className="h-4 w-4" />
        View Full Dashboard
      </Link>
    </div>
  );
}
