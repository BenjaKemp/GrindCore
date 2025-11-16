'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Receipt, 
  Rocket, 
  Gift, 
  Settings, 
  Menu, 
  X,
  Wallet,
  Crown,
  Handshake
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Income Streams', href: '/dashboard/income', icon: TrendingUp },
  { name: 'P2P Lending', href: '/dashboard/p2p', icon: Handshake },
  { name: 'Tax & ISA', href: '/dashboard/tax', icon: Receipt },
  { name: 'Crypto Staking', href: '/dashboard/crypto', icon: Rocket, pro: true },
  { name: 'Affiliates', href: '/dashboard/affiliates', icon: Gift },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg bg-white dark:bg-zinc-900 p-2 shadow-lg border border-zinc-200 dark:border-zinc-800"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-60 border-r bg-white backdrop-blur-xl transition-transform lg:translate-x-0 shadow-xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--card)',
        }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b px-6" style={{ borderColor: 'var(--border)' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-purple">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Side-Hustle
              </span>
              <p className="text-xs text-zinc-500">Vault</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-sm dark:from-purple-950 dark:to-pink-950 dark:text-purple-300'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:shadow-sm dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className={`rounded-lg p-1.5 ${isActive ? 'bg-white shadow-sm' : 'group-hover:bg-white group-hover:shadow-sm'}`}>
                    <Icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : 'text-zinc-500 group-hover:text-purple-600'}`} />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {item.pro && (
                    <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      PRO
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
            <div className="rounded-xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 shadow-sm dark:from-purple-950 dark:via-pink-950 dark:to-blue-950">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-1 shadow-sm">
                  <Crown className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-bold">Upgrade to Pro</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-3 leading-relaxed">
                Unlock crypto tracking, advanced tax tools, and more.
              </p>
              <button className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-xs font-medium text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                Upgrade Now →
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

