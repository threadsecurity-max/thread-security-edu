import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Cpu, ShieldCheck, Sparkles } from 'lucide-react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        security:
          'border-security-green/30 bg-security-green-soft text-security-green-dark font-bold',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border-border',
        tsid: 'border-security-green/40 bg-primary-dark text-security-green font-mono text-xs tracking-wider px-3 py-1 shadow-sm',
        tsidAi: 'border-purple-500/50 bg-[#120726] text-purple-300 font-mono text-xs tracking-wider px-3 py-1 shadow-md shadow-purple-950/40 font-bold gap-1',
        tsidCyber: 'border-emerald-500/50 bg-[#04161a] text-emerald-400 font-mono text-xs tracking-wider px-3 py-1 shadow-md shadow-emerald-950/40 font-bold gap-1',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export function TSIDBadge({ tsId, className }: { tsId: string; className?: string }) {
  if (!tsId) {
    return <Badge variant="tsid" className={className}>N/A</Badge>;
  }

  const upper = tsId.toUpperCase();
  const isAi = upper.startsWith('TS-A') || upper.includes('-AI-');
  const isCyber = upper.startsWith('TS-C') || upper.includes('-C-');

  if (isAi) {
    return (
      <Badge variant="tsidAi" className={cn('inline-flex items-center gap-1', className)}>
        <Cpu className="w-3 h-3 text-purple-400 shrink-0" />
        <span>{tsId}</span>
      </Badge>
    );
  }

  if (isCyber) {
    return (
      <Badge variant="tsidCyber" className={cn('inline-flex items-center gap-1', className)}>
        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>{tsId}</span>
      </Badge>
    );
  }

  return <Badge variant="tsid" className={className}>{tsId}</Badge>;
}

export { Badge, badgeVariants };

