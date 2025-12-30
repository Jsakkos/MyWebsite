import { NextRequest, NextResponse } from 'next/server';
import { caltrainApi, mockDelayData } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    
    const delays = await caltrainApi.getDelaysByHour(days);
    return NextResponse.json(delays);
  } catch (error) {
    console.error('Failed to fetch Caltrain delay data:', error);
    
    // Return mock data as fallback
    return NextResponse.json(mockDelayData);
  }
}