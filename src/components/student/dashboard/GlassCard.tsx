import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3;
  glow?: boolean;
}

export function GlassCard({
  level = 1,
  glow = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  const levelStyles = {
    1: 'bg-white/[0.03] border-white/[0.08] backdrop-blur-xl hover:border-white/[0.12]',
    2: 'bg-white/[0.05] border-white/[0.10] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.36)] hover:border-white/[0.16]',
    3: 'bg-gradient-to-b from-white/[0.07] to-white/[0.02] border-white/[0.14] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
  };

  const glowStyles = glow
    ? 'relative before:absolute before:-inset-px before:rounded-3xl before:bg-gradient-to-b before:from-[#C6FF34]/20 before:to-transparent before:-z-10 before:opacity-80'
    : '';

  return (
    <div
      className={cn(
        'rounded-3xl border transition-all duration-300 relative overflow-hidden',
        levelStyles[level],
        glowStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
