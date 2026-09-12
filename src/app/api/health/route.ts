import { NextResponse } from 'next/server';
import { imageProcessingGate } from '@/lib/security/concurrency';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MJImage Core Image Processing Engine',
    concurrency: imageProcessingGate.stats,
  });
}
