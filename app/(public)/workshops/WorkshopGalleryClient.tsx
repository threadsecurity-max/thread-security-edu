'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import DepthCarousel, { DepthCarouselItem } from '@/components/ui/DepthCarousel';

export interface WorkshopItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Upcoming' | 'Bootcamp' | 'Red Teaming' | 'Cloud & eBPF' | 'AI Security' | 'Past Archives';
  date: string;
  time: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  image: string;
  driveUrl?: string;
  linkedinUrl: string;
  registrationUrl?: string;
  instructor: {
    name: string;
    role: string;
  };
  description: string;
  highlights: string[];
  attendeesCount: number;
  status: 'Registration Open' | 'Limited Seats' | 'Completed' | 'Sold Out';
}

const initialWorkshops: WorkshopItem[] = [
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
    linkedinUrl: 'https://www.linkedin.com/company/thread-security/',
    instructor: {
      name: 'Kunal Singh',
      role: 'Lead Security Architect',
    },
    description:
      'An intensive hands-on adversary simulation workshop conducted live at CT Institution. Covered Active Directory Kerberoasting, BloodHound graph analysis, and EDR memory unhooking.',
    highlights: [
      'Live execution of Kerberoasting & Golden Ticket attacks',
      'EDR bypass & memory unhooking demonstration',
      'Issued 350+ verified student completion certificates',
    ],
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
    linkedinUrl: 'https://www.linkedin.com/company/thread-security/',
    instructor: {
      name: 'Vikramaditya Sharma',
      role: 'Principal Cloud Security Engineer',
    },
    description:
      'Deep dive into Linux kernel instrumentation using eBPF, Cilium, and Tetragon. Learn to write custom kernel probes to detect zero-day container breakouts in real-time without kernel modules.',
    highlights: [
      'Write custom CO-RE eBPF programs in C',
      'Instrument syscall tracing for K8s pod escapes',
      'Deploy Tetragon security policies for runtime enforcement',
    ],
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
    linkedinUrl: 'https://www.linkedin.com/company/thread-security/',
    instructor: {
      name: 'Ananya Roy',
      role: 'Head of AI Vulnerability Research',
    },
    description:
      'Learn how to exploit autonomous AI agents, multi-modal LLM pipelines, and tool-using bots. Master indirect prompt injection, SSRF via agentic web browsing, and memory poisoning attacks.',
    highlights: [
      'Bypass system prompts and guardrails via indirect injection',
      'Exploit tool-calling agents to achieve RCE in cloud sandboxes',
      'Implement NeMo Guardrails and dual-LLM verification patterns',
    ],
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
    linkedinUrl: 'https://www.linkedin.com/company/thread-security/',
    instructor: {
      name: 'Rohan Mehta',
      role: 'Offensive Security Lead',
    },
    description:
      'Hands-on execution of Kerberoasting, AS-REP Roasting, BloodHound graph analysis, AD CS certificate template abuse, and Golden Ticket creation in a live multi-domain lab environment.',
    highlights: [
      'Map domain trust graphs with BloodHound & SharpHound',
      'Extract & crack Kerberos service ticket hashes offline',
      'Forge Kerberos TGT (Golden/Silver Tickets) for persistence',
    ],
    attendeesCount: 310,
    status: 'Registration Open',
  },
];

const categories = [
  'All Workshops',
  'Upcoming',
  'AI Security',
  'Red Teaming',
  'Cloud & eBPF',
  'Past Archives',
];

export interface WorkshopGalleryClientProps {
  userRole?: string | null;
  initialWorkshops?: WorkshopItem[];
}

const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * CLIENT-SIDE CYBERSECURITY SANITIZER HELPER
 * Prevents DOM-based XSS, JavaScript protocol injection (javascript:),
 * data:text/html payload execution, and malicious input tampering.
 */
export const sanitizeSafeUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^(javascript|vbscript|data:text\/html):/i.test(trimmed)) {
    return '#';
  }
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(trimmed)
  ) {
    return trimmed;
  }
  return '#';
};

export const sanitizeInputText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/<script\b[^<]*>(?:[\s\S]*?)<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export function WorkshopGalleryClient({ userRole, initialWorkshops: serverInitialWorkshops }: WorkshopGalleryClientProps) {
  // Only true if logged in user has role === 'SUPER_ADMIN'
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  const [workshopsList, setWorkshopsList] = useState<WorkshopItem[]>(
    serverInitialWorkshops && serverInitialWorkshops.length > 0 ? serverInitialWorkshops : initialWorkshops
  );

  // Sync with Prisma Database API on mount
  useEffect(() => {
    fetch('/api/workshops')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.workshops) && data.workshops.length > 0) {
          setWorkshopsList(data.workshops);
          try {
            localStorage.setItem('thread_workshops_data', JSON.stringify(data.workshops));
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.error('Failed to fetch from DB API, loading cached local fallback:', err);
        try {
          const saved = localStorage.getItem('thread_workshops_data');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setWorkshopsList(parsed);
            }
          }
        } catch (e) {}
      });
  }, []);

  const saveWorkshops = (updated: WorkshopItem[]) => {
    setWorkshopsList(updated);
    try {
      localStorage.setItem('thread_workshops_data', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save workshops to localStorage', e);
    }
  };
  const [selectedCategory, setSelectedCategory] = useState<string>('All Workshops');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCarouselIdx, setActiveCarouselIdx] = useState<number>(0);
  
  // Pagination State for Workshop Directory
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  // Reset pagination when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Super Admin Commit & Edit Multi-Step Wizard State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<number>(1);
  const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Form Fields for Super Admin to commit/update workshop
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('6:00 PM - 9:00 PM IST');
  const [newCategory, setNewCategory] = useState<WorkshopItem['category']>('Red Teaming');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newDriveUrl, setNewDriveUrl] = useState('');
  const [newLinkedinUrl, setNewLinkedinUrl] = useState('');
  const [newRegistrationUrl, setNewRegistrationUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newHighlight1, setNewHighlight1] = useState('');
  const [newHighlight2, setNewHighlight2] = useState('');

  const openCreateModal = (presetCategory?: WorkshopItem['category'] | React.MouseEvent) => {
    setEditingWorkshopId(null);
    setModalStep(1);
    setNewTitle('');
    setNewSubtitle('');
    setNewDate('');
    if (typeof presetCategory === 'string') {
      setNewCategory(presetCategory);
    }
    setNewImageUrl('');
    setNewDriveUrl('');
    setNewLinkedinUrl('');
    setNewRegistrationUrl('');
    setNewDescription('');
    setNewHighlight1('');
    setNewHighlight2('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (ws: WorkshopItem) => {
    setEditingWorkshopId(ws.id);
    setModalStep(1);
    setNewTitle(ws.title);
    setNewSubtitle(ws.subtitle);
    setNewDate(ws.date);
    setNewTime(ws.time || '6:00 PM - 9:00 PM IST');
    setNewCategory(ws.category);
    setNewImageUrl(ws.image);
    setNewDriveUrl(ws.driveUrl || '');
    setNewLinkedinUrl(ws.linkedinUrl);
    setNewRegistrationUrl(ws.registrationUrl || `/contact?topic=workshop-registration&id=${ws.id}`);
    setNewDescription(ws.description);
    setNewHighlight1(ws.highlights[0] || '');
    setNewHighlight2(ws.highlights[1] || '');
    setIsAddModalOpen(true);
  };

  const handleDeleteWorkshop = async (id: string) => {
    if (confirm('Are you sure you want to delete this workshop event from the database & showcase?')) {
      try {
        await fetch(`/api/workshops?id=${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to delete on DB API:', e);
      }
      const updated = workshopsList.filter((ws) => ws.id !== id);
      saveWorkshops(updated);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        const compressedDataUrl = await compressImage(file, 1200, 1200, 0.8);
        setNewImageUrl(compressedDataUrl);
      } catch (err) {
        console.error('Image compression error, falling back to direct reader:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setNewImageUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleCommitWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const cleanTitle = sanitizeInputText(newTitle);
    const cleanSubtitle = sanitizeInputText(newSubtitle || 'Thread Security Masterclass Series');
    const cleanDate = sanitizeInputText(newDate);
    const cleanTime = sanitizeInputText(newTime);
    const cleanDescription = sanitizeInputText(newDescription);
    const cleanH1 = sanitizeInputText(newHighlight1);
    const cleanH2 = sanitizeInputText(newHighlight2);

    const cleanImage = sanitizeSafeUrl(newImageUrl);
    const cleanDrive = sanitizeSafeUrl(newDriveUrl);
    const cleanLinkedin = sanitizeSafeUrl(newLinkedinUrl);
    const cleanReg = sanitizeSafeUrl(newRegistrationUrl);

    const payload = {
      id: editingWorkshopId || undefined,
      title: cleanTitle,
      subtitle: cleanSubtitle,
      category: newCategory,
      date: cleanDate,
      time: cleanTime,
      image: cleanImage,
      driveUrl: cleanDrive || undefined,
      linkedinUrl: cleanLinkedin,
      registrationUrl: cleanReg,
      description: cleanDescription,
      highlights: [cleanH1, cleanH2].filter(Boolean),
    };

    try {
      const method = editingWorkshopId ? 'PUT' : 'POST';
      const res = await fetch('/api/workshops', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.workshop) {
        if (editingWorkshopId) {
          saveWorkshops(workshopsList.map((ws) => (ws.id === editingWorkshopId ? data.workshop : ws)));
        } else {
          saveWorkshops([data.workshop, ...workshopsList]);
        }
      } else {
        // Fallback local update
        if (editingWorkshopId) {
          saveWorkshops(
            workshopsList.map((ws) =>
              ws.id === editingWorkshopId
                ? {
                    ...ws,
                    title: cleanTitle,
                    subtitle: cleanSubtitle || ws.subtitle,
                    category: newCategory,
                    date: cleanDate,
                    time: cleanTime,
                    image: cleanImage || ws.image,
                    driveUrl: cleanDrive || ws.driveUrl,
                    linkedinUrl: cleanLinkedin || ws.linkedinUrl,
                    registrationUrl: cleanReg || ws.registrationUrl,
                    description: cleanDescription || ws.description,
                    highlights: [cleanH1 || ws.highlights[0], cleanH2 || ws.highlights[1]].filter(Boolean),
                  }
                : ws
            )
          );
        } else {
          const newWS: WorkshopItem = {
            id: `ws-${Date.now()}`,
            title: cleanTitle,
            subtitle: cleanSubtitle,
            category: newCategory,
            date: cleanDate,
            time: cleanTime,
            duration: '3 Hours Hands-on',
            level: 'Advanced',
            image: cleanImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
            driveUrl: cleanDrive || undefined,
            linkedinUrl: cleanLinkedin || 'https://www.linkedin.com/company/thread-security/',
            registrationUrl: cleanReg || '/contact?topic=workshop-registration',
            instructor: { name: 'Thread Security Lead', role: 'Senior Security Instructor' },
            description: cleanDescription || 'Specialized interactive cybersecurity workshop with live hands-on sandboxed labs.',
            highlights: [cleanH1 || 'Hands-on lab access', cleanH2 || 'Verifiable Certificate'],
            attendeesCount: 280,
            status: 'Registration Open',
          };
          saveWorkshops([newWS, ...workshopsList]);
        }
      }
    } catch (err) {
      console.error('API commit error:', err);
    }

    setIsAddModalOpen(false);
    setEditingWorkshopId(null);
  };

  const upcomingWorkshops = workshopsList.filter(
    (ws) => ws.category === 'Upcoming' || ws.status === 'Registration Open' || ws.status === 'Limited Seats'
  );

  const filteredWorkshops = workshopsList.filter((ws) => {
    const matchesCategory =
      selectedCategory === 'All Workshops' ||
      (selectedCategory === 'Upcoming' && (ws.status === 'Registration Open' || ws.status === 'Limited Seats')) ||
      ws.category === selectedCategory;

    const matchesSearch =
      ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredWorkshops.length / itemsPerPage);
  const paginatedWorkshops = filteredWorkshops.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const focusedCarouselWorkshop = workshopsList[activeCarouselIdx % workshopsList.length] || workshopsList[0];

  const carouselItems: DepthCarouselItem[] = workshopsList.map((ws) => ({
    image: ws.image,
    alt: ws.title,
    title: ws.title,
    subtitle: ws.subtitle,
    date: ws.date,
    linkedinUrl: ws.linkedinUrl,
  }));

  return (
    <div className="min-h-screen bg-[#faf8ff] text-slate-900 selection:bg-purple-600 selection:text-white pt-16 pb-24 relative overflow-hidden font-sans">
      
      {/* ── LARGE GRID LIGHT VIOLET & WHITE AMBIENT BACKGROUND ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[750px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-300/40 via-fuchsia-200/20 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[linear-gradient(to_right,#a855f7_1px,transparent_1px),linear-gradient(to_bottom,#a855f7_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />

      {/* ── BACK TO DASHBOARD QUICK BAR FOR LOGGED IN USERS ── */}
      {userRole && (
        <div className="bg-white/95 border-b border-purple-100 py-2.5 px-4 sm:px-8 relative z-30 flex items-center justify-between font-mono text-xs text-slate-700 shadow-xs">
          <Link
            href={
              userRole === 'SUPER_ADMIN' || userRole === 'ACADEMIC_ADMIN' || userRole === 'SECURITY_ADMIN'
                ? '/admin'
                : userRole === 'MENTOR'
                ? '/mentor'
                : '/student'
            }
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 hover:border-purple-400 text-purple-700 hover:text-purple-900 transition-all font-bold shadow-xs cursor-pointer"
          >
            <span>← Back to Dashboard</span>
          </Link>
          <span className="text-[11px] text-slate-500 hidden sm:inline">AUTHENTICATED ROLE: <span className="text-purple-700 font-bold">{userRole}</span></span>
        </div>
      )}

      {/* ── SUPER ADMIN CONSOLE BAR (STRICTLY SHOWN ONLY TO LOGGED-IN SUPER ADMINS) ── */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 border-b border-purple-400/40 py-2.5 px-4 sm:px-8 relative z-30 flex flex-wrap items-center justify-between gap-3 shadow-md text-white">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-300 animate-pulse" />
            <span className="font-bold text-purple-200 uppercase tracking-widest">SUPER ADMIN AUTHENTICATED</span>
            <span className="text-purple-300/80 hidden md:inline">// PRIVILEGED COMMIT SYSTEM ACTIVE</span>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white text-purple-950 font-bold text-xs hover:bg-purple-50 transition-all shadow-md cursor-pointer font-mono uppercase tracking-wider"
          >
            <span>+ Commit New Workshop</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">

        {/* ── HERO HEADER (CLEAN LIGHT VIOLET THEME - MOCKUP REMOVED) ── */}
        <div className="text-center max-w-4xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-purple-800 text-xs font-mono font-bold tracking-widest uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span>HANDS-ON SECURITY WORKSHOPS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
            Interactive Hands-on <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-fuchsia-600 to-indigo-600">Workshop Sandbox</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto">
            Zero local setup required. Practice exploits, execute eBPF kernel probes, and analyze live threat telemetry inside isolated cloud containers.
          </p>
        </div>

        {/* ── 3D DEPTH CAROUSEL SPOTLIGHT STAGE ── */}
        <div className="mb-20 rounded-3xl bg-gradient-to-b from-white via-purple-50/50 to-white border border-purple-200/80 p-6 sm:p-8 shadow-[0_15px_45px_rgba(168,85,247,0.08)] relative overflow-hidden">
          {/* Header Bar with Super Admin Controls */}
          <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-purple-100 font-mono text-xs text-slate-500 gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-slate-900 font-bold tracking-wider">FEATURED WORKSHOP GALLERY</span>
            </div>

            {/* Super Admin Stage Controls */}
            {isSuperAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={openCreateModal}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[11px] hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xs cursor-pointer"
                >
                  + COMMIT NEW EVENT
                </button>
                <button
                  onClick={() => openEditModal(focusedCarouselWorkshop)}
                  className="px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 text-[11px] font-bold transition-all cursor-pointer"
                >
                  EDIT THIS EVENT
                </button>
                <button
                  onClick={() => handleDeleteWorkshop(focusedCarouselWorkshop.id)}
                  className="px-3 py-1 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200 text-[11px] font-bold transition-all cursor-pointer"
                >
                  DELETE EVENT
                </button>
              </div>
            ) : (
              <div className="hidden sm:block text-[11px] text-purple-700 font-bold">
                WORKSHOP SHOWCASE // ITEM 0{activeCarouselIdx + 1}
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            
            {/* Left: Depth Carousel Container */}
            <div className="w-full lg:w-3/5 h-[420px] relative bg-purple-950 rounded-2xl overflow-hidden shadow-xl p-2 border border-purple-300/40">
              <DepthCarousel
                items={carouselItems}
                cardWidth={290}
                cardHeight={360}
                radius={16}
                tiltDirection="right"
                depth={210}
                spread={85}
                tilt={20}
                visibleCards={4}
                autoplay={true}
                autoplayDelay={3600}
                onChange={(idx) => setActiveCarouselIdx(idx)}
              />
            </div>

            {/* Right: Current Focused Workshop Details Panel */}
            <div className="w-full lg:w-2/5 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-block px-3 py-1 rounded-md bg-purple-100 border border-purple-300 text-purple-800 text-xs font-mono font-bold uppercase tracking-wider">
                  {focusedCarouselWorkshop.subtitle}
                </div>

                {isSuperAdmin && (
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-bold">
                    ADMIN EDIT ACTIVE
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
                  {focusedCarouselWorkshop.title}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {focusedCarouselWorkshop.description}
                </p>
              </div>

              {/* Meta details */}
              <div className="space-y-2 bg-purple-50/80 p-4 rounded-xl border border-purple-200/80 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">CONDUCTION DATE:</span>
                  <span className="font-bold text-purple-700">{focusedCarouselWorkshop.date}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">LEAD INSTRUCTOR:</span>
                  <span className="font-bold text-slate-900">{focusedCarouselWorkshop.instructor.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">ATTENDEES VERIFIED:</span>
                  <span className="font-bold text-purple-700">{focusedCarouselWorkshop.attendeesCount}+ PARTICIPANTS</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">// KEY HIGHLIGHTS:</p>
                {focusedCarouselWorkshop.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                    <span className="text-purple-600 font-bold">›</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons: LinkedIn + Super Admin CRUD */}
              <div className="pt-2 flex flex-col gap-2">
                {focusedCarouselWorkshop.linkedinUrl && (
                  <a
                    href={sanitizeSafeUrl(focusedCarouselWorkshop.linkedinUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 w-full py-3 px-5 rounded-xl bg-[#0a1520] hover:bg-[#0e1d2c] text-white font-mono font-bold text-xs transition-all border border-[#0077b5]/50 shadow-md cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#0077b5]">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                    </svg>
                    <span>VIEW OFFICIAL EVENT POST ON LINKEDIN</span>
                  </a>
                )}

                {isSuperAdmin && (
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <button
                      onClick={() => openEditModal(focusedCarouselWorkshop)}
                      className="py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      ✏ EDIT THIS EVENT
                    </button>
                    <button
                      onClick={() => handleDeleteWorkshop(focusedCarouselWorkshop.id)}
                      className="py-2 px-3 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      🗑 DELETE THIS EVENT
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── UPCOMING EXECUTION ROADMAP SECTION (DYNAMIC) ── */}
        <div className="mb-20">
          <div className="flex flex-wrap items-center justify-between mb-6 pb-3 border-b border-purple-100 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Upcoming Masterclasses En Route</h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Pre-register to secure sandboxed lab access for upcoming live events.</p>
            </div>

            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <button
                  onClick={() => openCreateModal('Upcoming')}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white font-mono font-bold text-xs hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>+ CREATE UPCOMING MASTERCLASS</span>
                </button>
              )}
              <span className="hidden sm:inline-block px-3 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-purple-800 text-xs font-mono font-bold">
                {upcomingWorkshops.length} EVENTS IN PIPELINE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingWorkshops.slice(0, 3).map((ws, idx) => {
              const regTarget = ws.registrationUrl || `/contact?topic=workshop-registration&id=${ws.id}`;
              const isExternal = regTarget.startsWith('http');

              return (
                <div
                  key={ws.id}
                  className={`p-6 rounded-2xl border shadow-md flex flex-col justify-between transition-all ${
                    idx === 0
                      ? 'bg-gradient-to-b from-purple-900 via-indigo-950 to-slate-900 text-white border-purple-400/40 shadow-[0_10px_30px_rgba(147,51,234,0.15)]'
                      : 'bg-white border-purple-200/80 text-slate-900 hover:border-purple-400 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${
                        idx === 0
                          ? 'bg-purple-400/20 border border-purple-400/30 text-purple-200'
                          : 'bg-purple-100 border border-purple-200 text-purple-800'
                      }`}>
                        EN ROUTE • {ws.date}
                      </span>

                      {/* Super Admin Quick Actions */}
                      {isSuperAdmin && (
                        <div className="flex items-center gap-1.5 font-mono">
                          <button
                            onClick={() => openEditModal(ws)}
                            className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold border border-amber-300 transition-colors cursor-pointer"
                            title="Edit Upcoming Event Details"
                          >
                            ✏ EDIT
                          </button>
                          <button
                            onClick={() => handleDeleteWorkshop(ws.id)}
                            className="px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-900 text-[10px] font-bold border border-rose-300 transition-colors cursor-pointer"
                            title="Remove Upcoming Event"
                          >
                            🗑 REMOVE
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className={`text-lg font-bold leading-snug ${idx === 0 ? 'text-white' : 'text-slate-900'}`}>{ws.title}</h3>
                    <p className={`text-xs leading-relaxed ${idx === 0 ? 'text-purple-200/80' : 'text-slate-600'}`}>{ws.description}</p>
                  </div>

                  <div className={`pt-4 border-t mt-4 flex items-center justify-between text-xs font-mono ${
                    idx === 0 ? 'border-purple-800/60' : 'border-purple-100'
                  }`}>
                    <span className={`truncate max-w-[140px] font-bold ${idx === 0 ? 'text-purple-300' : 'text-purple-700'}`}>{ws.subtitle}</span>
                    {isExternal ? (
                      <a
                        href={sanitizeSafeUrl(regTarget)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-bold transition-colors inline-flex items-center gap-1 ${
                          idx === 0 ? 'text-white hover:text-purple-200' : 'text-purple-700 hover:text-purple-900'
                        }`}
                      >
                        <span>RSVP SPOT →</span>
                      </a>
                    ) : (
                      <Link
                        href={regTarget}
                        className={`font-bold transition-colors inline-flex items-center gap-1 ${
                          idx === 0 ? 'text-white hover:text-purple-200' : 'text-purple-700 hover:text-purple-900'
                        }`}
                      >
                        <span>RSVP SPOT →</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FILTER & SEARCH WORKSHOP DIRECTORY ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b border-purple-100">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(147,51,234,0.3)]'
                    : 'bg-white text-slate-600 hover:text-purple-900 border border-purple-200/80 hover:border-purple-400 shadow-xs'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {isSuperAdmin && (
              <button
                onClick={() => openCreateModal()}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-mono font-bold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>+ CREATE WORKSHOP</span>
              </button>
            )}

            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search title or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-purple-200 text-slate-900 text-xs rounded-xl px-4 py-2.5 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 transition-all placeholder:text-slate-400 font-mono shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* ── WORKSHOPS DIRECTORY GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <AnimatePresence mode="popLayout">
            {paginatedWorkshops.map((ws) => (
              <motion.div
                key={ws.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="group relative rounded-2xl bg-white border border-purple-200/80 hover:border-purple-400 p-6 shadow-xs hover:shadow-[0_15px_35px_rgba(168,85,247,0.12)] flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200/80">
                        {ws.status}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200">
                        {ws.category}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500 font-bold">
                      {ws.attendeesCount} ATTENDEES
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors mb-1.5 leading-snug">
                    {ws.title}
                  </h3>

                  <p className="text-xs text-purple-700 font-mono font-bold mb-3">
                    {ws.subtitle}
                  </p>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal mb-5">
                    {ws.description}
                  </p>

                  <div className="space-y-2 mb-6 bg-purple-50/70 p-4 rounded-xl border border-purple-100 font-mono">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">// KEY COVERAGE:</p>
                    {ws.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-purple-600 font-bold">›</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 font-mono text-xs">
                    <div className="text-slate-600">
                      DATE: <span className="text-purple-700 font-bold">{ws.date}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {ws.time}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Super Admin Quick Actions */}
                    {isSuperAdmin && (
                      <div className="flex items-center gap-1.5 mr-1">
                        <button
                          onClick={() => openEditModal(ws)}
                          className="px-2.5 py-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                          title="Edit Workshop Details"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => handleDeleteWorkshop(ws.id)}
                          className="px-2.5 py-2 rounded-xl bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                          title="Delete Workshop"
                        >
                          DELETE
                        </button>
                      </div>
                    )}

                    {ws.driveUrl && (
                      <a
                        href={sanitizeSafeUrl(ws.driveUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors border border-sky-200 hover:border-sky-400 inline-flex items-center gap-1 font-mono text-xs font-bold"
                        title="Open Google Drive Cloud Storage Folder"
                      >
                        <svg className="w-3.5 h-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 001-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        <span>DRIVE</span>
                      </a>
                    )}

                    {ws.linkedinUrl && (
                      <a
                        href={sanitizeSafeUrl(ws.linkedinUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-[#0077b5] text-slate-600 hover:text-white transition-colors border border-slate-200 hover:border-[#0077b5]"
                        title="View LinkedIn Post"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                        </svg>
                      </a>
                    )}
                    {(() => {
                      const regTarget = ws.registrationUrl || `/contact?topic=workshop-registration&id=${ws.id}`;
                      const isExternal = regTarget.startsWith('http');
                      return isExternal ? (
                        <a
                          href={sanitizeSafeUrl(regTarget)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto"
                        >
                          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all cursor-pointer font-mono shadow-[0_4px_18px_rgba(147,51,234,0.3)]">
                            <span>REGISTER NOW</span>
                          </button>
                        </a>
                      ) : (
                        <Link
                          href={regTarget}
                          className="w-full sm:w-auto"
                        >
                          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all cursor-pointer font-mono shadow-[0_4px_18px_rgba(147,51,234,0.3)]">
                            <span>REGISTER NOW</span>
                          </button>
                        </Link>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── WORKSHOP DIRECTORY PAGINATION CONTROLS ── */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 rounded-2xl bg-white border border-purple-200/80 shadow-xs font-mono text-xs mb-16">
            <span className="text-slate-600">
              Showing <span className="font-bold text-purple-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-purple-700">{Math.min(currentPage * itemsPerPage, filteredWorkshops.length)}</span> of <span className="font-bold text-purple-700">{filteredWorkshops.length}</span> workshops
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white font-bold transition-all shadow-xs cursor-pointer"
              >
                ← Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs'
                        : 'bg-white border border-purple-200 text-slate-600 hover:bg-purple-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white font-bold transition-all shadow-xs cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── SUPER ADMIN COMMIT WORKSHOP MULTI-STEP WIZARD MODAL ── */}
      {isSuperAdmin && (
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.25 }}
                className="bg-white border border-pink-200/80 rounded-3xl shadow-2xl max-w-4xl w-full p-0 overflow-hidden text-slate-900 relative"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[520px]">
                  
                  {/* Left Column (Brand & Step Navigation Sidebar - Dark Charcoal / Purple & Pink) */}
                  <div className="md:col-span-5 bg-gradient-to-br from-[#120722] via-[#1c0b32] to-[#0a0314] p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Subtle dot pattern overlay */}
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />

                    {/* Brand Header */}
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
                        <span className="font-mono text-xs font-bold text-pink-300 tracking-wider">THREAD ACADEMY</span>
                        <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase">
                          SUPER ADMIN
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white pt-4">
                        {editingWorkshopId ? 'Edit Workshop' : 'Commit New Workshop'}<br />
                        <span className="italic font-serif font-light text-pink-400">Masterclass Record</span>
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        Fill out the event details in this clean 3-step wizard. All changes automatically sync to PostgreSQL Prisma database.
                      </p>
                    </div>

                    {/* Step Navigation Indicator Sidebar */}
                    <div className="relative z-10 space-y-3 my-6 bg-white/[0.04] backdrop-blur-md p-4 rounded-2xl border border-white/10 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => setModalStep(1)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                          modalStep === 1
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          modalStep === 1 ? 'bg-pink-500 text-white font-bold' : 'bg-white/10 text-slate-300'
                        }`}>1</span>
                        <span>Event Telemetry &amp; Schedule</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalStep(2)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                          modalStep === 2
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          modalStep === 2 ? 'bg-pink-500 text-white font-bold' : 'bg-white/10 text-slate-300'
                        }`}>2</span>
                        <span>Media &amp; Cloud Drive Links</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalStep(3)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                          modalStep === 3
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          modalStep === 3 ? 'bg-pink-500 text-white font-bold' : 'bg-white/10 text-slate-300'
                        }`}>3</span>
                        <span>RSVP Link &amp; Highlights</span>
                      </button>
                    </div>

                    {/* Quick Database Status Footer */}
                    <div className="relative z-10 text-[11px] font-mono text-pink-400 flex items-center gap-1.5">
                      <span>✓ Connected to PostgreSQL Database</span>
                    </div>
                  </div>

                  {/* Right Column (White & Pink Form Content) */}
                  <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white text-slate-900">
                    <div>
                      {/* Step Header Bar */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-pink-600 uppercase tracking-widest">
                            STEP 0{modalStep} OF 03
                          </span>
                          <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">
                            {modalStep === 1 && 'Basic Event Details'}
                            {modalStep === 2 && 'Media & Cloud Storage'}
                            {modalStep === 3 && 'Registration & Coverage'}
                          </h4>
                        </div>
                        <button
                          onClick={() => setIsAddModalOpen(false)}
                          className="p-2 rounded-full hover:bg-pink-50 text-slate-400 hover:text-pink-600 transition-colors cursor-pointer"
                          title="Close Modal"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Step 1: Event Telemetry */}
                      {modalStep === 1 && (
                        <div className="space-y-4 font-mono text-xs">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">WORKSHOP TITLE*</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Adversary Simulation Masterclass at CT Institution"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-700 font-bold mb-1">VENUE / SUBTITLE</label>
                              <input
                                type="text"
                                placeholder="e.g. CT Institution Campus, Jalandhar"
                                value={newSubtitle}
                                onChange={(e) => setNewSubtitle(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-bold mb-1">CONDUCTION DATE*</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Aug 14, 2026"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-xs"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-700 font-bold mb-1">EVENT TIME</label>
                              <input
                                type="text"
                                placeholder="e.g. 10:00 AM - 4:00 PM IST"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-bold mb-1">CATEGORY</label>
                              <select
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none transition-all text-xs font-semibold"
                              >
                                <option value="Red Teaming">Red Teaming</option>
                                <option value="Cloud & eBPF">Cloud &amp; eBPF</option>
                                <option value="AI Security">AI Security</option>
                                <option value="Bootcamp">Bootcamp</option>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Past Archives">Past Archives</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Media & Storage Links */}
                      {modalStep === 2 && (
                        <div className="space-y-4 font-mono text-xs">
                          {/* Image Source & Local File Upload */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-slate-700 font-bold">WORKSHOP IMAGE SOURCE</label>
                              <span className="text-[10px] text-pink-600 font-bold">REMOTE URL OR LOCAL FILE</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="https://images.unsplash.com/... or pick local file"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-xs"
                              />
                              <label className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-pink-50 border border-pink-200 hover:border-pink-400 hover:bg-pink-100 text-pink-700 text-xs font-mono font-bold transition-all shadow-xs disabled:opacity-50">
                                {isUploadingImage ? (
                                  <>
                                    <span className="w-3.5 h-3.5 rounded-full border-2 border-pink-600 border-t-transparent animate-spin" />
                                    <span>Compressing...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span>Browse</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  disabled={isUploadingImage}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {/* Image Preview Thumbnail */}
                            {newImageUrl && (
                              <div className="relative w-full h-24 rounded-xl overflow-hidden border border-pink-300 bg-slate-900 group mt-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={sanitizeSafeUrl(newImageUrl)} alt="Workshop Image Preview" className="w-full h-full object-cover object-center" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-4">
                                  <span className="text-[11px] text-pink-200 font-mono truncate max-w-[75%]">
                                    {newImageUrl.startsWith('data:') ? 'Local file uploaded (Base64)' : newImageUrl}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setNewImageUrl('')}
                                    className="px-2.5 py-1 bg-red-500/80 hover:bg-red-600 text-white rounded-lg text-[10px] font-mono font-bold transition-all"
                                  >
                                    Remove Image
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Google Drive / Cloud Storage Link */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-slate-700 font-bold">GOOGLE DRIVE / CLOUD BACKUP LINK</label>
                              <span className="text-[10px] text-sky-700 font-bold">DRIVE / CLOUDINARY / S3</span>
                            </div>
                            <input
                              type="text"
                              placeholder="e.g. https://drive.google.com/drive/folders/..."
                              value={newDriveUrl}
                              onChange={(e) => setNewDriveUrl(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-xs font-mono"
                            />
                          </div>

                          {/* LinkedIn Post URL */}
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">LINKEDIN OFFICIAL EVENT POST URL</label>
                            <input
                              type="text"
                              placeholder="e.g. https://www.linkedin.com/posts/..."
                              value={newLinkedinUrl}
                              onChange={(e) => setNewLinkedinUrl(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* Step 3: Registration & Coverage Highlights */}
                      {modalStep === 3 && (
                        <div className="space-y-4 font-mono text-xs">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">REGISTRATION / RSVP LINK (URL OR ROUTE)</label>
                            <input
                              type="text"
                              placeholder="e.g. /contact?topic=ai-agent-workshop or https://lu.ma/..."
                              value={newRegistrationUrl}
                              onChange={(e) => setNewRegistrationUrl(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">DESCRIPTION</label>
                            <textarea
                              rows={2}
                              placeholder="Brief description of the workshop event outcome..."
                              value={newDescription}
                              onChange={(e) => setNewDescription(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-700 font-bold mb-1">HIGHLIGHT 1</label>
                              <input
                                type="text"
                                placeholder="e.g. Kerberoasting &amp; AD CS attack execution"
                                value={newHighlight1}
                                onChange={(e) => setNewHighlight1(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-700 font-bold mb-1">HIGHLIGHT 2</label>
                              <input
                                type="text"
                                placeholder="e.g. 350+ student certificates issued"
                                value={newHighlight2}
                                onChange={(e) => setNewHighlight2(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step Navigation Controls Footer */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between font-sans">
                      {modalStep > 1 ? (
                        <button
                          type="button"
                          onClick={() => setModalStep((prev) => prev - 1)}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          ← Back
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(false)}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}

                      {modalStep < 3 ? (
                        <button
                          type="button"
                          onClick={() => setModalStep((prev) => prev + 1)}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-mono font-bold text-xs hover:opacity-95 transition-all shadow-md cursor-pointer"
                        >
                          Next Step →
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleCommitWorkshop}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-mono font-bold text-xs transition-all shadow-lg shadow-pink-500/20 cursor-pointer"
                        >
                          COMMIT &amp; PUBLISH WORKSHOP
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      )}

    </div>
  );
}
