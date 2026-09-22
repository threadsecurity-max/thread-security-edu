'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PhoneCall,
  Flame,
  Award,
  BookOpen,
  Mail,
  ChevronRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { LeadCaptureModal } from '@/components/leads/LeadCaptureModal';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, highIntent: 0, newLeads: 0, enrolled: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/leads');
      const json = await res.json();
      if (json.success) {
        setLeads(json.leads || []);
        setStats(json.stats || {});
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.courseInterest && lead.courseInterest.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'ALL' || lead.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-10 space-y-8 bg-zinc-950 text-white min-h-screen">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Lead Intelligence & CRM Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Student Lead Pipeline
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Multi-channel lead capture enriched with Vertex AI Intent Scoring and fast-track admissions workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 text-sm font-semibold transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate Lead Submission</span>
          </button>

          <button
            onClick={fetchLeads}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Pipeline Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Captured Leads</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <p className="text-[11px] text-zinc-400">Multi-channel inbound intake</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 to-zinc-900 border border-emerald-500/30 p-5 space-y-1">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>High Intent Leads (AI Score ≥ 75)</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.highIntent}</div>
          <p className="text-[11px] text-emerald-300">Priority 2-hour reach-out</p>
        </div>

        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>New Uncontacted Leads</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.newLeads}</div>
          <p className="text-[11px] text-zinc-400">Awaiting admissions counselor</p>
        </div>

        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Enrolled Students</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.enrolled}</div>
          <p className="text-[11px] text-zinc-400">Converted from pipeline</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search leads by name, email, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'DEMO_SCHEDULED', 'ENROLLED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-emerald-500 text-zinc-950 font-semibold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Pipeline Table */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Lead Profile</th>
                <th className="py-3.5 px-3">Vertex AI Intent Score</th>
                <th className="py-3.5 px-3">Course Interest & Career Goal</th>
                <th className="py-3.5 px-3">Channel Source</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const score = lead.aiScore || 0;
                  const isHigh = score >= 75;
                  const isMed = score >= 45 && score < 75;

                  return (
                    <tr key={lead.id} className="hover:bg-zinc-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-sm">{lead.name}</div>
                        <div className="flex items-center gap-2 text-zinc-400 text-xs mt-0.5">
                          <Mail className="w-3 h-3 text-zinc-500" />
                          <span>{lead.email}</span>
                          {lead.phone && (
                            <>
                              <span className="text-zinc-600">•</span>
                              <span className="text-zinc-300 font-mono">{lead.phone}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              isHigh
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isMed
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {score} / 100
                          </span>
                          <span className="text-[11px] text-zinc-400 hidden sm:inline">
                            {isHigh ? 'High Intent' : isMed ? 'Medium Intent' : 'Low Intent'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-medium text-white">{lead.courseInterest || 'General Mastery'}</div>
                        <div className="text-[11px] text-zinc-400 truncate max-w-xs">{lead.careerGoal || 'N/A'}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                          {lead.source}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="QUALIFIED">QUALIFIED</option>
                          <option value="DEMO_SCHEDULED">DEMO SCHEDULED</option>
                          <option value="ENROLLED">ENROLLED</option>
                          <option value="UNQUALIFIED">UNQUALIFIED</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`mailto:${lead.email}?subject=Thread%20Security%20Education%20-%20Course%20Curriculum%20Consultation`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 px-3 py-1.5 text-xs font-semibold transition"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Contact</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Capture Modal Simulation */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchLeads();
        }}
        title="Simulate Inbound Lead Capture"
        subtitle="Test the GCP Vertex AI intent scorer & multi-channel lead API."
      />
    </div>
  );
}
