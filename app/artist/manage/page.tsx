"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Sparkles,
  Image,
  DollarSign,
  Tag,
  X,
  CheckCircle,
  TrendingUp,
  Package,
  Wallet,
  Upload,
} from "lucide-react";
import { useAuthStore } from "@/src/lib/stores";
import { formatCurrency } from "@/src/lib/format";
import toast, { Toaster } from "react-hot-toast";

const CATEGORIES = ["Poster", "Wallpaper", "Sticker", "Anime Graph", "Illustration", "Digital Asset", "Open Commission"];
const STYLES = ["Illustration", "Graphic Design", "Photography", "Japanese", "Abstract", "Paintings", "Traditional Art"];
const COLORS = ["Red", "Blue", "Green", "Black", "White", "Purple", "Pink", "Orange", "Yellow"];
const THEMES = ["Japanese", "Anime", "Sports", "Cars", "Movies", "Animals", "Nature", "Travel", "Food"];

type ArtForm = {
  title: string;
  description: string;
  image: string;
  price: string;
  style: string;
  color: string;
  theme: string;
  category: string;
  isCommission: boolean;
};

const EMPTY_FORM: ArtForm = {
  title: "",
  description: "",
  image: "",
  price: "",
  style: "Illustration",
  color: "Black",
  theme: "Anime",
  category: "Illustration",
  isCommission: false,
};

export default function ArtistManagePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [arts, setArts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ArtForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<{
    artsCount: number;
    salesCount: number;
    revenue: number;
    followersCount: number;
    badge: string;
    wallet: number;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const userRes = await fetch("/api/user");
        if (!userRes.ok) { router.push("/login"); return; }
        const userData = await userRes.json();
        setUser(userData);

        if (userData.role !== "ARTIST") {
          router.push("/become-artist");
          return;
        }

        const analyticsRes = await fetch("/api/artist/analytics");
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData);
        }

        await fetchArts(userData.id);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, setUser]);

  const fetchArts = async (artistId?: string) => {
    const id = artistId || user?.id;
    if (!id) return;
    const res = await fetch(`/api/arts?artistId=${id}`);
    if (res.ok) {
      const data = await res.json();
      setArts(data);
    }
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const handleOpenEdit = (art: any) => {
    setEditId(art.id);
    setForm({
      title: art.title || "",
      description: art.description || "",
      image: art.image || "",
      price: String(art.price || ""),
      style: art.style || "Illustration",
      color: art.color || "Black",
      theme: art.theme || "Anime",
      category: art.category || "Illustration",
      isCommission: art.isCommission || false,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.image.trim() || !form.price) {
      toast.error("Title, image URL, and price are required");
      return;
    }
    setSaving(true);
    try {
      const method = editId ? "PUT" : "POST";
      const body = editId ? { ...form, id: editId, price: parseFloat(form.price) } : { ...form, price: parseFloat(form.price) };
      const res = await fetch("/api/arts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editId ? "Artwork updated!" : "Artwork uploaded!");
        setShowForm(false);
        setEditId(null);
        setForm(EMPTY_FORM);
        await fetchArts();
      } else {
        toast.error(data.error || "Failed to save artwork");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this artwork? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/arts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Artwork deleted");
        setArts(arts.filter((a) => a.id !== id));
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-zinc-400 text-sm tracking-widest">LOADING DASHBOARD...</p>
        </div>
      </div>
    );
  }

  const careerSales = analytics?.revenue || 0;
  const ordersCount = analytics?.salesCount || 0;
  const followersCount = analytics?.followersCount || 0;

  // Badge tier calculation
  let artistBadgeName = "Beginner Artist 🥉";
  let nextBadgeName = "Intermediate Artist 🥈";
  let nextBadgeSalesTarget = 10;
  let progressPercent = 0;

  if (ordersCount < 10) {
    artistBadgeName = "Beginner Artist 🥉";
    nextBadgeName = "Intermediate Artist 🥈";
    nextBadgeSalesTarget = 10;
    progressPercent = (ordersCount / 10) * 100;
  } else if (ordersCount >= 10 && ordersCount < 50) {
    artistBadgeName = "Intermediate Artist 🥈";
    nextBadgeName = "Professional Artist 🥇";
    nextBadgeSalesTarget = 50;
    progressPercent = ((ordersCount - 10) / 40) * 100;
  } else {
    artistBadgeName = "Professional Artist 🥇";
    nextBadgeName = "Professional Artist 🥇";
    nextBadgeSalesTarget = 50;
    progressPercent = 100;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <Toaster position="top-right" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 hover:bg-zinc-900 rounded-xl transition text-zinc-400 hover:text-white">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white">Artist Dashboard</h1>
            <p className="text-xs text-zinc-500">Manage your artworks and view creator analytics</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-full text-sm transition"
        >
          <Plus size={16} /> Upload Art
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">

        {/* ANALYTICS STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Package, label: "Artworks Uploaded", value: arts.length, color: "text-purple-400" },
            { icon: DollarSign, label: "Total Orders", value: `${ordersCount} Sales`, color: "text-blue-400" },
            { icon: Wallet, label: "Wallet Balance", value: formatCurrency(user?.wallet || 0), color: "text-green-400" },
            { icon: TrendingUp, label: "Followers Count", value: `${followersCount} Followers`, color: "text-yellow-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="p-5 bg-zinc-900/40 rounded-2xl border border-zinc-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl pointer-events-none" />
              <Icon size={20} className={`${color} mb-2 group-hover:scale-110 transition duration-300`} />
              <p className="text-xs text-zinc-500 mb-1 font-semibold">{label}</p>
              <p className="text-xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* BADGE TIER AUTO-UPGRADE PROGRESS BAR */}
        <div className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950/20 rounded-3xl border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/15">Creator Status</span>
              <p className="text-xl font-bold text-white mt-2 flex items-center gap-2 font-serif" style={{ fontFamily: "var(--font-playfair), serif" }}>
                <span>🏆</span> Current Rank: <span className="text-purple-400 font-semibold">{artistBadgeName}</span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-zinc-505">Total Career Revenue</p>
              <p className="text-lg font-bold text-green-400 mt-0.5">{formatCurrency(careerSales)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-zinc-500">Badge Upgrade Progress</span>
              <span className="text-zinc-300">
                {careerSales >= 2000000 ? "Maximum Level Reached!" : `${progressPercent.toFixed(0)}% towards ${nextBadgeName}`}
              </span>
            </div>
            <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              <span>{artistBadgeName}</span>
              {ordersCount < 50 ? (
                <span>Next Badge Target: {nextBadgeSalesTarget} Sales</span>
              ) : (
                <span className="text-yellow-400">✨ Professional Creator Rank Achieved</span>
              )}
            </div>
          </div>
        </div>

        {/* ARTWORKS GRID */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" /> My Artworks
            </h2>
            <span className="text-xs text-zinc-500">{arts.length} pieces</span>
          </div>

          {arts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl">
              <Upload size={40} className="mx-auto mb-3 text-zinc-700 animate-pulse" />
              <h4 className="font-bold text-white">No artworks yet</h4>
              <p className="text-sm text-zinc-500 mt-1">Click "Upload Art" to add your first piece</p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-full text-sm font-bold transition"
              >
                <Plus size={15} /> Upload First Art
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {arts.map((art) => (
                <div key={art.id} className="group rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition">
                  <Link href={`/art/${art.id}`} className="block aspect-[4/3] overflow-hidden bg-zinc-950 relative">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {art.isCommission && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 bg-purple-600 rounded-full uppercase tracking-wider">Commission</span>
                    )}
                  </Link>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-white truncate">{art.title}</h3>
                        <p className="text-xs text-zinc-500">{art.category} · {art.style}</p>
                      </div>
                      <span className="text-sm font-bold text-purple-400 shrink-0">{formatCurrency(art.price)}</span>
                    </div>
                    <div className="flex gap-2 border-t border-zinc-800 pt-3">
                      <Link
                        href={`/art/${art.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-white transition"
                      >
                        <Eye size={13} /> Preview
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(art)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-zinc-800 hover:border-blue-500/40 text-xs text-zinc-400 hover:text-blue-400 transition"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(art.id)}
                        disabled={deleting === art.id}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-800 hover:border-red-500/40 text-xs text-zinc-400 hover:text-red-400 transition disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* UPLOAD / EDIT MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload size={18} className="text-purple-400" />
                {editId ? "Edit Artwork" : "Upload Artwork"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Image Preview */}
              {form.image && (
                <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e: any) => { e.target.style.display = "none"; }} />
                </div>
              )}

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Image size={13} /> Image URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://example.com/artwork.jpg"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500/60 text-white placeholder:text-zinc-600"
                />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={13} /> Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Mystical Forest Spirit"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500/60 text-white placeholder:text-zinc-600"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your artwork..."
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500/60 text-white placeholder:text-zinc-600 resize-none"
                />
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={13} /> Price (Rp) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 150000"
                  min="1000"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500/60 text-white placeholder:text-zinc-600"
                />
                {form.price && parseFloat(form.price) > 0 && (
                  <p className="text-xs text-purple-400">{formatCurrency(parseFloat(form.price))}</p>
                )}
              </div>

              {/* Category & Style */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value, isCommission: e.target.value === "Open Commission" })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-purple-500/60 text-white"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Style</label>
                  <select
                    value={form.style}
                    onChange={(e) => setForm({ ...form, style: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-purple-500/60 text-white"
                  >
                    {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Primary Color</label>
                  <select
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-purple-500/60 text-white"
                  >
                    {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Theme</label>
                  <select
                    value={form.theme}
                    onChange={(e) => setForm({ ...form, theme: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-purple-500/60 text-white"
                  >
                    {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Commission toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition">
                <div
                  onClick={() => setForm({ ...form, isCommission: !form.isCommission })}
                  className={`w-10 h-5 rounded-full flex items-center transition-all ${form.isCommission ? "bg-purple-600 justify-end" : "bg-zinc-700 justify-start"}`}
                >
                  <div className="w-4 h-4 rounded-full bg-white mx-0.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Open Commission</p>
                  <p className="text-xs text-zinc-500">Allow buyers to request custom variations</p>
                </div>
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-zinc-800 rounded-2xl text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-2xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle size={15} />
                  {saving ? "Saving..." : editId ? "Update Art" : "Upload Art"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
