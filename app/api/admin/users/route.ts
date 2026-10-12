import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import {
  getNextSuggestedTSID,
  getNextSuggestedMentorID,
  getNextSuggestedStaffOrAdminID,
  createUserService,
  updateUserService,
  deleteUserService,
  toggleStudentDashboardAccessService,
} from '@/server/services/admin.service';
import { StudentTrack } from '@/lib/auth/ts-id';
import { RoleType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'SECURITY_ADMIN', 'ACADEMIC_ADMIN', 'CONTENT_MANAGER'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'suggested-id') {
      const role = (searchParams.get('role') || 'STUDENT') as RoleType;
      const track = (searchParams.get('track') || 'CYBER') as StudentTrack;

      let tsId: string;
      if (role === 'STUDENT') {
        tsId = await getNextSuggestedTSID(track === 'AI' ? 'AI' : 'CYBER');
      } else if (role === 'MENTOR') {
        tsId = await getNextSuggestedMentorID();
      } else {
        tsId = await getNextSuggestedStaffOrAdminID(role as any);
      }

      return NextResponse.json({ success: true, tsId });
    }

    return NextResponse.json({ success: false, error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/admin/users GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed processing request' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required to provision users.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      role,
      department,
      batchId,
      track,
      customTsId,
      passkey,
      secretKey,
      dispatchEmail,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required fields.' },
        { status: 400 }
      );
    }

    const res = await createUserService({
      name,
      email,
      phone: phone || undefined,
      role,
      department: department || undefined,
      batchId: role === 'STUDENT' || role === 'MENTOR' ? batchId : undefined,
      track: track || 'CYBER',
      customTsId: customTsId || undefined,
      passkey: passkey || undefined,
      secretKey: secretKey || undefined,
      dispatchEmail: dispatchEmail !== false,
      actorId: session.userId,
    });

    revalidatePath('/admin');
    revalidatePath('/admin/users');
    revalidatePath('/admin/students');
    revalidatePath('/admin/mentors');

    return NextResponse.json({
      success: true,
      user: res.user,
      tsId: res.tsId,
    });
  } catch (error: any) {
    console.error('[API /api/admin/users POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed creating user account.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ACADEMIC_ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required to update users.' },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (body.action === 'toggle-access') {
      const { userId, grant } = body;
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
      }

      const updated = await toggleStudentDashboardAccessService(userId, !!grant, session.userId);
      revalidatePath('/admin');
      revalidatePath('/admin/users');
      revalidatePath('/admin/students');

      return NextResponse.json({ success: true, user: updated });
    }

    const { userId, ...updateData } = body;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const updated = await updateUserService(userId, {
      ...updateData,
      actorId: session.userId,
    });

    revalidatePath('/admin');
    revalidatePath('/admin/users');
    revalidatePath('/admin/students');
    revalidatePath('/admin/mentors');

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('[API /api/admin/users PUT Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed updating user account.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Security restriction: Only Super Administrators can delete user accounts.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    let userId = searchParams.get('id');

    if (!userId) {
      try {
        const body = await req.json();
        userId = body.userId;
      } catch {
        // no json body
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required for deletion.' }, { status: 400 });
    }

    const res = await deleteUserService(userId, session.userId);

    revalidatePath('/admin');
    revalidatePath('/admin/users');
    revalidatePath('/admin/students');
    revalidatePath('/admin/mentors');

    return NextResponse.json({
      success: true,
      deletedName: res.deletedName,
      deletedEmail: res.deletedEmail,
    });
  } catch (error: any) {
    console.error('[API /api/admin/users DELETE Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed deleting user account.' },
      { status: 500 }
    );
  }
}
