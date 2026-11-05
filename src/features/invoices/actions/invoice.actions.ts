'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser, isAdminRole } from '@/lib/auth/session';
import {
  getStudentInvoicesService,
  createStudentInvoiceService,
  markInvoicePaidService,
  InvoiceItem,
} from '@/server/services/invoice.service';

export async function getStudentInvoicesAction(studentProfileId?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized: Session required', data: [] };
    }

    const invoices = await getStudentInvoicesService(studentProfileId);
    return { success: true, data: invoices };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch invoices';
    return { success: false, error: msg, data: [] };
  }
}

export async function createStudentInvoiceAction(params: {
  studentProfileId: string;
  title: string;
  description?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRatePercent?: number;
  dueDate: string;
  notes?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdminRole(user.role)) {
      return { success: false, error: 'Unauthorized: Staff or Admin permissions required' };
    }

    const created = await createStudentInvoiceService({
      ...params,
      createdById: user.userId,
    });

    revalidatePath('/admin/invoices');
    revalidatePath('/student/invoices');
    return { success: true, data: created };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate invoice';
    return { success: false, error: msg };
  }
}

export async function markInvoicePaidAction(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdminRole(user.role)) {
      return { success: false, error: 'Unauthorized: Staff or Admin permissions required' };
    }

    const res = await markInvoicePaidService(id);
    revalidatePath('/admin/invoices');
    revalidatePath('/student/invoices');
    return { success: true, data: res };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update invoice';
    return { success: false, error: msg };
  }
}

