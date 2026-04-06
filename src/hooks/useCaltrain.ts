"use client";

import { useState, useEffect } from 'react';
import type {
  CaltrainStats,
  DailyPerformance,
  StationPerformance,
  TrainPerformance,
  HeatmapCell,
  CommuteAnalysis,
  WeeklySummary,
  MonthlySummary,
  DelayData,
  Incident,
  IncidentDetail,
} from '@/lib/api';
import {
  mockCaltrainStats,
  mockDelayData,
  getStaticCaltrainStats,
  getStaticDailyPerformance,
  getStaticStationPerformance,
  getStaticTrainPerformance,
  getStaticHeatmap,
  getStaticCommuteAnalysis,
  getStaticWeeklySummary,
  getStaticMonthlySummary,
  getStaticIncidents,
  getStaticIncidentTrajectories,
} from '@/lib/api';

// Generic hook for fetching static JSON data
function useStaticData<T>(
  fetcher: () => Promise<T | null>,
  fallback?: T,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const result = await fetcher();
        if (!cancelled) {
          setData(result ?? fallback ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          if (fallback) setData(fallback);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error };
}

// --- Individual hooks ---

export function useCaltrainStats() {
  const result = useStaticData<CaltrainStats>(getStaticCaltrainStats, mockCaltrainStats);
  return { ...result, isApiAvailable: !!result.data && !result.error };
}

export function useCaltrainDailyPerformance() {
  return useStaticData<DailyPerformance[]>(getStaticDailyPerformance);
}

export function useCaltrainStations() {
  return useStaticData<StationPerformance[]>(getStaticStationPerformance);
}

export function useCaltrainTrains() {
  return useStaticData<TrainPerformance[]>(getStaticTrainPerformance);
}

export function useCaltrainHeatmap() {
  return useStaticData<HeatmapCell[]>(getStaticHeatmap);
}

export function useCaltrainCommute() {
  return useStaticData<CommuteAnalysis>(getStaticCommuteAnalysis);
}

export function useCaltrainWeekly() {
  return useStaticData<WeeklySummary[]>(getStaticWeeklySummary);
}

export function useCaltrainMonthly() {
  return useStaticData<MonthlySummary[]>(getStaticMonthlySummary);
}

export function useCaltrainIncidents() {
  return useStaticData<Incident[]>(getStaticIncidents);
}

export function useCaltrainIncidentTrajectories() {
  return useStaticData<Record<string, IncidentDetail>>(getStaticIncidentTrajectories);
}

// Legacy hooks for backward compatibility
export function useCaltrainDelays(days: number = 30) {
  const [data, setData] = useState<DelayData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDelays() {
      try {
        setLoading(true);
        const response = await fetch(`/api/caltrain/delays?days=${days}`);
        if (!response.ok) throw new Error('Failed to fetch delay data');
        setData(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(mockDelayData);
      } finally {
        setLoading(false);
      }
    }
    fetchDelays();
  }, [days]);

  return { data, loading, error, isApiAvailable: !error };
}

export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        setLoading(true);
        const response = await fetch('/api/caltrain/health');
        const health = await response.json();
        setIsHealthy(health.api_available);
      } catch {
        setIsHealthy(false);
      } finally {
        setLoading(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { isHealthy, loading };
}
