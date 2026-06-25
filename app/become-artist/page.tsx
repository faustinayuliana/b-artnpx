"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Sparkles,
  Palette,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/src/lib/stores";
import toast, { Toaster } from "react-hot-toast";

export default function BecomeArtistPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleApply = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!agreed) {
      toast.error("Please agree to the Artist Terms first");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user?action=become-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        toast.success("🎉 Welcome to B.Art as an Artist!");
        setTimeout(() => router.push("/artist/manage"), 1500);
      } else {
        toast.error(data.error || "Failed to apply");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const PERKS = [
    {
      icon: Palette,
      title: "Upload & Sell Your Art",
      desc: "List digital artworks, illustrations, commissions and more",
    },
    {
      icon: TrendingUp,
      title: "Earn Real Money",
      desc: "Get paid directly to your B.Art wallet on every sale",
    },
    {
      icon: Users,
      title: "Grow Your Audience",
      desc: "Reach thousands of art collectors and enthusiasts",
    },
    {
      icon: Shield,
      title: "Protected Transactions",
      desc: "Secure payments with B.Art's escrow system",
    },
    {
      icon: Star,
      title: "Badge & Rankings",
      desc: "Unlock Copper → Silver → Gold → Platinum → Diamond tiers",
    },
    {
      icon: Sparkles,
      title: "Featured Placement",
      desc: "Top artists get promoted on the home page slider",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <Toaster position="top-right" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center gap-4">
        <Link href="/home" className="p-2 hover:bg-zinc-900 rounded-xl transition text-zinc-400 hover:text-white">
          <ChevronLeft size={20} />
        </Link>
        <span
          className="text-2xl font-bold font-serif bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          B.Art
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-16">

        {/* HERO */}
        <div className="text-center space-y-6 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} /> Artist Program
            </div>
            <h1
              className="text-4xl sm:text-6xl font-bold text-white leading-tight font-serif"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Share Your Art.<br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Earn Your Worth.
              </span>
            </h1>
            <p className="text-zinc-400 text-lg mt-4 max-w-xl mx-auto leading-relaxed">
              Join thousands of digital artists on B.Art marketplace and turn your passion into income.
            </p>
          </div>
        </div>

        {/* PERKS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-purple-500/30 transition group"
            >
              <div className="p-3 bg-purple-600/10 rounded-xl w-fit mb-4 group-hover:bg-purple-600/20 transition">
                <Icon size={22} className="text-purple-400" />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* HOW IT WORKS */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-white">How It Works</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {[
              { step: "1", label: "Apply", desc: "Click the button below to activate your artist account instantly" },
              { step: "2", label: "Upload Art", desc: "Go to your artist dashboard and add your first artwork" },
              { step: "3", label: "Get Paid", desc: "Sales are automatically credited to your B.Art wallet" },
            ].map(({ step, label, desc }, idx) => (
              <div key={step} className="flex-1 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                  {step}
                </div>
                <h4 className="font-bold text-white">{label}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
                {idx < 2 && <ArrowRight size={20} className="text-zinc-700 rotate-90 sm:rotate-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* APPLY CTA */}
        {user?.role === "ARTIST" ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-5 py-3 bg-green-950/30 border border-green-800/40 text-green-400 rounded-2xl text-sm font-semibold">
              <CheckCircle size={18} /> You are already an Artist!
            </div>
            <div>
              <Link
                href="/artist/manage"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-2xl transition text-base"
              >
                Go to Artist Dashboard <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto p-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/20 rounded-2xl">
                <Palette size={28} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Ready to start?</h3>
                <p className="text-sm text-zinc-500">Your artist account will be activated immediately</p>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition ${
                  agreed ? "bg-purple-600 border-purple-600" : "border-zinc-700 bg-zinc-900"
                }`}
              >
                {agreed && <CheckCircle size={13} className="text-white" />}
              </div>
              <span className="text-sm text-zinc-400 leading-relaxed">
                I agree to the B.Art{" "}
                <span className="text-purple-400 cursor-pointer hover:underline">Artist Terms & Conditions</span>,
                including the platform fee (10% per sale) and content ownership policies.
              </span>
            </label>

            <button
              type="button"
              onClick={handleApply}
              disabled={loading || !agreed}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 disabled:opacity-50 text-base"
            >
              <Sparkles size={18} />
              {loading ? "Activating..." : "Activate Artist Account"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
