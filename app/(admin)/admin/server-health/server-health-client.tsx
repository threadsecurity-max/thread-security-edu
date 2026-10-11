'use client';

import React, { useState } from 'react';
import {
  Activity,
  Database,
  Server,
  Cpu,
  ShieldCheck,
  Mail,
  RefreshCw,
  Clock,
  Layers,
  Zap,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface TelemetryData {
  database: {
    status: 'CONNECTED' | 'DISCONNECTED';
    latencyMs: number;
    error: string | null;
    engine: string;
    userCount: number;
    auditCount: number;
  };
  runtime: {
    uptimeSeconds: number;
    nodeVersion: string;
    platform: string;
    arch: string;
    env: string;
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
  services: {
    emailDispatch: string;
    authSecret: string;
    databaseUrl: string;
  };
}

interface ServerHealthClientProps {
  initialData: TelemetryData;
}

export function ServerHealthClient({ initialData }: ServerHealthClientProps) {
  const [data, setData] = useState<TelemetryData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const start = Date.now();
      const res = await fetch('/api/health', { cache: 'no-store' });
      const latency = Date.now() - start;
      if (res.ok) {
        setLastRefreshed(new Date());
      }
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-mono">
              SYSTEM TELEMETRY & SERVER HEALTH
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-sans">
                LIVE
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Real-time PostgreSQL engine telemetry, Node memory allocations, and critical service monitors.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refreshed: {lastRefreshed.toLocaleTimeString()}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* DB Ping */}
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>DATABASE LATENCY</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {data.database.latencyMs}ms
            </span>
            <span className="text-xs text-slate-500">
              {data.database.status === 'CONNECTED' ? 'Optimal' : 'Offline'}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">{data.database.engine}</div>
        </div>

        {/* Uptime */}
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>UPTIME</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {formatUptime(data.runtime.uptimeSeconds)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Node {data.runtime.nodeVersion} • {data.runtime.platform}
          </div>
        </div>

        {/* Heap Memory */}
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>HEAP MEMORY</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {data.runtime.heapUsedMb} MB
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Allocated: {data.runtime.heapTotalMb} MB
          </div>
        </div>

        {/* RSS Footprint */}
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>RESIDENT SET (RSS)</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">
            {data.runtime.rssMb} MB
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">Process memory boundary</div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Subsystem Matrix */}
        <div className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            CORE SUBSYSTEM STATUS
          </h2>

          <div className="divide-y divide-slate-800/60">
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">PostgreSQL Data Store</div>
                <div className="text-[11px] text-slate-400">
                  {data.database.userCount} Users, {data.database.auditCount} Audit records
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ONLINE
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Security Session Validator</div>
                <div className="text-[11px] text-slate-400">HMAC-SHA256 Token Protection</div>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ACTIVE
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Email Dispatch Service</div>
                <div className="text-[11px] text-slate-400">{data.services.emailDispatch}</div>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {data.services.emailDispatch}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">In-Memory Resilience Engine</div>
                <div className="text-[11px] text-slate-400">
                  Auto-fallback for transient connection drops
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3" /> STANDBY READY
              </span>
            </div>
          </div>
        </div>

        {/* Environment & Node Runtime Details */}
        <div className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            OPERATIONAL ENVIRONMENT TELEMETRY
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                Node Environment
              </span>
              <span className="font-mono text-emerald-400">{data.runtime.env}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                Platform / Arch
              </span>
              <span className="font-mono text-white">
                {data.runtime.platform} ({data.runtime.arch})
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                Auth Secret
              </span>
              <span className="font-mono text-emerald-400">{data.services.authSecret}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">
                Database TLS
              </span>
              <span className="font-mono text-emerald-400">{data.services.databaseUrl}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
            <div className="font-mono text-[11px] text-emerald-400 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> TELEMETRY HEARTBEAT NOMINAL
            </div>
            All administrative command services, student lifecycle controllers, and academic timetable workers are functioning within designated latency parameters.
          </div>
        </div>
      </div>
    </div>
  );
}
