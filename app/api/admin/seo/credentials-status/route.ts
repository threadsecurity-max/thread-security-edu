import { NextResponse } from 'next/server';
import { getGcpCredentialStatus } from '@/lib/gcp/gcpClient';

export async function GET() {
  try {
    const status = getGcpCredentialStatus();
    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to check GCP credential status' },
      { status: 500 }
    );
  }
}
