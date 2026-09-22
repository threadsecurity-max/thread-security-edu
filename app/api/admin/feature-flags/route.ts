import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/server/database/transaction-manager';
import { FeatureFlagSchema } from '@/lib/security/validation.schemas';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'tse-lms-super-secret-jwt-key-2026' });

    if (!token || !token.sub) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const userRole = (token.role as string) || 'GUEST';
    if (!['SUPER_ADMIN', 'SECURITY_ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const flags = await (prisma as any).featureFlag.findMany({
      orderBy: { key: 'asc' },
    });

    return NextResponse.json({
      success: true,
      flags,
    });
  } catch (error: any) {
    console.error('[Feature Flags GET Error]:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed fetching feature flags' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || 'tse-lms-super-secret-jwt-key-2026' });

    if (!token || !token.sub) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const userRole = (token.role as string) || 'GUEST';
    if (!['SUPER_ADMIN', 'SECURITY_ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = FeatureFlagSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', details: parseResult.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const flagData = parseResult.data;

    const updatedFlag = await (prisma as any).featureFlag.upsert({
      where: { key: flagData.key },
      create: {
        key: flagData.key,
        description: flagData.description || null,
        isEnabled: flagData.isEnabled,
        targetRoles: flagData.targetRoles,
        percentage: flagData.percentage,
      },
      update: {
        description: flagData.description || null,
        isEnabled: flagData.isEnabled,
        targetRoles: flagData.targetRoles,
        percentage: flagData.percentage,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: token.sub,
        action: 'FEATURE_FLAG_UPDATED',
        entity: 'FeatureFlag',
        entityId: updatedFlag.id,
        details: `Feature flag ${flagData.key} set to isEnabled=${flagData.isEnabled}`,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Feature flag '${flagData.key}' updated successfully.`,
      flag: updatedFlag,
    });
  } catch (error: any) {
    console.error('[Feature Flags POST Error]:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed updating feature flag' } },
      { status: 500 }
    );
  }
}
