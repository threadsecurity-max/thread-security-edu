import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'threads-edu-lms',
  });
}
