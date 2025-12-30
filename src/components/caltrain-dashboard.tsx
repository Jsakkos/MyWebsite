"use client";

import { useCaltrainStats, useCaltrainDelays, useApiHealth } from '@/hooks/useCaltrain';
import { Clock, TrendingUp, AlertTriangle, CheckCircle, ExternalLink, Database } from 'lucide-react';
import Link from 'next/link';

interface PerformanceCardProps {
  title: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

function PerformanceCard({ title, value, unit = '%', icon, color, description }: PerformanceCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value.toFixed(1)}{unit}
          </p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ApiStatusBanner({ isHealthy, loading }: { isHealthy: boolean | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse mr-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Checking API status...</p>
        </div>
      </div>
    );
  }

  if (isHealthy) {
    return (
      <div className="rounded-md bg-green-50 p-3 dark:bg-green-900/20">
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          <p className="text-sm text-green-800 dark:text-green-400">
            Live data from self-hosted Caltrain tracker
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
      <div className="flex items-center">
        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
        <p className="text-sm text-yellow-800 dark:text-yellow-400">
          Showing sample data - live API temporarily unavailable
        </p>
      </div>
    </div>
  );
}

export function CaltrainDashboard() {
  const { data: stats, loading: statsLoading, isApiAvailable } = useCaltrainStats();
  const { data: delays, loading: delaysLoading } = useCaltrainDelays(7); // Last 7 days
  const { isHealthy, loading: healthLoading } = useApiHealth();

  if (statsLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded dark:bg-gray-700"></div>
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
      {/* API Status */}
      <ApiStatusBanner isHealthy={isHealthy} loading={healthLoading} />

      {/* Performance Summary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PerformanceCard
            title="On-Time Performance"
            value={stats.on_time_percentage}
            icon={<CheckCircle className="h-4 w-4 text-white" />}
            color="bg-green-500"
            description={`${stats.total_arrivals.toLocaleString()} total arrivals`}
          />
          <PerformanceCard
            title="Minor Delays"
            value={stats.minor_delay_percentage}
            icon={<Clock className="h-4 w-4 text-white" />}
            color="bg-yellow-500"
            description="5-14 minutes late"
          />
          <PerformanceCard
            title="Major Delays"
            value={stats.major_delay_percentage}
            icon={<AlertTriangle className="h-4 w-4 text-white" />}
            color="bg-red-500"
            description="15+ minutes late"
          />
        </div>
      </div>

      {/* Recent Trends */}
      {delays && delays.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Delay Trends
          </h3>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="space-y-2">
              {delays.slice(0, 3).map((delay, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Hour {delay.hour}:00
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {delay.on_time_count + delay.delay_count} trains
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {delay.avg_delay_minutes.toFixed(1)} min avg
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {((delay.on_time_count / (delay.on_time_count + delay.delay_count)) * 100).toFixed(0)}% on-time
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex items-center gap-2">
          <Database className="h-3 w-3" />
          <span>
            Data range: {new Date(stats.date_range.start).toLocaleDateString()} - {new Date(stats.date_range.end).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>Last updated: {new Date(stats.last_updated).toLocaleString()}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/projects/caltrain-tracker/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <TrendingUp className="h-4 w-4" />
          View Full Dashboard
        </Link>
        <Link
          href="https://github.com/jsakkos/caltrain-tracker"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ExternalLink className="h-4 w-4" />
          View Source Code
        </Link>
      </div>
    </div>
  );
}