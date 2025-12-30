import { NextRequest, NextResponse } from 'next/server';
import { caltrainApi, mockCaltrainStats } from '@/lib/api';

export async function GET() {
  try {
    const stats = await caltrainApi.getOverallStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch Caltrain stats:', error);
    
    // Return mock data as fallback
    return NextResponse.json(mockCaltrainStats);
  }
}