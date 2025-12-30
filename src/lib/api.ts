// API configuration and client for Caltrain data
// Static data is now the primary source (pushed from server hourly)
const STATIC_DATA_PATH = '/data/caltrain';
const CALTRAIN_API_BASE = process.env.NEXT_PUBLIC_CALTRAIN_API_URL || '';

export interface CaltrainStats {
  on_time_percentage: number;
  minor_delay_percentage: number;
  major_delay_percentage: number;
  total_arrivals: number;
  last_updated: string;
  date_range: {
    start: string;
    end: string;
  };
}

export interface DelayData {
  date: string;
  hour: number;
  avg_delay_minutes: number;
  on_time_count: number;
  delay_count: number;
}

export interface StationPerformance {
  station_id: string;
  station_name: string;
  on_time_percentage: number;
  avg_delay_minutes: number;
  total_arrivals: number;
}

export interface CaltrainApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

class CaltrainApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = CALTRAIN_API_BASE) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
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

// Helper function to check if API is available
export async function isCaltrainApiAvailable(): Promise<boolean> {
  try {
    await caltrainApi.getHealthCheck();
    return true;
  } catch {
    return false;
  }
}

// Mock data for development/fallback
export const mockCaltrainStats: CaltrainStats = {
  on_time_percentage: 87.3,
  minor_delay_percentage: 8.1,
  major_delay_percentage: 4.6,
  total_arrivals: 15420,
  last_updated: new Date().toISOString(),
  date_range: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  },
};

export const mockDelayData: DelayData[] = [
  { date: '2024-12-08', hour: 6, avg_delay_minutes: 2.3, on_time_count: 45, delay_count: 8 },
  { date: '2024-12-08', hour: 7, avg_delay_minutes: 4.1, on_time_count: 52, delay_count: 15 },
  { date: '2024-12-08', hour: 8, avg_delay_minutes: 6.8, on_time_count: 38, delay_count: 22 },
  { date: '2024-12-08', hour: 17, avg_delay_minutes: 8.2, on_time_count: 41, delay_count: 28 },
  { date: '2024-12-08', hour: 18, avg_delay_minutes: 7.1, on_time_count: 44, delay_count: 24 },
  { date: '2024-12-08', hour: 19, avg_delay_minutes: 5.3, on_time_count: 49, delay_count: 18 },
];

// Static data loading functions (primary data source)
export async function getStaticCaltrainStats(): Promise<CaltrainStats> {
  try {
    const response = await fetch(`${STATIC_DATA_PATH}/stats.json`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!response.ok) throw new Error('Failed to load static stats');
    return response.json();
  } catch (error) {
    console.warn('Static stats not available, using mock data:', error);
    return mockCaltrainStats;
  }
}

export interface CaltrainMetadata {
  last_updated: string;
  source: string;
}

export async function getCaltrainMetadata(): Promise<CaltrainMetadata | null> {
  try {
    const response = await fetch(`${STATIC_DATA_PATH}/metadata.json`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

// Get available plot filenames
export function getCaltrainPlotPaths() {
  return {
    dailyStats: `${STATIC_DATA_PATH}/plots/daily_stats.html`,
    commuteDelay: `${STATIC_DATA_PATH}/plots/commute_delay.html`,
    onTimeHeatmap: `${STATIC_DATA_PATH}/plots/on_time_heatmap.html`,
    onTimeHeatmap2025: `${STATIC_DATA_PATH}/plots/on_time_heatmap_2025.html`,
  };
}