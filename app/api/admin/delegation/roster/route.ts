import { NextResponse } from 'next/server';
import { getDelegationWorkspaceDataService } from '@/server/services/delegation.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getDelegationWorkspaceDataService();
    return NextResponse.json({
      success: true,
      employees: data.employees,
      teams: data.teams,
      availableModules: data.availableModules,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch delegation roster' },
      { status: 500 }
    );
  }
}

