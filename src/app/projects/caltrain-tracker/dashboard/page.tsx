"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, Download, ExternalLink } from "lucide-react";
import { CaltrainDashboard } from "@/components/caltrain-dashboard";
import { useCaltrainStats, useCaltrainDelays } from "@/hooks/useCaltrain";
import { useState } from "react";

export default function CaltrainDashboardPage() {
  const [refreshing, setRefreshing] = useState(false);
  const { data: stats, loading } = useCaltrainStats();
  const { data: delays } = useCaltrainDelays(30); // Last 30 days

  const handleRefresh = async () => {
    setRefreshing(true);
    // Force a page refresh to reload data
    window.location.reload();
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/projects/caltrain-tracker"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to project details
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Caltrain Performance Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                Real-time analytics and historical performance data for the Caltrain system
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              <Link
                href="/api/caltrain/stats"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
                Export Data
              </Link>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="space-y-8">
          {/* Core Dashboard Component */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CaltrainDashboard />
          </div>

          {/* Extended Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Historical Trends */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Historical Performance Trends
              </h3>
              {delays && delays.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Average delay by hour of day (last 30 days)
                  </div>
                  <div className="space-y-2">
                    {delays.slice(0, 10).map((delay, index) => {
                      const onTimeRate = (delay.on_time_count / (delay.on_time_count + delay.delay_count)) * 100;
                      return (
                        <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {delay.hour.toString().padStart(2, '0')}:00
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {delay.avg_delay_minutes.toFixed(1)}m
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${onTimeRate}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                              {onTimeRate.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Loading historical data...
                </div>
              )}
            </div>

            {/* Data Information */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                About This Data
              </h3>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Data Collection</h4>
                  <p>Real-time train location data collected every minute from the 511.org GTFS-RT API.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Performance Metrics</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>On-time: Arrivals within 4 minutes of schedule</li>
                    <li>Minor delays: 5-14 minutes late</li>
                    <li>Major delays: 15+ minutes late</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Database Size</h4>
                  <p>Currently storing 200MB+ of historical performance data.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Update Frequency</h4>
                  <p>Data is processed and updated every 5 minutes with real-time arrivals.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Technical Implementation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Backend Services</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Python FastAPI application</li>
                  <li>• PostgreSQL database</li>
                  <li>• Prefect workflow orchestration</li>
                  <li>• Docker containerization</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Data Processing</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Real-time GTFS-RT parsing</li>
                  <li>• Geospatial arrival detection</li>
                  <li>• Automated delay calculation</li>
                  <li>• Performance aggregation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Frontend Integration</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Next.js React application</li>
                  <li>• REST API consumption</li>
                  <li>• Real-time data updates</li>
                  <li>• Responsive visualizations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/projects/caltrain-tracker"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Learn About the Project
            </Link>
            <Link
              href="https://github.com/jsakkos/caltrain-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ExternalLink className="h-4 w-4" />
              View Source Code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}