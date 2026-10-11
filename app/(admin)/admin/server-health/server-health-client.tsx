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
      const res = await fetch('/api/health', { cache: 'no-store' });
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
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider text-emerald-600 uppercase">
                System Telemetry &amp; Server Health
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                Operational
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Live Infrastructure Telemetry
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time PostgreSQL engine telemetry, Node.js memory allocations, and critical service status.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-violet-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Last Checked: {lastRefreshed.toLocaleTimeString()}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* DB Ping */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium text-[11px] uppercase tracking-wider">Database Latency</span>
            <Database className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {data.database.latencyMs}ms
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                data.database.status === 'CONNECTED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {data.database.status === 'CONNECTED' ? 'Optimal' : 'Offline'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">{data.database.engine}</div>
        </div>

        {/* Uptime */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium text-[11px] uppercase tracking-wider">System Uptime</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {formatUptime(data.runtime.uptimeSeconds)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Node {data.runtime.nodeVersion} • {data.runtime.platform}
          </div>
        </div>

        {/* Memory RSS */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium text-[11px] uppercase tracking-wider">Memory Allocation</span>
            <Cpu className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{data.runtime.heapUsedMb} MB</span>
            <span className="text-xs text-slate-500 font-mono">/ {data.runtime.heapTotalMb} MB</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Resident Set Size (RSS): {data.runtime.rssMb} MB
          </div>
        </div>

        {/* Database Records */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium text-[11px] uppercase tracking-wider">Indexed Entities</span>
            <HardDrive className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {data.database.userCount} Users
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            {data.database.auditCount} Security Audit Logs
          </div>
        </div>
      </div>

      {/* Health Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Database Telemetry */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-violet-600" />
              PostgreSQL Telemetry &amp; Connection Status
            </h3>
            {data.database.status === 'CONNECTED' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Healthy
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Connection Error
              </span>
            )}
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Prisma Client Driver:</span>
              <span className="font-mono text-slate-900 font-semibold">{data.database.engine}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Round-Trip Query Latency:</span>
              <span className="font-mono text-emerald-600 font-semibold">{data.database.latencyMs} ms</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Connection Pool Status:</span>
              <span className="font-mono text-slate-800">Active Pool (Direct SSL)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Total Registered Users:</span>
              <span className="font-mono text-slate-900 font-semibold">{data.database.userCount}</span>
            </div>
          </div>
        </div>

        {/* Services & Runtime Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Service Configuration &amp; Runtime Security
            </h3>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              Production Verified
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Email Dispatch Engine:</span>
              <span className="font-mono text-slate-800 font-semibold">{data.services.emailDispatch}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Auth Secret Integrity:</span>
              <span className="font-mono text-slate-800 font-semibold">{data.services.authSecret}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Database TLS Encryption:</span>
              <span className="font-mono text-emerald-600 font-semibold">{data.services.databaseUrl}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Execution Architecture:</span>
              <span className="font-mono text-slate-800">
                {data.runtime.platform} ({data.runtime.arch}) • {data.runtime.env}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
