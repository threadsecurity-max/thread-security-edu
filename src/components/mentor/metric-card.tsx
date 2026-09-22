import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  accentColor?: 'green' | 'blue' | 'amber' | 'purple' | 'red';
}

export function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'green',
}: MetricCardProps) {
  const colorStyles = {
    green: {
      border: 'border-[#C6FF34]/20 hover:border-[#C6FF34]/40',
      iconBg: 'bg-[#C6FF34]/10 text-[#C6FF34]',
      value: 'text-white',
    },
    blue: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      value: 'text-white',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      value: 'text-white',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400',
      value: 'text-white',
    },
    red: {
      border: 'border-red-500/20 hover:border-red-500/40',
      iconBg: 'bg-red-500/10 text-red-400',
      value: 'text-white',
    },
  }[accentColor];

  return (
    <div
      className={`p-4 md:p-5 rounded-2xl bg-[#0d0d0d] backdrop-blur-md border border-white/10 ${colorStyles.border} transition-all shadow-lg hover:shadow-xl flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div className={`p-2 rounded-xl ${colorStyles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl md:text-3xl font-extrabold font-mono tracking-tight ${colorStyles.value}`}>
            {value}
          </span>
          {trend && (
            <span className="text-[10px] font-mono font-bold text-[#C6FF34]">
              {trend}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 font-sans truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
