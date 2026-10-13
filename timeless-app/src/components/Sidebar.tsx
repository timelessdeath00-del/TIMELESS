'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Flame,
  Sparkles,
  Star,
  Users,
  Gamepad2,
  Sword,
  Car,
  Puzzle,
  Trophy,
  Crosshair,
  Compass,
  History,
  Heart,
  Smile,
  ShieldCheck,
  HelpCircle,
  FileText,
  LayoutDashboard,
} from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isExpanded, onClose }: SidebarProps) {
  const pathname = usePathname();

  const mainNavItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Trending', href: '/category/trending', icon: Flame },
    { label: 'New', href: '/category/new', icon: Sparkles },
    { label: 'Top Rated', href: '/category/top-rated', icon: Star },
    { label: 'Multiplayer', href: '/category/multiplayer', icon: Users },
    { label: '2 Player', href: '/category/2-player', icon: Gamepad2 },
  ];

  const categoryItems = [
    { label: 'Action', href: '/category/action', icon: Sword },
    { label: 'Racing', href: '/category/racing', icon: Car },
    { label: 'Puzzle', href: '/category/puzzle', icon: Puzzle },
    { label: 'Sports', href: '/category/sports', icon: Trophy },
    { label: 'Shooting', href: '/category/shooting', icon: Crosshair },
    { label: 'Adventure', href: '/category/adventure', icon: Compass },
    { label: 'Casual', href: '/category/casual', icon: Smile },
  ];

  const userItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Favorites', href: '/favorites', icon: Heart },
    { label: 'History', href: '/history', icon: History },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Drawer Backdrop when expanded */}
      {isExpanded && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Desktop Rail / Expanded Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-40 bg-[#0F0F1A] border-r border-[#26263B] transition-all duration-300 ease-in-out flex flex-col justify-between overflow-y-auto no-scrollbar ${
          isExpanded ? 'w-60 translate-x-0' : 'w-16 hidden md:flex'
        }`}
      >
        <div className="p-2 space-y-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <div key={item.label} className="relative group">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      active
                        ? 'bg-[#7B3FF2] text-white shadow-lg shadow-[#7B3FF2]/30'
                        : 'text-zinc-400 hover:text-white hover:bg-[#171726]'
                    } ${!isExpanded ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {isExpanded && <span className="truncate">{item.label}</span>}
                  </Link>

                  {/* Rail Tooltip on Hover */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block px-2.5 py-1 rounded-lg bg-[#171726] border border-[#26263B] text-xs font-bold text-white shadow-xl pointer-events-none whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#26263B] my-2" />

          {/* Categories */}
          <div>
            {isExpanded && (
              <span className="px-3 text-[11px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                Categories
              </span>
            )}
            <div className="space-y-1">
              {categoryItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <div key={item.label} className="relative group">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-[#7B3FF2] text-white shadow-md shadow-[#7B3FF2]/30'
                          : 'text-zinc-400 hover:text-white hover:bg-[#171726]'
                      } ${!isExpanded ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {isExpanded && <span className="truncate">{item.label}</span>}
                    </Link>

                    {!isExpanded && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block px-2.5 py-1 rounded-lg bg-[#171726] border border-[#26263B] text-xs font-bold text-white shadow-xl pointer-events-none whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Library */}
          <div className="h-px bg-[#26263B] my-2" />
          <div>
            {isExpanded && (
              <span className="px-3 text-[11px] font-black uppercase tracking-wider text-zinc-500 block mb-1">
                My Library
              </span>
            )}
            <div className="space-y-1">
              {userItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <div key={item.label} className="relative group">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-[#7B3FF2] text-white shadow-md shadow-[#7B3FF2]/30'
                          : 'text-zinc-400 hover:text-white hover:bg-[#171726]'
                      } ${!isExpanded ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {isExpanded && <span className="truncate">{item.label}</span>}
                    </Link>

                    {!isExpanded && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block px-2.5 py-1 rounded-lg bg-[#171726] border border-[#26263B] text-xs font-bold text-white shadow-xl pointer-events-none whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Legal Links inside Expanded Sidebar */}
        {isExpanded && (
          <div className="p-3 border-t border-[#26263B] text-[11px] text-zinc-500 space-y-1">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <Link href="/about" className="hover:text-zinc-300">About</Link>
              <Link href="/privacy" className="hover:text-zinc-300">Privacy</Link>
              <Link href="/terms" className="hover:text-zinc-300">Terms</Link>
              <Link href="/contact" className="hover:text-zinc-300">Contact</Link>
            </div>
            <p className="text-[10px] text-zinc-600 mt-2">© 2026 Timeless Games</p>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#0F0F1A]/95 backdrop-blur-md border-t border-[#26263B] flex items-center justify-around md:hidden px-2">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname === '/' ? 'text-[#7B3FF2]' : 'text-zinc-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/category/trending"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname.includes('trending') ? 'text-[#7B3FF2]' : 'text-zinc-400'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span>Trending</span>
        </Link>
        <Link
          href="/category/multiplayer"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname.includes('multiplayer') ? 'text-[#7B3FF2]' : 'text-zinc-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Multiplayer</span>
        </Link>
        <Link
          href="/favorites"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname.includes('favorites') ? 'text-[#7B3FF2]' : 'text-zinc-400'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span>Favorites</span>
        </Link>
      </nav>
    </>
  );
}
