'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  UserCircle,
  Flag,
  Trophy,
  Shield,
  ArrowLeft,
  Gift,
  Users,
  HeartHandshake,
  Award,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icon keys only — Server Components must not pass Lucide components as props (not serializable).
 */
const NAV_ICONS = {
  summary: LayoutDashboard,
  profile: UserCircle,
  scores: Flag,
  winnings: Trophy,
  'admin-panel': Shield,
  back: ArrowLeft,
  analytics: LayoutDashboard,
  draws: Gift,
  users: Users,
  charities: HeartHandshake,
  winners: Award,
} as const satisfies Record<string, LucideIcon>;

export type AppShellIconKey = keyof typeof NAV_ICONS;

export type AppShellNavItem = {
  href: string;
  label: string;
  icon: AppShellIconKey;
  className?: string;
};

export function AppShell({
  title,
  subtitle,
  navItems,
  children,
}: {
  title: string;
  subtitle?: string;
  navItems: AppShellNavItem[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row md:h-screen">
      <header className="shrink-0 md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 z-30">
        <div>
          <h2 className="text-lg font-bold text-charity-dark">{title}</h2>
          {subtitle ? <p className="text-xs text-gray-500">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          aria-label="Open menu"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700"
          onClick={() => setOpen(true)}
        >
          <Menu size={24} />
        </button>
      </header>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={[
          'fixed md:static inset-y-0 left-0 z-50 w-64 max-w-[85vw] bg-white border-r border-gray-200 flex flex-col shadow-sm',
          'transform transition-transform duration-200 ease-out md:translate-x-0 md:max-w-none',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="p-6 hidden md:block">
          <h2 className="text-2xl font-bold text-charity-dark">{title}</h2>
          {subtitle ? <p className="text-xs text-gray-500 mt-1">{subtitle}</p> : null}
        </div>
        <div className="p-4 md:hidden flex items-center justify-between border-b border-gray-100">
          <h2 className="text-xl font-bold text-charity-dark">{title}</h2>
          <button
            type="button"
            aria-label="Close menu"
            className="p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            <X size={22} />
          </button>
        </div>
        <nav
          className="flex-1 px-4 space-y-2 pb-8 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          {navItems.map((item) => {
            const Icon = NAV_ICONS[item.icon] ?? LayoutDashboard;
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={
                  item.className ??
                  'flex items-center gap-3 p-3 text-gray-700 hover:bg-charity-light hover:text-charity-dark rounded-lg transition'
                }
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto w-full">{children}</main>
    </div>
  );
}
