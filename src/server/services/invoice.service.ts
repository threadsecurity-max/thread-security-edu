import { prisma } from '../database/prisma';

export interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface StudentInvoiceDTO {
  id: string;
  invoiceNumber: string;
  studentId: string;
  student: {
    id: string;
    phone?: string | null;
    user: {
      id: string;
      name: string | null;
      email: string;
      tsIdentity?: { tsId: string } | null;
    };
    batch?: {
      batchCode: string;
      title: string;
    } | null;
  };
  createdById: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  title: string;
  description?: string | null;
  items: InvoiceItem[];
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  dueDate: Date | string;
  paidAt?: Date | string | null;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  pdfUrl?: string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// In-memory fallback
let inMemoryInvoices: StudentInvoiceDTO[] = [
  {
    id: 'inv-demo-1',
    invoiceNumber: 'TSE-INV-2026-0001',
    studentId: 'student-demo-profile-1',
    student: {
      id: 'student-demo-profile-1',
      phone: '+91 98765 43210',
      user: {
        id: 'user-std-1',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        tsIdentity: { tsId: 'TSE-2026-ARV091' },
      },
      batch: {
        batchCode: 'BATCH-2026-CYBER-01',
        title: 'Cyber Threat Defense & SOC Cohort Alpha',
      },
    },
    createdById: 'admin-super-1',
    createdBy: {
      id: 'admin-super-1',
      name: 'Super Admin Finance',
      email: 'admin@threadsecurity.in',
      role: 'SUPER_ADMIN',
    },
    title: '45 Days Industrial Training & Sandboxed Range Access',
    description: 'Accredited ethical hacking, network packet inspection, and SIEM monitoring training tuition fee.',
    items: [
      { description: 'Hands-on Sandboxed Cyber Range Lab Provisioning', qty: 1, rate: 12000, amount: 12000 },
      { description: '1-on-1 Mentor-Led Defensive & Offensive Masterclass', qty: 1, rate: 8000, amount: 8000 },
      { description: 'TS-ID Cryptographic Verified Credential Registry', qty: 1, rate: 2500, amount: 2500 },
    ],
    subtotal: 22500,
    taxRatePercent: 18.0,
    taxAmount: 4050,
    totalAmount: 26550,
    currency: 'INR',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    paidAt: new Date().toISOString(),
    status: 'PAID',
    pdfUrl: '/invoices/TSE-INV-2026-0001.pdf',
    notes: 'Payment settled via UPI / Netbanking. Official institutional receipt issued.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'inv-demo-2',
    invoiceNumber: 'TSE-INV-2026-0002',
    studentId: 'student-demo-profile-2',
    student: {
      id: 'student-demo-profile-2',
      phone: '+91 98123 45678',
      user: {
        id: 'user-std-2',
        name: 'Priya Verma',
        email: 'priya.verma@example.com',
        tsIdentity: { tsId: 'TSE-2026-PRY104' },
      },
      batch: {
        batchCode: 'BATCH-2026-CYBER-01',
        title: 'Cyber Threat Defense & SOC Cohort Alpha',
      },
    },
    createdById: 'exec-1',
    createdBy: {
      id: 'exec-1',
      name: 'Raman Sharma',
      email: 'raman.exec@threadsecurity.in',
      role: 'STAFF_EXECUTIVE',
    },
    title: '6 Months Industrial Cybersecurity Internship & Placement Support',
    description: 'Comprehensive practical training, minor/major project report guidance, and verified placement referrals.',
    items: [
      { description: '6 Months Live Lab Infrastructure & Virtual Targets', qty: 1, rate: 25000, amount: 25000 },
      { description: 'SOC Analyst L1/L2 & PenTesting Tool Certification', qty: 1, rate: 10000, amount: 10000 },
    ],
    subtotal: 35000,
    taxRatePercent: 18.0,
    taxAmount: 6300,
    totalAmount: 41300,
    currency: 'INR',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    status: 'SENT',
    pdfUrl: '/invoices/TSE-INV-2026-0002.pdf',
    notes: 'Instalment 1 of 2. Payment due before lab container provisioning.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function getStudentInvoicesService(studentProfileId?: string): Promise<StudentInvoiceDTO[]> {
  try {
    const where: any = {};
    if (studentProfileId) where.studentId = studentProfileId;

    const invoices = await (prisma as any).studentInvoice.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                tsIdentity: { select: { tsId: true } },
              },
            },
            batch: { select: { batchCode: true, title: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (invoices && invoices.length > 0) {
      return invoices.map((inv: any) => ({
        ...inv,
        items: JSON.parse(inv.itemsJson || '[]'),
      }));
    }
  } catch (err) {
    console.warn('[Invoice Service] Database query fallback:', err);
  }

  let filtered = [...inMemoryInvoices];
  if (studentProfileId) {
    filtered = filtered.filter((i) => i.studentId === studentProfileId);
  }
  return filtered;
}

export async function createStudentInvoiceService(params: {
  studentProfileId: string;
  createdById: string;
  title: string;
  description?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRatePercent?: number;
  dueDate: string;
  notes?: string;
}): Promise<StudentInvoiceDTO> {
  const taxRate = params.taxRatePercent ?? 18.0;
  const taxAmount = (params.subtotal * taxRate) / 100;
  const totalAmount = params.subtotal + taxAmount;
  const invoiceNumber = `TSE-INV-2026-${String(Date.now()).slice(-5)}`;

  try {
    const created = await (prisma as any).studentInvoice.create({
      data: {
        invoiceNumber,
        studentId: params.studentProfileId,
        createdById: params.createdById,
        title: params.title,
        description: params.description || null,
        itemsJson: JSON.stringify(params.items),
        subtotal: params.subtotal,
        taxRatePercent: taxRate,
        taxAmount,
        totalAmount,
        currency: 'INR',
        dueDate: new Date(params.dueDate),
        status: 'SENT',
        pdfUrl: `/invoices/${invoiceNumber}.pdf`,
        notes: params.notes || null,
      },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true, tsIdentity: true } },
            batch: { select: { batchCode: true, title: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return {
      ...created,
      items: params.items,
    };
  } catch (err) {
    console.warn('[Invoice Service] Database creation fallback:', err);
  }

  const newInv: StudentInvoiceDTO = {
    id: `inv-${Date.now()}`,
    invoiceNumber,
    studentId: params.studentProfileId,
    student: {
      id: params.studentProfileId,
      phone: '+91 98765 00000',
      user: {
        id: `user-${Date.now()}`,
        name: 'Enrolled Student',
        email: 'student@threadsecurity.in',
        tsIdentity: { tsId: `TSE-2026-${String(Date.now()).slice(-4)}` },
      },
      batch: { batchCode: 'BATCH-2026-CYBER-01', title: 'Cyber Threat Defense' },
    },
    createdById: params.createdById,
    createdBy: {
      id: params.createdById,
      name: 'Staff Administrator',
      email: 'staff@threadsecurity.in',
      role: 'STAFF_EXECUTIVE',
    },
    title: params.title,
    description: params.description || null,
    items: params.items,
    subtotal: params.subtotal,
    taxRatePercent: taxRate,
    taxAmount,
    totalAmount,
    currency: 'INR',
    dueDate: params.dueDate,
    status: 'SENT',
    pdfUrl: `/invoices/${invoiceNumber}.pdf`,
    notes: params.notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  inMemoryInvoices = [newInv, ...inMemoryInvoices];
  return newInv;
}

export async function markInvoicePaidService(id: string): Promise<boolean> {
  try {
    await (prisma as any).studentInvoice.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date() },
    });
    return true;
  } catch {
    const item = inMemoryInvoices.find((i) => i.id === id);
    if (item) {
      item.status = 'PAID';
      item.paidAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}

