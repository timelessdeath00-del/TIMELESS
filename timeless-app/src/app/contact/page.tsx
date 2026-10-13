'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle, ChevronRight, MessageSquare } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-zinc-100 flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full">
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-bold">Contact Support</span>
        </nav>

        <div className="p-8 rounded-3xl bg-[#171726] border border-[#26263B]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#7B3FF2]/20 text-[#A78BFA] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Get in Touch</h1>
              <p className="text-xs text-zinc-400">Questions, developer submissions, or DMCA requests</p>
            </div>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center space-y-2">
              <CheckCircle className="w-8 h-8 mx-auto" />
              <h3 className="font-bold text-sm">Message Received!</h3>
              <p className="text-xs text-zinc-300">
                Thank you for contacting Timeless Games. Our support team responds within 24-48 business hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-zinc-300 font-bold mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alex Rivers"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-zinc-100 focus:outline-none focus:border-[#7B3FF2]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-zinc-100 focus:outline-none focus:border-[#7B3FF2]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Subject</label>
                <select className="w-full px-3 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-zinc-100 focus:outline-none focus:border-[#7B3FF2]">
                  <option>General Support / Bug Report</option>
                  <option>Game Submission / Developer Partnership</option>
                  <option>Advertising & Sponsorship Inquiry</option>
                  <option>DMCA Copyright Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help you?"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-zinc-100 focus:outline-none focus:border-[#7B3FF2]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#7B3FF2] hover:bg-[#905cf6] text-white font-extrabold text-xs transition-all shadow-lg shadow-[#7B3FF2]/30 active:scale-95"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
