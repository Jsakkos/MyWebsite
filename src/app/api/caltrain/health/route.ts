import { NextResponse } from 'next/server';
import { getCaltrainMetadata } from '@/lib/api';

export async function GET() {
  try {
    const metadata = await getCaltrainMetadata();

    if (metadata) {
      return NextResponse.json({
        status: 'healthy',
        data_source: 'static',
        last_updated: metadata.last_updated,
        timestamp: new Date().toISOString(),
        api_available: true
      });
    }

    // Static data not yet available
    return NextResponse.json({
      status: 'pending',
      data_source: 'static',
      timestamp: new Date().toISOString(),
      api_available: false,
      message: 'Static data not yet deployed'
    });
  } catch (error) {
    console.error('Caltrain health check failed:', error);

    return NextResponse.json({
      status: 'degraded',
      data_source: 'static',
      timestamp: new Date().toISOString(),
      api_available: false,
      error: 'Failed to check static data availability'
    }, { status: 503 });
  }
}