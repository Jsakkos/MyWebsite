import { NextResponse } from 'next/server';
import { getStaticCaltrainStats } from '@/lib/api';

export async function GET() {
  try {
    const stats = await getStaticCaltrainStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch Caltrain stats:', error);
    return NextResponse.json(
      { error: 'Failed to load stats' },
      { status: 500 }
    );
  }
}