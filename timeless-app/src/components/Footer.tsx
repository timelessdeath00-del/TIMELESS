import React from 'react';
import Link from 'next/link';
import { Gamepad2, Heart, Shield, FileCheck, Mail, Sparkles } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#26263B] bg-[#0A0A12] mt-16 text-zinc-400 select-none pb-16 md:pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7B3FF2] to-[#A78BFA] flex items-center justify-center text-white shadow-lg">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">TIMELESS</span>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Play thousands of free online games instantly in your web browser. No downloads, no installs, just pure gaming excitement anytime, on any device.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Over 24+ Instant Play HTML5 Games</span>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-3">
              Explore Genres
            </h4>
            <ul className="space-y-1.5 text-xs">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name} Games
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Genres */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-3">
              More Categories
            </h4>
            <ul className="space-y-1.5 text-xs">
              {CATEGORIES.slice(6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name} Games
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/category/multiplayer" className="hover:text-white transition-colors">
                  Multiplayer .io Games
                </Link>
              </li>
              <li>
                <Link href="/category/2-player" className="hover:text-white transition-colors">
                  2 Player Co-op
                </Link>
              </li>
            </ul>
          </div>

          {/* AdSense Compliance & Legal Pages */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-3">
              Legal & Support
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="hover:text-white transition-colors">
                  DMCA Copyright Notice
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-white transition-colors">
                  Cookie Policy & Consent
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#26263B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 Timeless Games. All games and trademarks are the property of their respective creators.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Secured HTML5 Sandbox</span>
            <span>•</span>
            <span>Optimized for Desktop & Mobile</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
