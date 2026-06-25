"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  ArrowLeft,
  Mail,
} from "lucide-react";

export default function ComingSoonPage() {
  const router = useRouter();
  const [count, setCount] = useState(7);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 text-center space-y-8 max-w-xl w-full">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl mx-auto animate-bounce">
          <Rocket size={36} className="text-white" />
        </div>

        {/* Brand */}
        <div>
          <p className="text-xs font-bold tracking-[0.4em] text-purple-400 uppercase mb-2">B.Art</p>
          <h1 className="text-5xl sm:text-6xl font-bold font-serif leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Coming Soon
          </h1>
          <p className="text-zinc-400 mt-4 text-base leading-relaxed">
            This feature is under development. We're working hard to bring you an amazing experience!
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-600 uppercase tracking-widest">Stay Tuned</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <div className="flex items-center justify-center gap-4">
          {[
            { icon: Mail, label: "hello@b.art" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <Icon size={13} /> {label}
            </div>
          ))}
        </div>

        {/* Back button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-800 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
