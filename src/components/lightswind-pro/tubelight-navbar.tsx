'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  LucideIcon,
  BookOpen,
  Layers,
  Phone,
  Sparkles,
  Users,
  Award,
  ShieldCheck,
  Home,
  Code,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Layers,
  Phone,
  Sparkles,
  Users,
  Award,
  ShieldCheck,
  Home,
  Code,
  GraduationCap,
};

export interface NavItem {
  name: string;
  url: string;
  icon?: LucideIcon | string;
}

export interface TubelightNavbarProps {
  items: NavItem[];
  className?: string;
  children?: React.ReactNode;
}

export function TubelightNavbar({ items, className, children }: TubelightNavbarProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>(items[0]?.name || '');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Sync active tab on pathname change
  useEffect(() => {
    const current = items.find((item) => {
      if (item.url === '/' && pathname === '/') return true;
      if (item.url !== '/' && !item.url.startsWith('/#') && pathname.startsWith(item.url)) return true;
      return false;
    });
    if (current) {
      setActiveTab(current.name);
    }
  }, [pathname, items]);

  const currentTab = hoveredTab || activeTab;

  return (
    <div
      className={cn(
        'relative flex items-center gap-1.5 p-1 bg-white/70 backdrop-blur-md rounded-full border border-black/10 shadow-sm',
        className
      )}
      onMouseLeave={() => setHoveredTab(null)}
    >
      {items.map((item) => {
        const IconComponent = typeof item.icon === 'string' ? iconMap[item.icon] : item.icon;
        const isCurrent = currentTab === item.name;
        const isActive = activeTab === item.name;

        return (
          <Link
            key={item.name}
            href={item.url}
            onClick={() => setActiveTab(item.name)}
            onMouseEnter={() => setHoveredTab(item.name)}
            className={cn(
              'relative px-4 py-1.5 rounded-full text-sm font-bold tracking-tight transition-colors duration-200 flex items-center gap-2 select-none z-10',
              isActive ? 'text-black font-extrabold' : 'text-neutral-600 hover:text-black'
            )}
          >
            {IconComponent && <IconComponent className="w-4 h-4 shrink-0" />}
            <span>{item.name}</span>

            {/* Flashlight / Torch Tubelight Effect */}
            {isCurrent && (
              <motion.div
                layoutId="tubelight-lamp"
                className="absolute inset-0 w-full h-full bg-black/[0.06] rounded-full -z-10"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 32,
                }}
              >
                {/* Filament Light Bar on Top */}
                <div className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-black rounded-t-full shadow-sm">
                  {/* Concentrated Torch Flare */}
                  <div className="absolute -top-1 -left-2.5 w-13 h-4 bg-black/40 rounded-full blur-[3px]" />
                  {/* Wider Flashlight Ambient Glow */}
                  <div className="absolute -top-1.5 -left-5 w-18 h-7 bg-black/20 rounded-full blur-[6px]" />
                  {/* Downward Torch Beam / Light Cone */}
                  <div
                    className="absolute top-0 -left-6 w-20 h-10 rounded-b-full blur-[4px] pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at top, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0) 75%)',
                    }}
                  />
                </div>
              </motion.div>
            )}
          </Link>
        );
      })}

      {children && (
        <div className="relative z-10 flex items-center pl-1 border-l border-neutral-200/80">
          {children}
        </div>
      )}
    </div>
  );
}

export default TubelightNavbar;
