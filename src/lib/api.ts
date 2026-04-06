// API configuration and client for Caltrain data
// Static data is the primary source (pushed from server via export script)
const STATIC_DATA_PATH = '/data/caltrain';
const CALTRAIN_API_BASE = process.env.NEXT_PUBLIC_CALTRAIN_API_URL || '';

// --- Core Types ---

export interface CaltrainStats {
  on_time_percentage: number;
  minor_delay_percentage: number;
  major_delay_percentage: number;
  total_arrivals: number;
  avg_delay_minutes: number;
  median_delay_minutes: number;
  last_updated: string;
  date_range: {
    start: string;
    end: string;
  };
  days_tracked: number;
  rolling_7d_on_time: number;
  rolling_30d_on_time: number;
}

export interface DailyPerformance {
  date: string;
  total_trips: number;
  on_time_count: number;
  minor_count: number;
  major_count: number;
  avg_delay_min: number;
  on_time_pct: number;
  minor_pct: number;
  major_pct: number;
}

export interface StationPerformance {
  stop_id: number;
  stop_name: string;
  total_arrivals: number;
  on_time_count: number;
  avg_delay_min: number;
  median_delay_min: number;
  on_time_pct: number;
  stop_lat: number;
  stop_lon: number;
}

export interface TrainPerformance {
  trip_id: number;
  total_stops: number;
  on_time_count: number;
  avg_delay_min: number;
  days_observed: number;
  on_time_pct: number;
}

export interface HeatmapCell {
  day_of_week: number;
  day_name: string;
  hour: number;
  total: number;
  on_time_count: number;
  avg_delay_min: number;
  on_time_pct: number;
}

export interface CommutePeriodStats {
  total_trips: number;
  on_time_pct: number;
  minor_pct: number;
  major_pct: number;
  avg_delay_min: number;
  median_delay_min: number;
}

export interface CommuteAnalysis {
  [period: string]: CommutePeriodStats;
}

export interface WeeklySummary {
  week_start: string;
  total_trips: number;
  on_time_count: number;
  avg_delay_min: number;
  days_with_data: number;
  on_time_pct: number;
}

export interface MonthlySummary {
  month: string;
  total_trips: number;
  on_time_count: number;
  avg_delay_min: number;
  days_with_data: number;
  on_time_pct: number;
}

export interface DelayData {
  date: string;
  hour: number;
  avg_delay_minutes: number;
  on_time_count: number;
  delay_count: number;
}

export interface CaltrainApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface CaltrainMetadata {
  last_updated: string;
  source: string;
}

// --- API Client (for live data from self-hosted server) ---

class CaltrainApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = CALTRAIN_API_BASE) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getOverallStats(): Promise<CaltrainStats> {
    return this.request<CaltrainStats>('/stats/overall');
  }

  async getDelaysByHour(days: number = 30): Promise<DelayData[]> {
    return this.request<DelayData[]>(`/stats/delays-by-hour?days=${days}`);
  }

  async getStationPerformance(days: number = 30): Promise<StationPerformance[]> {
    return this.request<StationPerformance[]>(`/stats/station-performance?days=${days}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getCommuteDelays(days: number = 30): Promise<any> {
    return this.request(`/stats/commute-delays?days=${days}`);
  }

  async getHealthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
}

export const caltrainApi = new CaltrainApiClient();

export async function isCaltrainApiAvailable(): Promise<boolean> {
  try {
    await caltrainApi.getHealthCheck();
    return true;
  } catch {
    return false;
  }
}

// --- Static Data Loaders (primary data source) ---

async function fetchStaticJson<T>(filename: string): Promise<T | null> {
  try {
    const response = await fetch(`${STATIC_DATA_PATH}/${filename}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function getStaticCaltrainStats(): Promise<CaltrainStats | null> {
  return fetchStaticJson<CaltrainStats>('stats.json');
}

export async function getStaticDailyPerformance(): Promise<DailyPerformance[] | null> {
  return fetchStaticJson<DailyPerformance[]>('daily_performance.json');
}

export async function getStaticStationPerformance(): Promise<StationPerformance[] | null> {
  return fetchStaticJson<StationPerformance[]>('station_performance.json');
}

export async function getStaticTrainPerformance(): Promise<TrainPerformance[] | null> {
  return fetchStaticJson<TrainPerformance[]>('train_performance.json');
}

export async function getStaticHeatmap(): Promise<HeatmapCell[] | null> {
  return fetchStaticJson<HeatmapCell[]>('hourly_heatmap.json');
}

export async function getStaticCommuteAnalysis(): Promise<CommuteAnalysis | null> {
  return fetchStaticJson<CommuteAnalysis>('commute_analysis.json');
}

export async function getStaticWeeklySummary(): Promise<WeeklySummary[] | null> {
  return fetchStaticJson<WeeklySummary[]>('weekly_summary.json');
}

export async function getStaticMonthlySummary(): Promise<MonthlySummary[] | null> {
  return fetchStaticJson<MonthlySummary[]>('monthly_summary.json');
}

export async function getCaltrainMetadata(): Promise<CaltrainMetadata | null> {
  return fetchStaticJson<CaltrainMetadata>('metadata.json');
}

export function getCaltrainPlotPaths() {
  return {
    dailyStats: `${STATIC_DATA_PATH}/plots/daily_stats.html`,
    commuteDelay: `${STATIC_DATA_PATH}/plots/commute_delay.html`,
    onTimeHeatmap: `${STATIC_DATA_PATH}/plots/on_time_heatmap.html`,
    onTimeHeatmap2025: `${STATIC_DATA_PATH}/plots/on_time_heatmap_2025.html`,
  };
}

// --- Mock data for fallback ---

export const mockCaltrainStats: CaltrainStats = {
  on_time_percentage: 83.87,
  minor_delay_percentage: 14.61,
  major_delay_percentage: 1.52,
  total_arrivals: 3428,
  avg_delay_minutes: 2.37,
  median_delay_minutes: 2.37,
  last_updated: new Date().toISOString(),
  date_range: {
    start: '2024-11-29',
    end: '2025-03-14',
  },
  days_tracked: 106,
  rolling_7d_on_time: 90.85,
  rolling_30d_on_time: 90.24,
};

export const mockDelayData: DelayData[] = [
  { date: '2024-12-08', hour: 6, avg_delay_minutes: 2.3, on_time_count: 45, delay_count: 8 },
  { date: '2024-12-08', hour: 7, avg_delay_minutes: 4.1, on_time_count: 52, delay_count: 15 },
  { date: '2024-12-08', hour: 8, avg_delay_minutes: 6.8, on_time_count: 38, delay_count: 22 },
  { date: '2024-12-08', hour: 17, avg_delay_minutes: 8.2, on_time_count: 41, delay_count: 28 },
  { date: '2024-12-08', hour: 18, avg_delay_minutes: 7.1, on_time_count: 44, delay_count: 24 },
  { date: '2024-12-08', hour: 19, avg_delay_minutes: 5.3, on_time_count: 49, delay_count: 18 },
];
