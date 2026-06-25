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
  X,
  CreditCard,
  FileText,
  BadgeAlert,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/src/lib/stores";
import toast, { Toaster } from "react-hot-toast";

export default function BecomeArtistPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Verification Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [ktpNumber, setKtpNumber] = useState("");
  const [bankName, setBankName] = useState("Mandiri");
  const [accountNumber, setAccountNumber] = useState("");
  const [verified, setVerified] = useState(false);

  const handleOpenVerification = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!agreed) {
      toast.error("Please agree to the Artist Terms first");
      return;
    }
    setModalOpen(true);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ktpNumber || !accountNumber) {
      toast.error("Please fill in all verification fields");
      return;
    }

    if (ktpNumber !== "123456") {
      toast.error("Invalid KTP Number. Verification failed.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user?action=become-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ktpNumber,
          bankName,
          accountNumber,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setVerified(true);
        toast.success("🎉 Verification successful! Welcome to the creator program.");
      } else {
        toast.error(data.error || "Failed to process verification");
      }
    } catch {
      toast.error("Something went wrong during verification");
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden">
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
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {[
              { step: "1", label: "Apply & Verify", desc: "Submit your legal details to verify your identity instantly" },
              { step: "2", label: "Upload Art", desc: "Go to your artist dashboard and add your first artwork" },
              { step: "3", label: "Get Paid", desc: "Sales are automatically credited to your B.Art wallet" },
            ].map(({ step, label, desc }, idx) => (
              <div key={step} className="flex-1 flex flex-col items-center text-center gap-3 relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                  {step}
                </div>
                <h4 className="font-bold text-white mt-1">{label}</h4>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-[220px]">{desc}</p>
                {idx < 2 && (
                  <ArrowRight size={18} className="text-zinc-800 hidden sm:block absolute -right-4 top-4 translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* APPLY CTA */}
        {user?.role === "ARTIST" ? (
          <div className="text-center space-y-4 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-5 py-3 bg-green-950/30 border border-green-800/40 text-green-400 rounded-2xl text-sm font-semibold">
              <CheckCircle size={18} /> You are already an Artist!
            </div>
            <div>
              <Link
                href="/artist/manage"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-zinc-100 text-zinc-955 font-bold rounded-2xl transition text-base shadow-xl hover:shadow-purple-500/10"
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
                <p className="text-sm text-zinc-500">Submit verification details to unlock your store</p>
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
              <span className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                I agree to the B.Art{" "}
                <span className="text-purple-400 cursor-pointer hover:underline">Artist Terms & Conditions</span>,
                including the platform fee (10% per sale) and identity verification requirements.
              </span>
            </label>

            <button
              type="button"
              onClick={handleOpenVerification}
              disabled={!agreed}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 disabled:opacity-50 text-base shadow-lg shadow-purple-900/25"
            >
              <Sparkles size={18} />
              Verify & Activate Account
            </button>
          </div>
        )}
      </main>

      {/* VERIFICATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] w-full max-w-md overflow-hidden relative shadow-2xl">
            {/* Close Button */}
            {!verified && (
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-500 hover:text-white transition p-1"
              >
                <X size={18} />
              </button>
            )}

            {!verified ? (
              /* FORM STATE */
              <form onSubmit={handleVerifySubmit} className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-purple-600/10 flex items-center justify-center mx-auto text-purple-400">
                    <Shield size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Identity Verification</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Verify your credentials to register as a seller on B.Art.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* KTP Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={13} /> KTP Number (NIK)
                    </label>
                    <input
                      type="text"
                      required
                      value={ktpNumber}
                      onChange={(e) => setKtpNumber(e.target.value)}
                      placeholder="Enter KTP Number"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white"
                    />
                    <p className="text-[10px] text-zinc-650 font-mono">Use simulation KTP: 123456</p>
                  </div>

                  {/* Bank Account Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard size={13} /> Bank
                      </label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white"
                      >
                        {["Mandiri", "BCA", "BNI", "BRI", "OVO", "Dana"].map((bank) => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        Account Number
                      </label>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="1200012345"
                        className="w-full bg-zinc-955 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Verifying...
                    </>
                  ) : (
                    "Submit Verification"
                  )}
                </button>
              </form>
            ) : (
              /* SUCCESS STATE */
              <div className="p-8 text-center space-y-6 animate-scaleIn">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-green-400">
                  <CheckCircle size={32} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Verification Success!</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-550/20 rounded-full text-purple-400 text-xs font-bold uppercase tracking-widest mt-1">
                    <Star size={11} className="fill-purple-400" /> Copper Artist Badge
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto pt-3">
                    Your credentials have been authenticated. Your account role has been updated from <strong className="text-white">USER</strong> to <strong className="text-white">ARTIST</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    router.push("/artist/manage");
                  }}
                  className="w-full py-3.5 bg-white hover:bg-zinc-150 text-zinc-950 font-bold rounded-xl transition shadow-lg text-sm"
                >
                  Go to Artist Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
