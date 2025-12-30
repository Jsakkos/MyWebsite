"use client";

import { useState, useEffect } from 'react';
import { CaltrainStats, DelayData, mockCaltrainStats, mockDelayData } from '@/lib/api';

interface UseCaltrainStatsResult {
  data: CaltrainStats | null;
  loading: boolean;
  error: string | null;
  isApiAvailable: boolean;
}

interface UseCaltrainDelaysResult {
  data: DelayData[] | null;
  loading: boolean;
  error: string | null;
  isApiAvailable: boolean;
}

export function useCaltrainStats(): UseCaltrainStatsResult {
  const [data, setData] = useState<CaltrainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiAvailable, setIsApiAvailable] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/caltrain/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const stats = await response.json();
        setData(stats);
        setIsApiAvailable(true);
      } catch (err) {
        console.error('Error fetching Caltrain stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Use mock data as fallback
        setData(mockCaltrainStats);
        setIsApiAvailable(false);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { data, loading, error, isApiAvailable };
}

export function useCaltrainDelays(days: number = 30): UseCaltrainDelaysResult {
  const [data, setData] = useState<DelayData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiAvailable, setIsApiAvailable] = useState(false);

  useEffect(() => {
    async function fetchDelays() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/caltrain/delays?days=${days}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch delay data');
        }

        const delays = await response.json();
        setData(delays);
        setIsApiAvailable(true);
      } catch (err) {
        console.error('Error fetching Caltrain delays:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Use mock data as fallback
        setData(mockDelayData);
        setIsApiAvailable(false);
      } finally {
        setLoading(false);
      }
    }

    fetchDelays();
  }, [days]);

  return { data, loading, error, isApiAvailable };
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
      } catch (error) {
        console.error('Health check failed:', error);
        setIsHealthy(false);
      } finally {
        setLoading(false);
      }
    }

    checkHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { isHealthy, loading };
}