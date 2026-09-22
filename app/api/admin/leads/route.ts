import { NextResponse } from 'next/server';
import { prisma } from '@/server/database/prisma';

export async function GET(req: Request) {
  try {
    const leads = await (prisma as any).lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      take: 100,
    });

    const stats = {
      total: leads.length,
      highIntent: leads.filter((l: any) => (l.aiScore || 0) >= 75).length,
      newLeads: leads.filter((l: any) => l.status === 'NEW').length,
      enrolled: leads.filter((l: any) => l.status === 'ENROLLED').length,
    };

    return NextResponse.json({ success: true, leads, stats });
  } catch (error: any) {
    console.error('[Admin Leads API] Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { leadId, status, notes } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    const updatedLead = await (prisma as any).lead.update({
      where: { id: leadId },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
        activities: {
          create: {
            action: 'STATUS_UPDATED',
            details: `Status updated to ${status}${notes ? `. Notes: ${notes}` : ''}`,
          },
        },
      },
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error('[Admin Leads API] Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead status.' },
      { status: 500 }
    );
  }
}
