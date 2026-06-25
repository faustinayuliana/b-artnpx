"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, User, Sparkles, Image as ImageIcon } from "lucide-react";
import { useAuthStore, usePreferencesStore } from "@/src/lib/stores";
import { formatCurrency } from "@/src/lib/format";
import { translations } from "@/src/lib/translations";
import toast, { Toaster } from "react-hot-toast";

const getArtistBadgeLabel = (badge: string | null | undefined, lang: string = "en") => {
  const b = badge?.toUpperCase() || "COPPER";
  const isIndo = lang === "id";
  if (b === "PLATINUM" || b === "DIAMOND") {
    return isIndo ? "Seniman Profesional 🥇" : "Professional Artist 🥇";
  }
  if (b === "SILVER" || b === "GOLD") {
    return isIndo ? "Seniman Menengah 🥈" : "Intermediate Artist 🥈";
  }
  return isIndo ? "Seniman Pemula 🥉" : "Beginner Artist 🥉";
};

export default function FavoritesPage() {
  const router = useRouter();
  const { user, isGuest } = useAuthStore();
  const { language } = usePreferencesStore();
  const t = translations[language] || translations.en;

  // State
  const [activeTab, setActiveTab] = useState<"art" | "artist">("art");
  const [likedArts, setLikedArts] = useState<any[]>([]);
  const [followedArtists, setFollowedArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isGuest) {
      router.push("/login");
      return;
    }
    fetchFavorites();
  }, [isGuest, activeTab]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/favorites?type=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        if (activeTab === "art") {
          setLikedArts(data);
        } else {
          setFollowedArtists(data);
        }
      }
    } catch {
      toast.error(language === "id" ? "Gagal memuat favorit" : "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (artId: string) => {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "art", targetId: artId }),
      });

      if (res.ok) {
        setLikedArts(likedArts.filter((a) => a.id !== artId));
        toast.success(language === "id" ? "Dihapus dari favorit" : "Removed from favorites");
      }
    } catch {
      toast.error(language === "id" ? "Gagal menghapus favorit" : "Failed to remove favorite");
    }
  };

  const handleUnfollowArtist = async (artistId: string) => {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "artist", targetId: artistId }),
      });

      if (res.ok) {
        setFollowedArtists(followedArtists.filter((a) => a.id !== artistId));
        toast.success(language === "id" ? "Batal mengikuti seniman" : "Unfollowed artist");
      }
    } catch {
      toast.error(language === "id" ? "Gagal batal mengikuti" : "Failed to unfollow");
    }
  };

  if (isGuest) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Toaster position="top-right" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 text-zinc-400 hover:text-white transition font-semibold text-sm">
          <ChevronLeft size={18} /> {t.backToGallery}
        </Link>
        <span className="text-2xl font-bold font-serif bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-playfair), serif" }}>
          B.Art
        </span>
        <div className="w-24"></div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-serif text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>{t.myFavorites}</h1>
          <p className="text-zinc-400 text-sm">{t.favoritesDesc}</p>
        </div>

        {/* Tabs Toggle */}
        <div className="flex gap-2 p-1.5 bg-zinc-900 border border-zinc-850 rounded-2xl max-w-sm">
          <button
            type="button"
            onClick={() => setActiveTab("art")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${activeTab === "art" ? "bg-white text-zinc-950 shadow-md" : "text-zinc-400 hover:text-white"}`}
          >
            {t.likedArtworks}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("artist")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${activeTab === "artist" ? "bg-white text-zinc-950 shadow-md" : "text-zinc-400 hover:text-white"}`}
          >
            {t.followedArtists}
          </button>
        </div>

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-900 border border-zinc-850 rounded-3xl h-48 w-full"></div>
            ))}
          </div>
        ) : activeTab === "art" ? (
          /* ARTWORKS GRID */
          likedArts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/10 border border-zinc-850 rounded-3xl space-y-4">
              <ImageIcon size={48} className="mx-auto text-zinc-700 animate-pulse" />
              <div>
                <h4 className="font-bold text-white text-lg">{t.noFavoriteArts}</h4>
                <p className="text-xs text-zinc-500 mt-1">{t.noFavoriteArtsDesc}</p>
              </div>
              <Link href="/home" className="inline-flex items-center gap-2 py-2.5 px-6 rounded-full bg-purple-600 hover:bg-purple-500 font-semibold text-xs transition">
                {t.discoverArtworks} <Sparkles size={12} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {likedArts.map((art) => (
                <div key={art.id} className="flex gap-4 p-4 bg-zinc-900 border border-zinc-850 rounded-3xl group relative hover:border-zinc-750 transition">
                  <Link href={`/art/${art.id}`} className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-zinc-950 rounded-2xl overflow-hidden block">
                    <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base text-white truncate line-clamp-1">{art.title}</h4>
                      <Link href={`/artist/${art.artistId}`} className="text-xs text-zinc-400 hover:text-white transition mt-1 block">
                        {language === "id" ? "oleh" : "by"} {art.artist?.username}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-purple-400">{formatCurrency(art.price)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(art.id)}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition"
                      >
                        <Heart size={14} className="fill-red-500 text-red-500" /> {t.unlike}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ARTISTS GRID */
          followedArtists.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/10 border border-zinc-850 rounded-3xl space-y-4">
              <User size={48} className="mx-auto text-zinc-700 animate-pulse" />
              <div>
                <h4 className="font-bold text-white text-lg">{t.noFollowedArtists}</h4>
                <p className="text-xs text-zinc-500 mt-1">{t.noFollowedArtistsDesc}</p>
              </div>
              <Link href="/home" className="inline-flex items-center gap-2 py-2.5 px-6 rounded-full bg-purple-600 hover:bg-purple-500 font-semibold text-xs transition">
                {t.discoverCreators} <User size={12} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {followedArtists.map((artist) => (
                <div key={artist.id} className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-850 rounded-3xl group relative hover:border-zinc-750 transition">
                  <Link href={`/artist/${artist.id}`}>
                    <img 
                      src={artist.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} 
                      alt={artist.username} 
                      className="w-16 h-16 rounded-full border border-zinc-750 object-cover group-hover:border-purple-400 transition shrink-0"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <Link href={`/artist/${artist.id}`} className="font-semibold text-sm sm:text-base text-white hover:text-purple-400 transition block truncate">
                        {artist.username}
                      </Link>
                      <span className="text-[9px] uppercase tracking-widest text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                        {getArtistBadgeLabel(artist.badge, language)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2.5">
                      <Link href={`/artist/${artist.id}`} className="text-xs text-zinc-400 hover:text-white transition">
                        {t.viewPortfolio}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleUnfollowArtist(artist.id)}
                        className="text-xs text-zinc-400 hover:text-red-400 font-semibold transition"
                      >
                        {t.unfollow}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
