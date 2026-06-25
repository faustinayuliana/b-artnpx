"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Info,
  ShieldCheck,
  Zap,
  Mail,
  Compass,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: "Buying",
    question: "How do I purchase digital art on B.Art?",
    answer: "You can browse our gallery, add artworks to your cart, and proceed to checkout. You can pay using BCA, Mandiri, BNI, BRI, OVO, Dana, ShopeePay, GoPay, or directly from your B.Art Wallet. Once paid, the artwork is instantly added to your collection, and you can download the high-resolution asset from your profile.",
  },
  {
    category: "Buying",
    question: "Are there any service fees for buying?",
    answer: "B.Art charges a minimal administrative fee of Rp2.500 and a service fee of Rp1.500 per transaction to support platform hosting and secure escrow systems. Taxes are calculated at 11% of the subtotal.",
  },
  {
    category: "Selling",
    question: "How do I become a creator and sell my art?",
    answer: "Go to the 'Become Artist' page from your profile menu. You will need to upload a sample of your portfolio (PDF, PNG, JPG, or ZIP) and verify your identity using a valid KTP. Once verified, your profile is immediately upgraded to an Artist role, and you can upload your artworks from the Artist Dashboard.",
  },
  {
    category: "Selling",
    question: "What are the artist badge tiers and how do I upgrade?",
    answer: "Every creator starts with a Beginner (Copper) badge. As your sales grow, our system automatically upgrades your badge tier: Beginner -> Intermediate (Silver) at Rp500.000 in sales, and Professional (Gold/Platinum) at Rp2.000.000 in sales. Higher badge tiers unlock search ranking boosts and featured home page placements.",
  },
  {
    category: "Wallet",
    question: "How does the B.Art Wallet work?",
    answer: "The B.Art Wallet is your primary on-platform currency. You can top up your wallet inside your Account Settings using credit card simulation, or receive earnings directly from art sales. Wallet funds can be used for instant checkouts or withdrawn to your linked bank account/e-wallet.",
  },
  {
    category: "Commissions",
    question: "What is an 'Open Commission' and how does it work?",
    answer: "Artists can list 'Open Commission' slots. When you buy a commission, you submit your custom request details to the artist. The artist then designs a custom portrait, chibi, or character sheet tailored specifically to your request, and delivers it through the platform.",
  },
];

export default function HelpCenterPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent! Our support team will get back to you shortly.", { icon: "✉️" });
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      setSubmitting(false);
    }, 1200);
  };

  const categories = ["All", "Buying", "Selling", "Wallet", "Commissions"];

  const filteredFaqs = activeCategory === "All" 
    ? FAQS 
    : FAQS.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Toaster position="top-right" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 text-zinc-400 hover:text-white transition font-semibold text-sm">
          <ChevronLeft size={18} /> Back to Gallery
        </Link>
        <span className="text-2xl font-bold font-serif bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-playfair), serif" }}>
          B.Art
        </span>
        <div className="w-24"></div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 space-y-16">
        
        {/* HERO */}
        <div className="text-center space-y-4 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Pusat Bantuan & Tentang Kami
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Discover the story behind B.Art, read answers to frequently asked questions, or get in touch with our creators and support team.
          </p>
        </div>

        {/* ABOUT US SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center bg-gradient-to-br from-zinc-900/40 via-zinc-900/20 to-purple-950/10 border border-zinc-850 p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold uppercase tracking-widest">
              <Info size={14} /> Our Story & Mission
            </div>
            <h2 className="text-3xl font-bold font-serif text-white leading-tight" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Empowering Creators, Honoring Artistry.
            </h2>
            <p className="text-sm text-zinc-450 leading-relaxed">
              Founded in 2026, **B.Art** is a premium digital art marketplace designed to bridge the gap between talented creators and passionate collectors. We believe that every artist deserves a secure, high-fidelity platform to showcase their work, and every collector deserves authentic, consistent, and high-quality digital assets.
            </p>
            <p className="text-sm text-zinc-450 leading-relaxed">
              Our platform utilizes secure transactions, an auto-upgrading artist ranking system, and robust payment options to ensure the absolute best trading experience. Whether you are looking for high-res wallpapers, sticker packs, mecha concept designs, or custom commissions, B.Art is your home.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-850/50">
              <div>
                <h4 className="text-2xl font-bold text-white font-serif">10K+</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Artworks Sold</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white font-serif">1.5K+</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Active Artists</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-white font-serif">99.8%</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Secure Escrow</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, title: "Verified Artists", desc: "Every creator undergoes secure NIK/KTP validation." },
              { icon: Zap, title: "Instant Access", desc: "Direct download of files and assets post purchase." },
              { icon: BookOpen, title: "Rich Formats", desc: "PNG, JPG, PDF, or ZIP digital bundles." },
              { icon: Compass, title: "Global Tastes", desc: "From Japanese sumi-e to cyberpunk illustrations." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 w-fit">
                  <Icon size={18} />
                </div>
                <h4 className="text-xs font-bold text-white">{title}</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold font-serif text-white flex items-center justify-center gap-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
              <HelpCircle className="text-purple-400" size={26} /> Frequently Asked Questions
            </h2>
            <p className="text-xs text-zinc-500">Quick answers to common questions about buying, selling, and commissioning.</p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => { setActiveCategory(cat); setOpenFaqIndex(null); }}
                className={`text-xs px-4 py-2 rounded-full font-semibold transition ${
                  activeCategory === cat 
                    ? "bg-purple-600 text-white shadow-lg" 
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ Accordion list */}
          <div className="max-w-3xl mx-auto space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className={`rounded-2xl border transition duration-300 overflow-hidden ${
                    isOpen 
                      ? "bg-zinc-900 border-purple-500/55 shadow-lg" 
                      : "bg-zinc-900/40 border-zinc-850 hover:border-zinc-800"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-6 py-4.5 flex justify-between items-center gap-4 focus:outline-none"
                  >
                    <span className="text-sm font-semibold text-white">{faq.question}</span>
                    <span className="text-zinc-500 shrink-0">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-850/40 animate-slideDown">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CONTACT US FORM */}
        <section className="max-w-xl mx-auto bg-zinc-900/50 border border-zinc-850 rounded-[2rem] p-8 space-y-6 shadow-xl">
          <div className="text-center space-y-1">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full w-fit mx-auto">
              <Mail size={20} />
            </div>
            <h3 className="text-xl font-bold font-serif text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>Hubungi Kami • Contact Us</h3>
            <p className="text-xs text-zinc-500">Have an issue or a special request? Drop us a message.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-450 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-455 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  placeholder="john@gmail.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-455 uppercase tracking-wider block">Message</label>
              <textarea
                placeholder="Describe your question or feedback in detail..."
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        </section>

      </main>
    </div>
  );
}
