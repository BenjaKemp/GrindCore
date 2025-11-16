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
        className={`fixed top-0 left-0 z-40 h-screen w-60 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-transform lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-zinc-200 px-6 dark:border-zinc-800">
            <Wallet className="h-6 w-6 text-purple-600" />
            <span className="text-lg font-bold">Side-Hustle Vault</span>
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
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.pro && (
                    <span className="rounded bg-gradient-to-r from-purple-600 to-pink-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      PRO
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 p-3 dark:from-purple-950 dark:to-blue-950">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-semibold">Upgrade to Pro</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-2">
                Unlock crypto tracking, advanced tax tools, and more.
              </p>
              <button className="w-full rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

