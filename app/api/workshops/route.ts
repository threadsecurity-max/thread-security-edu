import { NextResponse } from 'next/server';
import { prisma } from '@/server/database/prisma';
import { getSession } from '@/lib/auth/session';

// ── SECURITY SANITIZATION & EXPLOIT PREVENTION HELPERS ──

/**
 * Sanitizes plain text input by stripping HTML/script tags and enforcing max length.
 * Prevents Stored XSS and payload flooding attacks.
 */
function sanitizeText(str: any, maxLength = 500): string {
  if (typeof str !== 'string') return '';
  const clean = str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
  return clean.slice(0, maxLength);
}

/**
 * Validates and sanitizes URLs to prevent JavaScript protocol XSS and malicious redirections.
 * Only allows http://, https://, or relative internal routes starting with /
 */
function sanitizeUrl(urlStr: any, isImage = false): string | null {
  if (typeof urlStr !== 'string' || !urlStr.trim()) return null;
  const trimmed = urlStr.trim();

  // Allow safe base64 images (png, jpeg, webp, jpg) but reject dangerous executable data URIs
  if (isImage && /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    // Limit max base64 size (max 4MB) to prevent Memory Exhaustion DoS
    if (trimmed.length > 4 * 1024 * 1024) return null;
    return trimmed;
  }

  // Allow relative internal links starting with / (excluding // protocol-relative smuggling)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    if (/javascript:/i.test(trimmed)) return null;
    return trimmed.slice(0, 1000);
  }

  // Enforce http/https protocols for external URLs
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href.slice(0, 1000);
    }
  } catch (e) {
    return null;
  }

  return null;
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

const initialSeedWorkshops = [
  {
    id: 'ct-institution-2026',
    title: 'Adversary Simulation Masterclass at CT Institution',
    subtitle: 'CT Institution Campus, Jalandhar • Live Red Teaming & Cyber Defense',
    category: 'Red Teaming',
    date: 'Aug 14, 2026',
    time: '10:00 AM - 4:00 PM IST',
    duration: 'Full Day Masterclass',
    level: 'Advanced',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
    driveUrl: 'https://drive.google.com/drive/folders/thread-security-ct-institution-2026',
    linkedinUrl: 'https://www.linkedin.com/company/thread-security/',
    registrationUrl: '/contact?topic=workshop-registration&id=ct-institution-2026',
    instructorName: 'Kunal Singh',
    instructorRole: 'Lead Security Architect',
    description:
      'An intensive hands-on adversary simulation workshop conducted live at CT Institution. Covered Active Directory Kerberoasting, BloodHound graph analysis, and EDR memory unhooking.',
    highlights: JSON.stringify([
      'Live execution of Kerberoasting & Golden Ticket attacks',
      'EDR bypass & memory unhooking demonstration',
      'Issued 350+ verified student completion certificates',
    ]),
    attendeesCount: 350,
    status: 'Completed',
  },
  {
    id: 'ebpf-kernel-security-2026',
    title: 'eBPF & Linux Kernel Threat Detection Masterclass',
    subtitle: 'Thread Security Innovation Hub • Cloud Native Runtime Security',
    category: 'Cloud & eBPF',
    date: 'Sept 24, 2026',
    time: '6:00 PM - 9:00 PM IST',
    duration: '3 Hours (Live + Lab)',
    level: 'Advanced',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
    driveUrl: 'https://drive.google.com/drive/folders/thread-security-ebpf-2026',
    linkedinUrl: 'https://www.linkedin.com/company/thread-security/',
    registrationUrl: '/contact?topic=workshop-registration&id=ebpf-kernel-security-2026',
    instructorName: 'Vikramaditya Sharma',
    instructorRole: 'Principal Cloud Security Engineer',
    description:
      'Deep dive into Linux kernel instrumentation using eBPF, Cilium, and Tetragon. Learn to write custom kernel probes to detect zero-day container breakouts in real-time without kernel modules.',
    highlights: JSON.stringify([
      'Write custom CO-RE eBPF programs in C',
      'Instrument syscall tracing for K8s pod escapes',
      'Deploy Tetragon security policies for runtime enforcement',
    ]),
    attendeesCount: 420,
    status: 'Registration Open',
  },
  {
    id: 'ai-agent-redteaming',
    title: 'Red Teaming LLM Agents & Prompt Injection Exploitation',
    subtitle: 'National Cyber Security Symposium • Autonomous AI Security',
    category: 'AI Security',
    date: 'Oct 02, 2026',
    time: '5:00 PM - 8:30 PM IST',
    duration: '3.5 Hours',
    level: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
    driveUrl: 'https://drive.google.com/drive/folders/thread-security-ai-redteam-2026',
    linkedinUrl: 'https://www.linkedin.com/company/thread-security/',
    registrationUrl: '/contact?topic=workshop-registration&id=ai-agent-redteaming',
    instructorName: 'Ananya Roy',
    instructorRole: 'Head of AI Vulnerability Research',
    description:
      'Learn how to exploit autonomous AI agents, multi-modal LLM pipelines, and tool-using bots. Master indirect prompt injection, SSRF via agentic web browsing, and memory poisoning attacks.',
    highlights: JSON.stringify([
      'Bypass system prompts and guardrails via indirect injection',
      'Exploit tool-calling agents to achieve RCE in cloud sandboxes',
      'Implement NeMo Guardrails and dual-LLM verification patterns',
    ]),
    attendeesCount: 580,
    status: 'Limited Seats',
  },
  {
    id: 'active-directory-attacks-2026',
    title: 'Active Directory Enterprise Attack Paths & Kerberos Exploitation',
    subtitle: 'Offensive Security Summit • Multi-Domain Exploitation',
    category: 'Red Teaming',
    date: 'Oct 15, 2026',
    time: '7:00 PM - 10:00 PM IST',
    duration: '3 Hours',
    level: 'Advanced',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
    driveUrl: 'https://drive.google.com/drive/folders/thread-security-active-directory-2026',
    linkedinUrl: 'https://www.linkedin.com/company/thread-security/',
    registrationUrl: '/contact?topic=workshop-registration&id=active-directory-attacks-2026',
    instructorName: 'Rohan Mehta',
    instructorRole: 'Offensive Security Lead',
    description:
      'Hands-on execution of Kerberoasting, AS-REP Roasting, BloodHound graph analysis, AD CS certificate template abuse, and Golden Ticket creation in a live multi-domain lab environment.',
    highlights: JSON.stringify([
      'Map domain trust graphs with BloodHound & SharpHound',
      'Extract & crack Kerberos service ticket hashes offline',
      'Forge Kerberos TGT (Golden/Silver Tickets) for persistence',
    ]),
    attendeesCount: 310,
    status: 'Registration Open',
  },
];

let memoryWorkshops = [...initialSeedWorkshops];

function getWorkshopModel() {
  try {
    return (prisma as any).workshop || (prisma as any).Workshop || null;
  } catch (e) {
    return null;
  }
}

export async function GET() {
  try {
    const workshopModel = getWorkshopModel();
    let dbWorkshops: any[] = [];

    if (workshopModel) {
      dbWorkshops = await workshopModel.findMany({
        orderBy: { createdAt: 'desc' },
      });

      if (!dbWorkshops || dbWorkshops.length === 0) {
        // Seed default workshops if table is empty
        await workshopModel.createMany({
          data: initialSeedWorkshops,
        });
        dbWorkshops = await workshopModel.findMany({
          orderBy: { createdAt: 'desc' },
        });
      }
    } else {
      dbWorkshops = memoryWorkshops;
    }

    const formatted = dbWorkshops.map((ws: any) => ({
      ...ws,
      highlights: typeof ws.highlights === 'string' ? JSON.parse(ws.highlights) : ws.highlights,
      instructor: {
        name: ws.instructorName || 'Thread Security Lead',
        role: ws.instructorRole || 'Senior Security Instructor',
      },
    }));

    return NextResponse.json({ success: true, workshops: formatted }, { headers: SECURITY_HEADERS });
  } catch (error: any) {
    console.error('Failed to fetch workshops:', error);
    // Return seed fallback instead of 500 error to maintain UI stability
    const formatted = memoryWorkshops.map((ws: any) => ({
      ...ws,
      highlights: typeof ws.highlights === 'string' ? JSON.parse(ws.highlights) : ws.highlights,
      instructor: {
        name: ws.instructorName || 'Thread Security Lead',
        role: ws.instructorRole || 'Senior Security Instructor',
      },
    }));
    return NextResponse.json({ success: true, workshops: formatted }, { headers: SECURITY_HEADERS });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Super Admin access required.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const {
      title,
      subtitle,
      category,
      date,
      time,
      image,
      driveUrl,
      linkedinUrl,
      registrationUrl,
      description,
      highlights,
    } = body;

    const cleanTitle = sanitizeText(title, 200);
    const cleanDate = sanitizeText(date, 100);

    if (!cleanTitle || !cleanDate) {
      return NextResponse.json(
        { success: false, error: 'Valid Title and Date are required.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const cleanSubtitle = sanitizeText(subtitle, 300) || 'Thread Security Masterclass Series';
    const cleanCategory = sanitizeText(category, 100) || 'Red Teaming';
    const cleanTime = sanitizeText(time, 100) || '6:00 PM - 9:00 PM IST';
    const cleanDescription = sanitizeText(description, 2000) || 'Specialized interactive cybersecurity workshop with live hands-on sandboxed labs.';
    
    // Sanitize URLs against XSS & JavaScript protocols
    const cleanImage = sanitizeUrl(image, true) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop';
    const cleanDriveUrl = sanitizeUrl(driveUrl);
    const cleanLinkedinUrl = sanitizeUrl(linkedinUrl) || 'https://www.linkedin.com/company/thread-security/';
    const cleanRegistrationUrl = sanitizeUrl(registrationUrl) || '/contact?topic=workshop-registration';

    const cleanHighlightsArray = Array.isArray(highlights)
      ? highlights.map((h: any) => sanitizeText(h, 300)).filter(Boolean).slice(0, 10)
      : ['Interactive cloud lab environment access', 'Verifiable Certificate of Completion'];

    const workshopModel = getWorkshopModel();
    let created: any;

    if (workshopModel) {
      created = await workshopModel.create({
        data: {
          title: cleanTitle,
          subtitle: cleanSubtitle,
          category: cleanCategory,
          date: cleanDate,
          time: cleanTime,
          duration: '3 Hours Hands-on',
          level: 'Advanced',
          image: cleanImage,
          driveUrl: cleanDriveUrl,
          linkedinUrl: cleanLinkedinUrl,
          registrationUrl: cleanRegistrationUrl,
          instructorName: 'Thread Security Lead',
          instructorRole: 'Senior Security Instructor',
          description: cleanDescription,
          highlights: JSON.stringify(cleanHighlightsArray),
          attendeesCount: 280,
          status: 'Registration Open',
        },
      });
    } else {
      created = {
        id: `ws-${Date.now()}`,
        title: cleanTitle,
        subtitle: cleanSubtitle,
        category: cleanCategory,
        date: cleanDate,
        time: cleanTime,
        duration: '3 Hours Hands-on',
        level: 'Advanced',
        image: cleanImage,
        driveUrl: cleanDriveUrl,
        linkedinUrl: cleanLinkedinUrl,
        registrationUrl: cleanRegistrationUrl,
        instructorName: 'Thread Security Lead',
        instructorRole: 'Senior Security Instructor',
        description: cleanDescription,
        highlights: JSON.stringify(cleanHighlightsArray),
        attendeesCount: 280,
        status: 'Registration Open',
        createdAt: new Date().toISOString(),
      };
      memoryWorkshops.unshift(created);
    }

    const formatted = {
      ...created,
      highlights: typeof created.highlights === 'string' ? JSON.parse(created.highlights) : created.highlights,
      instructor: {
        name: created.instructorName,
        role: created.instructorRole,
      },
    };

    return NextResponse.json({ success: true, workshop: formatted }, { headers: SECURITY_HEADERS });
  } catch (error: any) {
    console.error('Failed to create workshop:', error);
    return NextResponse.json({ success: false, error: 'Database save failed.' }, { status: 500, headers: SECURITY_HEADERS });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Super Admin access required.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const {
      id,
      title,
      subtitle,
      category,
      date,
      time,
      image,
      driveUrl,
      linkedinUrl,
      registrationUrl,
      description,
      highlights,
    } = body;

    const cleanId = sanitizeText(id, 100);
    const cleanTitle = sanitizeText(title, 200);

    if (!cleanId || !cleanTitle) {
      return NextResponse.json(
        { success: false, error: 'Valid Workshop ID and Title are required.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const cleanSubtitle = sanitizeText(subtitle, 300);
    const cleanCategory = sanitizeText(category, 100);
    const cleanDate = sanitizeText(date, 100);
    const cleanTime = sanitizeText(time, 100);
    const cleanDescription = sanitizeText(description, 2000);
    const cleanImage = sanitizeUrl(image, true);
    const cleanDriveUrl = sanitizeUrl(driveUrl);
    const cleanLinkedinUrl = sanitizeUrl(linkedinUrl);
    const cleanRegistrationUrl = sanitizeUrl(registrationUrl);

    const cleanHighlightsArray = Array.isArray(highlights)
      ? highlights.map((h: any) => sanitizeText(h, 300)).filter(Boolean).slice(0, 10)
      : [sanitizeText(highlights, 300)];

    const workshopModel = getWorkshopModel();
    let updated: any;

    if (workshopModel) {
      updated = await workshopModel.update({
        where: { id: cleanId },
        data: {
          title: cleanTitle,
          subtitle: cleanSubtitle,
          category: cleanCategory,
          date: cleanDate,
          time: cleanTime,
          image: cleanImage || undefined,
          driveUrl: cleanDriveUrl || null,
          linkedinUrl: cleanLinkedinUrl || undefined,
          registrationUrl: cleanRegistrationUrl || undefined,
          description: cleanDescription,
          highlights: JSON.stringify(cleanHighlightsArray),
        },
      });
    } else {
      const idx = memoryWorkshops.findIndex((w) => w.id === cleanId);
      if (idx !== -1) {
        memoryWorkshops[idx] = {
          ...memoryWorkshops[idx],
          title: cleanTitle,
          subtitle: cleanSubtitle || memoryWorkshops[idx].subtitle,
          category: cleanCategory || memoryWorkshops[idx].category,
          date: cleanDate || memoryWorkshops[idx].date,
          time: cleanTime || memoryWorkshops[idx].time,
          image: cleanImage || memoryWorkshops[idx].image,
          driveUrl: cleanDriveUrl || memoryWorkshops[idx].driveUrl,
          linkedinUrl: cleanLinkedinUrl || memoryWorkshops[idx].linkedinUrl,
          registrationUrl: cleanRegistrationUrl || memoryWorkshops[idx].registrationUrl,
          description: cleanDescription || memoryWorkshops[idx].description,
          highlights: JSON.stringify(cleanHighlightsArray),
        };
        updated = memoryWorkshops[idx];
      } else {
        updated = {
          id: cleanId,
          title: cleanTitle,
          subtitle: cleanSubtitle,
          category: cleanCategory,
          date: cleanDate,
          time: cleanTime,
          image: cleanImage,
          driveUrl: cleanDriveUrl,
          linkedinUrl: cleanLinkedinUrl,
          registrationUrl: cleanRegistrationUrl,
          instructorName: 'Thread Security Lead',
          instructorRole: 'Senior Security Instructor',
          description: cleanDescription,
          highlights: JSON.stringify(cleanHighlightsArray),
          attendeesCount: 280,
          status: 'Registration Open',
        };
        memoryWorkshops.unshift(updated);
      }
    }

    const formatted = {
      ...updated,
      highlights: typeof updated.highlights === 'string' ? JSON.parse(updated.highlights) : updated.highlights,
      instructor: {
        name: updated.instructorName,
        role: updated.instructorRole,
      },
    };

    return NextResponse.json({ success: true, workshop: formatted }, { headers: SECURITY_HEADERS });
  } catch (error: any) {
    console.error('Failed to update workshop:', error);
    return NextResponse.json({ success: false, error: 'Database update failed.' }, { status: 500, headers: SECURITY_HEADERS });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Super Admin access required.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = sanitizeText(searchParams.get('id'), 100);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Valid Workshop ID parameter required.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const workshopModel = getWorkshopModel();
    if (workshopModel) {
      await workshopModel.delete({
        where: { id },
      });
    } else {
      memoryWorkshops = memoryWorkshops.filter((w) => w.id !== id);
    }

    return NextResponse.json({ success: true, deletedId: id }, { headers: SECURITY_HEADERS });
  } catch (error: any) {
    console.error('Failed to delete workshop:', error);
    return NextResponse.json({ success: false, error: 'Database delete failed.' }, { status: 500, headers: SECURITY_HEADERS });
  }
}
