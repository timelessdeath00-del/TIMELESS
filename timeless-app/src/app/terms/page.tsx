import React from 'react';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] text-zinc-100 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-bold">Terms of Service</span>
        </nav>

        <article className="p-8 rounded-3xl bg-[#171726] border border-[#26263B] space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7B3FF2]/20 text-[#A78BFA] flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Terms of Service</h1>
              <p className="text-[11px] text-zinc-400">Last updated: October 2026</p>
            </div>
          </div>

          <p>
            By accessing or playing games on <strong>Timeless Games</strong>, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
          </p>

          <h2 className="text-base font-bold text-white pt-2">1. Use License</h2>
          <p>
            Permission is granted to temporarily play the games hosted on Timeless Games for personal, non-commercial transitory viewing only. You may not reverse engineer, decompile, or harvest game assets without explicit permission from respective copyright owners.
          </p>

          <h2 className="text-base font-bold text-white pt-2">2. Intellectual Property</h2>
          <p>
            All game titles, characters, logos, and artwork are the intellectual property of their respective creators and distributors (including GameDistribution, GameMonetize, GamePix, Famobi, Playgama, and indie authors). Timeless Games respects intellectual property rights and acts promptly under our DMCA policy.
          </p>

          <h2 className="text-base font-bold text-white pt-2">3. Disclaimer</h2>
          <p>
            The materials on Timeless Games are provided on an &apos;as is&apos; basis. Timeless Games makes no warranties, expressed or implied, and hereby disclaims all other warranties including without limitation implied warranties of merchantability or fitness for a particular purpose.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
