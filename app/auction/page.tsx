"use client";

import { useRouter } from "next/navigation";
import { Gavel, ArrowLeft, Mail } from "lucide-react";
import { usePreferencesStore } from "@/src/lib/stores";

export default function AuctionComingSoonPage() {
  const router = useRouter();
  const { language } = usePreferencesStore();

  const isIndo = language === "id";

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 text-center space-y-8 max-w-xl w-full">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl mx-auto animate-bounce">
          <Gavel size={36} className="text-white" />
        </div>

        {/* Brand */}
        <div>
          <p className="text-xs font-bold tracking-[0.4em] text-purple-400 uppercase mb-2">B.Art Auctions</p>
          <h1 className="text-5xl sm:text-6xl font-bold font-serif leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {isIndo ? "Segera Hadir" : "Coming Soon"}
          </h1>
          <p className="text-zinc-400 mt-4 text-base leading-relaxed">
            {isIndo 
              ? "Ikuti pelelangan karya seni digital secara langsung dan interaktif. Dapatkan karya paling langka dan eksklusif melalui penawaran real-time!"
              : "Participate in live and interactive digital artwork auctions. Acquire the rarest and most exclusive creations through real-time bidding wars!"}
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-600 uppercase tracking-widest">{isIndo ? "TETAP PANTAU" : "STAY TUNED"}</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 hover:text-white transition cursor-pointer">
            <Mail size={13} /> contact@b.art
          </div>
        </div>

        {/* Back button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-800 text-sm text-zinc-450 hover:text-white hover:border-zinc-700 transition"
          >
            <ArrowLeft size={16} /> {isIndo ? "Kembali" : "Go Back"}
          </button>
        </div>
      </div>
    </div>
  );
}
