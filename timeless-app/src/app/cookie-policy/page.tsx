import React from 'react';
import Link from 'next/link';
import { Cookie, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] text-zinc-100 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-bold">Cookie Policy</span>
        </nav>

        <article className="p-8 rounded-3xl bg-[#171726] border border-[#26263B] space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7B3FF2]/20 text-[#A78BFA] flex items-center justify-center">
              <Cookie className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Cookie Policy</h1>
              <p className="text-[11px] text-zinc-400">Understanding cookies on Timeless Games</p>
            </div>
          </div>

          <p>
            This Cookie Policy explains what cookies are, how we use cookies, how third-parties we partner with may use cookies on the service, and your choices regarding cookies.
          </p>

          <h2 className="text-base font-bold text-white pt-2">What Are Cookies?</h2>
          <p>
            Cookies are small text files sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the service or a third party to recognize you and make your next visit easier and the service more useful to you.
          </p>

          <h2 className="text-base font-bold text-white pt-2">How We Use Cookies</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li><strong>Essential Cookies:</strong> Used to remember your game volume preferences, dark/light theme choice, favorite game bookmarks, and recently played history in your browser.</li>
            <li><strong>Performance & Analytics:</strong> Help us understand which game categories are most popular so we can curate more content you enjoy.</li>
            <li><strong>Advertising & Third-Party Partners:</strong> Used by Google AdSense and partner game networks (GameMonetize, GameDistribution, GamePix, Famobi, Playgama) to display relevant advertisements that support free gaming for all players.</li>
          </ul>

          <h2 className="text-base font-bold text-white pt-2">Your Choices</h2>
          <p>
            You can modify your cookie preferences at any time through our on-site cookie banner or through your browser settings. Note that disabling essential cookies may prevent you from saving your favorite games or preserving game progress.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
