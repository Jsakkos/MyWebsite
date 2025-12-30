import { NextResponse } from 'next/server';
import { caltrainApi } from '@/lib/api';

export async function GET() {
  try {
    const health = await caltrainApi.getHealthCheck();
    return NextResponse.json({
      status: 'healthy',
      backend_status: health.status,
      timestamp: new Date().toISOString(),
      api_available: true
    });
  } catch (error) {
    console.error('Caltrain API health check failed:', error);
    
    return NextResponse.json({
      status: 'degraded',
      backend_status: 'unavailable',
      timestamp: new Date().toISOString(),
      api_available: false,
      error: 'Backend API is not accessible'
    }, { status: 503 });
  }
}