'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('timeless_cookie_consent');
    if (!consent) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('timeless_cookie_consent', 'accepted');
    setIsOpen(false);
  };

  const handleDecline = () => {
    localStorage.setItem('timeless_cookie_consent', 'declined');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-16 md:bottom-5 left-4 right-4 md:left-auto md:right-5 md:max-w-md z-50 rounded-2xl border border-[#26263B] bg-[#171726]/95 backdrop-blur-md p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#7B3FF2]/20 text-[#A78BFA] shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs">
          <h4 className="font-bold text-white mb-1">Your Privacy & Gaming Experience</h4>
          <p className="text-zinc-400 leading-relaxed mb-3">
            We use cookies to save your game progress, personal scores, and support non-intrusive ads from verified game providers.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAccept}
              className="px-3.5 py-1.5 rounded-full bg-[#7B3FF2] hover:bg-[#905CF6] text-white font-bold text-xs shadow-md transition-colors"
            >
              Accept All
            </button>
            <button
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-full bg-[#26263B] hover:bg-[#32324d] text-zinc-300 font-bold text-xs transition-colors"
            >
              Essential Only
            </button>
            <Link
              href="/cookie-policy"
              className="text-[11px] text-zinc-400 underline hover:text-white ml-auto"
            >
              Learn More
            </Link>
          </div>
        </div>
        <button
          onClick={handleDecline}
          className="text-zinc-500 hover:text-white p-1"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
