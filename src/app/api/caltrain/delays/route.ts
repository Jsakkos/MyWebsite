import { NextResponse } from 'next/server';
import { mockDelayData } from '@/lib/api';

export async function GET() {
  // Static delays data would come from stats.json or a separate delays.json
  // For now, return mock data until the export script populates real data
  return NextResponse.json(mockDelayData);
}