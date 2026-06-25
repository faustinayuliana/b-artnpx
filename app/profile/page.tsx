"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  ShoppingBag,
  Heart,
  Wallet,
  Settings,
  Bell,
  ChevronRight,
  Sparkles,
  Star,
  Award,
  Palette,
  LogOut,
  Edit3,
} from "lucide-react";
import { useAuthStore } from "@/src/lib/stores";
import { formatCurrency } from "@/src/lib/format";
import toast, { Toaster } from "react-hot-toast";
import { Modal } from "@/src/components/modal";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, reset: resetAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "favorites" | "wallet">("orders");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router, setUser]);

  useEffect(() => {
    if (!user) return;
    const fetchExtras = async () => {
      try {
        const [favRes] = await Promise.all([
          fetch("/api/favorites?type=art"),
        ]);
        if (favRes.ok) {
          const favData = await favRes.json();
          setFavorites(favData);
        }
      } catch {}
    };
    fetchExtras();
  }, [user]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await fetch("/api/auth?action=logout", { method: "POST" });
      resetAuth();
      setShowLogoutConfirm(false);
      router.push("/");
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to log out");
    }
  };

  const BADGE_COLORS: Record<string, string> = {
    COPPER: "from-orange-600 to-amber-500",
    SILVER: "from-zinc-400 to-zinc-300",
    GOLD: "from-yellow-500 to-amber-400",
    PLATINUM: "from-cyan-400 to-blue-400",
    DIAMOND: "from-purple-400 to-pink-400",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-zinc-400 text-sm tracking-widest">LOADING PROFILE...</p>
        </div>
      </div>
    );
  }

  const badgeGradient = BADGE_COLORS[user?.badge || "COPPER"] || BADGE_COLORS.COPPER;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <Toaster position="top-right" />

      {/* Logout Confirmation Modal */}
      <Modal 
        open={showLogoutConfirm} 
        title="Logout" 
        onClose={() => setShowLogoutConfirm(false)}
      >
        <div className="space-y-4 p-2 text-zinc-800">
          <p className="text-sm text-zinc-600 leading-relaxed">
            Are you sure you want to log out of B.Art? You will need to sign in again to access your dashboard, settings, and cart.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold rounded-full transition text-sm"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-full transition text-sm shadow-lg shadow-red-600/20"
              onClick={confirmLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link
          href="/home"
          className="text-2xl font-bold font-serif bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          B.Art
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/profile/settings"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition px-3 py-2 rounded-xl hover:bg-zinc-900"
          >
            <Settings size={16} />
            <span className="hidden sm:inline">Settings</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-xl hover:bg-red-950/20 transition"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-10 space-y-10">

        {/* PROFILE HERO */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950/40 border border-zinc-800 p-8 sm:p-12">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"}
                alt={user?.username}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-[1.8rem] border-2 border-zinc-700 object-cover shadow-2xl"
              />
              <Link
                href="/profile/settings"
                className="absolute -bottom-2 -right-2 bg-purple-600 hover:bg-purple-500 p-2 rounded-full transition shadow-lg"
                title="Edit Profile"
              >
                <Edit3 size={14} />
              </Link>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left space-y-3 flex-1">
              <div>
                <h1 className="text-3xl font-bold font-serif" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {user?.username}
                </h1>
                <p className="text-zinc-400 text-sm mt-1">{user?.email}</p>
              </div>
              {user?.bio && (
                <p className="text-sm text-zinc-400 max-w-lg leading-relaxed">{user.bio}</p>
              )}

              {/* Badge */}
              <div className="inline-flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${badgeGradient} text-white shadow-lg`}>
                  <Award size={12} />
                  {user?.badge || "COPPER"} MEMBER
                </span>
                {user?.role === "ARTIST" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-600/20 text-purple-400 border border-purple-500/30">
                    <Palette size={12} />
                    ARTIST
                  </span>
                )}
              </div>
            </div>

            {/* Wallet Card */}
            <div className="shrink-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-5 min-w-[160px] text-center shadow-xl">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Wallet size={16} className="text-purple-200" />
                <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">Wallet</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(user?.wallet || 0)}</p>
              <button
                type="button"
                onClick={() => toast("Top up coming soon!", { icon: "💳" })}
                className="mt-3 text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition"
              >
                + Top Up
              </button>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: ShoppingBag, label: "My Orders", href: "#", tab: "orders" as const, color: "text-blue-400" },
            { icon: Heart, label: "Favorites", href: "#", tab: "favorites" as const, color: "text-red-400" },
            { icon: Bell, label: "Notifications", href: "/notifications", tab: null, color: "text-yellow-400" },
            { icon: Settings, label: "Settings", href: "/profile/settings", tab: null, color: "text-zinc-400" },
          ].map(({ icon: Icon, label, href, tab, color }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (tab) setActiveTab(tab);
                else router.push(href);
              }}
              className="flex flex-col items-center gap-2 py-5 px-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition group"
            >
              <Icon size={22} className={`${color} group-hover:scale-110 transition`} />
              <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition">{label}</span>
            </button>
          ))}
        </div>

        {/* ARTIST CTA */}
        {user?.role !== "ARTIST" && (
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/30 to-blue-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/20 rounded-2xl">
                <Sparkles size={24} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Become an Artist on B.Art</h3>
                <p className="text-sm text-zinc-400 mt-0.5">Start selling your digital artwork to thousands of collectors</p>
              </div>
            </div>
            <Link
              href="/become-artist"
              className="shrink-0 px-6 py-3 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-full transition text-sm flex items-center gap-2"
            >
              Apply Now <ChevronRight size={16} />
            </Link>
          </div>
        )}

        {user?.role === "ARTIST" && (
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/30 to-blue-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/20 rounded-2xl">
                <Palette size={24} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Manage Your Artworks</h3>
                <p className="text-sm text-zinc-400 mt-0.5">Upload, edit, and track your artwork performance</p>
              </div>
            </div>
            <Link
              href="/artist/manage"
              className="shrink-0 px-6 py-3 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-full transition text-sm flex items-center gap-2"
            >
              Dashboard <ChevronRight size={16} />
            </Link>
          </div>
        )}

        {/* TABS */}
        <div>
          <div className="flex gap-1 border-b border-zinc-900 mb-6">
            {[
              { key: "orders" as const, label: "Purchase History", icon: ShoppingBag },
              { key: "favorites" as const, label: "Liked Arts", icon: Heart },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === key
                    ? "border-purple-500 text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
              <ShoppingBag size={40} className="mx-auto mb-3 text-zinc-700" />
              <h4 className="font-bold text-white">No purchases yet</h4>
              <p className="text-sm text-zinc-500 mt-1">Your art purchases will appear here</p>
              <Link
                href="/home"
                className="mt-4 inline-block px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-full text-sm font-semibold transition"
              >
                Browse Gallery
              </Link>
            </div>
          )}

          {/* FAVORITES TAB */}
          {activeTab === "favorites" && (
            favorites.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
                <Heart size={40} className="mx-auto mb-3 text-zinc-700" />
                <h4 className="font-bold text-white">No liked arts yet</h4>
                <p className="text-sm text-zinc-500 mt-1">Tap the heart icon on any artwork to like it</p>
                <Link
                  href="/home"
                  className="mt-4 inline-block px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-full text-sm font-semibold transition"
                >
                  Explore Arts
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {favorites.map((art: any) => (
                  <Link
                    key={art.id}
                    href={`/art/${art.id}`}
                    className="group block rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900 transition"
                  >
                    <div className="aspect-square overflow-hidden bg-zinc-950">
                      <img
                        src={art.image}
                        alt={art.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-semibold text-white truncate">{art.title}</h4>
                      <p className="text-xs text-purple-400 font-bold mt-0.5">{formatCurrency(art.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
