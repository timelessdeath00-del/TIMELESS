import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] text-zinc-100 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-bold">Privacy Policy</span>
        </nav>

        <article className="p-8 rounded-3xl bg-[#171726] border border-[#26263B] space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Privacy Policy</h1>
              <p className="text-[11px] text-zinc-400">Effective Date: October 2026</p>
            </div>
          </div>

          <p>
            At <strong>Timeless Games</strong>, the privacy of our visitors is of extreme importance to us. This Privacy Policy document contains types of information that is collected and recorded by Timeless Games and how we use it.
          </p>

          <h2 className="text-base font-bold text-white pt-2">1. Information We Collect</h2>
          <p>
            When you visit Timeless Games, we may collect non-personally identifiable information including browser type, operating system, referring URL, time spent on pages, and localized preferences. If you choose to log in using Google OAuth, we receive your public profile display name, email address, and avatar URL solely to customize your gaming library and preserve your game progress.
          </p>

          <h2 className="text-base font-bold text-white pt-2">2. Third-Party Game Providers & Ad Networks</h2>
          <p>
            Our website partners with trusted third-party game distribution networks to serve HTML5 games, including:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-400">
            <li><strong>GameDistribution</strong> (gamedistribution.com)</li>
            <li><strong>GameMonetize</strong> (gamemonetize.com)</li>
            <li><strong>GamePix</strong> (gamepix.com)</li>
            <li><strong>Famobi</strong> (famobi.com)</li>
            <li><strong>Playgama</strong> (playgama.com)</li>
            <li><strong>Google AdSense</strong> (google.com/adsense)</li>
          </ul>
          <p>
            These third-party ad servers or networks use technologies like cookies, JavaScript, or Web Beacons that are sent directly to users&apos; browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
          </p>

          <h2 className="text-base font-bold text-white pt-2">3. Google DoubleClick DART Cookie</h2>
          <p>
            Google is one of our third-party vendors. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. Visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at{' '}
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-[#A78BFA] underline">
              Google Ads Policies
            </a>.
          </p>

          <h2 className="text-base font-bold text-white pt-2">4. GDPR and CCPA Rights</h2>
          <p>
            Under GDPR (for European Union users) and CCPA (for California users), you have the right to request access to, deletion of, or restriction of your personal data. You may reject non-essential cookies at any time via our Cookie Banner.
          </p>

          <h2 className="text-base font-bold text-white pt-2">5. Contact Us</h2>
          <p>
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at{' '}
            <Link href="/contact" className="text-[#A78BFA] underline">
              Contact Support
            </Link>.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
