import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getMentorBatchesService } from '@/server/services/batch.service';
import { BatchCard } from '@/components/mentor/batch-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layers, ArrowLeft, Search, ShieldCheck } from 'lucide-react';

export const revalidate = 0;

export default async function MentorBatchesDirectoryPage() {
  const session = await getSession();
  const userId = session?.userId || '';

  const batches = await getMentorBatchesService(userId);

  return (
    <div className="space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/mentor">
              <Button variant="ghost" size="sm" className="text-xs font-mono text-slate-400 hover:text-white p-0 h-auto">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Mentor Home
              </Button>
            </Link>
            <Badge className="bg-[#C6FF34]/15 text-[#C6FF34] border border-[#C6FF34]/30 font-mono text-[10px]">
              ASSIGNED ACADEMIC WORKSPACES
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-[#C6FF34]" />
            My Assigned Batches ({batches.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-mono">
            Every cohort is an independent, isolated academic workspace. Choose a batch to manage students, attendance, curriculum, and broadcasts.
          </p>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center space-y-3 font-mono">
          <Layers className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Batches Assigned</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You are not currently assigned to any active batch. Contact your academic administrator to map your mentor account to cohorts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch: any) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      )}
    </div>
  );
}
