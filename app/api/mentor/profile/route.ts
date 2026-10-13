import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma as db } from '@/server/database/prisma';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    let mentor = await db.mentorProfile.findUnique({
      where: { userId: session.userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    if (!mentor) {
      const user = await db.user.findUnique({ where: { id: session.userId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      mentor = await db.mentorProfile.create({
        data: {
          userId: user.id,
          title: 'Security Mentor',
          company: 'Thread Security',
          bio: 'Cybersecurity Instructor & Content Author',
          expertise: 'Threat Intelligence & Security Engineering',
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: mentor.id,
        userId: mentor.userId,
        name: mentor.user.name,
        email: mentor.user.email,
        avatarUrl: mentor.user.avatarUrl,
        title: mentor.title,
        company: mentor.company,
        bio: mentor.bio,
        expertise: mentor.expertise,
        linkedinUrl: (mentor as any).linkedinUrl || null,
        mediumUrl: (mentor as any).mediumUrl || null,
        twitterUrl: (mentor as any).twitterUrl || null,
        githubUrl: (mentor as any).githubUrl || null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching mentor profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch mentor profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'MENTOR' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACADEMIC_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      avatarUrl,
      title,
      company,
      bio,
      expertise,
      linkedinUrl,
      mediumUrl,
      twitterUrl,
      githubUrl,
    } = body;

    // Update User table if name or avatarUrl changed
    if (name !== undefined || avatarUrl !== undefined) {
      await db.user.update({
        where: { id: session.userId },
        data: {
          ...(name !== undefined && { name: name.trim() }),
          ...(avatarUrl !== undefined && { avatarUrl: avatarUrl ? avatarUrl.trim() : null }),
        },
      });
    }

    // Update or create MentorProfile
    let mentor = await db.mentorProfile.findUnique({
      where: { userId: session.userId },
    });

    if (mentor) {
      mentor = await db.mentorProfile.update({
        where: { id: mentor.id },
        data: {
          ...(title !== undefined && { title: title.trim() }),
          ...(company !== undefined && { company: company.trim() }),
          ...(bio !== undefined && { bio: bio.trim() }),
          ...(expertise !== undefined && { expertise: expertise.trim() }),
          ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl ? linkedinUrl.trim() : null }),
          ...(mediumUrl !== undefined && { mediumUrl: mediumUrl ? mediumUrl.trim() : null }),
          ...(twitterUrl !== undefined && { twitterUrl: twitterUrl ? twitterUrl.trim() : null }),
          ...(githubUrl !== undefined && { githubUrl: githubUrl ? githubUrl.trim() : null }),
        } as any,
      });
    } else {
      mentor = await db.mentorProfile.create({
        data: {
          userId: session.userId,
          title: title || 'Faculty Mentor',
          company: company || 'Thread Security',
          bio: bio || 'Cybersecurity Instructor & Content Author',
          expertise: expertise || 'Threat Intelligence, SOC & Web Security',
          linkedinUrl: linkedinUrl || null,
          mediumUrl: mediumUrl || null,
          twitterUrl: twitterUrl || null,
          githubUrl: githubUrl || null,
        } as any,
      });
    }

    // Revalidate public blog paths so new author creds immediately reflect
    try {
      revalidatePath('/blog');
      revalidatePath('/blog/[slug]', 'page');
      revalidatePath('/');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Author profile credentials updated successfully',
      profile: {
        ...mentor,
        name: name || undefined,
        avatarUrl: avatarUrl || undefined,
      },
    });
  } catch (error: any) {
    console.error('Error updating mentor profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to update author credentials' }, { status: 500 });
  }
}
