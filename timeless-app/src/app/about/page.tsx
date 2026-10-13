import React from 'react';
import Link from 'next/link';
import { Gamepad2, Shield, Heart, Zap, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] text-zinc-100 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-bold">About Us</span>
        </nav>

        <div className="p-8 rounded-3xl bg-[#171726] border border-[#26263B] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#7B3FF2]/20 text-[#A78BFA] flex items-center justify-center">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">About Timeless Games</h1>
              <p className="text-xs text-zinc-400">Pure, instant gaming entertainment for everyone</p>
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Welcome to <strong>Timeless Games</strong>, the premier online gaming portal dedicated to delivering instant, browser-based games with zero downloads, zero hassle, and ultra-fast loading times. Inspired by platforms like Poki and CrazyGames, our mission is to create a delightful, accessible, and safe playground for millions of players across desktop, tablet, and mobile devices.
          </p>

          <h2 className="text-lg font-black text-white pt-2">Our Core Principles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0F0F1A] border border-[#26263B]">
              <Zap className="w-5 h-5 text-amber-400 mb-2" />
              <h3 className="font-bold text-sm text-white mb-1">Instant Play</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Click and play within seconds. No installations, plugins, or software downloads required.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0F0F1A] border border-[#26263B]">
              <Shield className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="font-bold text-sm text-white mb-1">Safe & Secure</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                All games run inside sandboxed environments that prioritize user privacy and safety.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0F0F1A] border border-[#26263B]">
              <Heart className="w-5 h-5 text-pink-500 mb-2" />
              <h3 className="font-bold text-sm text-white mb-1">Developer-First</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We partner with game creators and vetted distributor networks to fairly share revenue and celebrate great games.
              </p>
            </div>
          </div>

          <h2 className="text-lg font-black text-white pt-2">Curated Game Catalog</h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            From high-speed racing simulations and tactical FPS arenas to relaxing block puzzles and 2-player cooperative adventures, our collection is curated daily to ensure high visual quality, engaging mechanics, and responsive mobile compatibility.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
