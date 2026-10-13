import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DmcaPage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] text-zinc-100 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-bold">DMCA Copyright Policy</span>
        </nav>

        <article className="p-8 rounded-3xl bg-[#171726] border border-[#26263B] space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">DMCA Copyright Policy</h1>
              <p className="text-[11px] text-zinc-400">Notice and Procedure for Making Claims</p>
            </div>
          </div>

          <p>
            Timeless Games respects the intellectual property rights of others and expects its users and partners to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (17 U.S.C. § 512), we respond expeditiously to notices of alleged copyright infringement.
          </p>

          <h2 className="text-base font-bold text-white pt-2">How to Submit a Notice</h2>
          <p>
            If you are a copyright owner or an authorized agent thereof and believe that any content hosted or linked on Timeless Games infringes upon your copyright, you may submit a notification pursuant to the DMCA by providing our Designated Agent with the following information in writing:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
            <li>Identification of the copyrighted work claimed to have been infringed, or a representative list of such works.</li>
            <li>Identification of the material that is claimed to be infringing, including the specific URL on Timeless Games.</li>
            <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and email address.</li>
            <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
          </ul>

          <h2 className="text-base font-bold text-white pt-2">Expedited Takedown Contact</h2>
          <p>
            Please send all notices to our copyright agent via our{' '}
            <Link href="/contact" className="text-[#A78BFA] underline">
              Contact Form
            </Link>{' '}
            with the subject line &ldquo;DMCA Copyright Notice&rdquo;. We will review and remove verified infringing content within 24 business hours.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
