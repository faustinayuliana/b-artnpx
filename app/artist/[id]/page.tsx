"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  UserPlus, 
  UserMinus, 
  MapPin, 
  Globe, 
  ExternalLink,
  Share2,
  Sparkles,
  Gavel
} from "lucide-react";
import { useAuthStore } from "@/src/lib/stores";
import { formatCurrency } from "@/src/lib/format";
import { LoginRequiredModal } from "@/src/components/login-required-modal";
import toast, { Toaster } from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArtistProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { user, isGuest } = useAuthStore();

  // State
  const [artist, setArtist] = useState<any>(null);
  const [arts, setArts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    fetchArtistProfile();
  }, [id, user]);

  const fetchArtistProfile = async () => {
    setLoading(true);
    try {
      // Fetch all arts to extract the artist info and their works
      const artsRes = await fetch("/api/arts");
      if (artsRes.ok) {
        const allArts = await resToArts(artsRes);
        const artistWorks = allArts.filter((a: any) => a.artistId === id);
        setArts(artistWorks);

        // Fetch artist info (we can get from the first art item, or fetch users)
        // Let's call /api/user if the ID matches user, otherwise get from arts artist details or custom API
        if (artistWorks.length > 0) {
          setArtist(artistWorks[0].artist);
        } else {
          // fallback if no arts uploaded yet, try loading from API or mock
          const usersRes = await fetch(`/api/seed/artists`);
          try {
            const list = await usersRes.json();
            const found = list.find((u: any) => u.id === id);
            if (found) setArtist(found);
          } catch {}
        }
      }

      // Check following status and follower count
      if (user) {
        const favRes = await fetch("/api/favorites?type=artist");
        if (favRes.ok) {
          const follows = await favRes.json();
          setIsFollowing(follows.some((f: any) => f.id === id));
        }
      }

      // Get follower count (mock logic: check follows table, or seed number)
      // Since it's a mock, we can set random count or query follows count:
      // Let's set 42 followers or query
      setFollowerCount(28);

    } catch (error) {
      console.error("Failed to load artist profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const resToArts = async (res: Response) => {
    return res.json();
  };

  const handleFollow = async () => {
    if (isGuest || !user) {
      setShowLoginModal(true);
      return;
    }

    if (id === user.id) {
      toast.error("You cannot follow yourself");
      return;
    }

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "artist", targetId: id }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.followed);
        if (data.followed) {
          setFollowerCount(followerCount + 1);
          toast.success(`Following ${artist?.username}`);
        } else {
          setFollowerCount(Math.max(0, followerCount - 1));
          toast.success(`Unfollowed ${artist?.username}`);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to follow");
      }
    } catch {
      toast.error("Failed to toggle follow");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-zinc-400 text-sm tracking-widest">LOADING ARTIST PROFILE...</p>
        </div>
      </div>
    );
  }

  const finalArtist = artist || {
    username: "Unknown Artist",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
    bio: "Digital creator and art explorer on B.Art.",
    badge: "COPPER"
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Toaster position="top-right" />
      <LoginRequiredModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

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

      {/* CORE PROFILE BODY */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-10">
        
        {/* Banner Card */}
        <div className="rounded-[2.5rem] bg-gradient-to-r from-zinc-900 via-zinc-900 to-purple-950/40 border border-zinc-850 p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 relative overflow-hidden">
          {/* Blur gradient decoration */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center md:items-start gap-6 text-center sm:text-left relative z-10">
            <img 
              src={finalArtist.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} 
              alt={finalArtist.username} 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] border border-zinc-700 object-cover shadow-xl"
            />
            <div className="space-y-3.5">
              <div>
                <h1 className="text-3xl font-serif text-white font-bold" style={{ fontFamily: "var(--font-playfair), serif" }}>{finalArtist.username}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="text-[10px] font-bold tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full uppercase">
                    {finalArtist.badge || "COPPER"} Artist
                  </span>
                  <span className="text-xs text-zinc-500 flex items-center gap-1"><MapPin size={12} /> Jakarta, Indonesia</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 max-w-lg leading-relaxed">{finalArtist.bio}</p>
              
              {/* Stats */}
              <div className="flex items-center justify-center sm:justify-start gap-6 text-sm text-zinc-300 font-mono">
                <div><strong>{followerCount}</strong> <span className="text-zinc-500">followers</span></div>
                <div><strong>19</strong> <span className="text-zinc-500">following</span></div>
                <div><strong>{arts.length}</strong> <span className="text-zinc-500">artworks</span></div>
              </div>
            </div>
          </div>

          {/* Action Trigger Follow */}
          <div className="shrink-0 flex gap-3 relative z-10 w-full sm:w-auto justify-center md:self-start">
            {id !== user?.id && (
              <button
                type="button"
                onClick={handleFollow}
                className={`py-3.5 px-6 rounded-full text-sm font-semibold transition flex items-center gap-2 border ${
                  isFollowing 
                    ? "bg-zinc-800 hover:bg-zinc-750 text-white border-zinc-700" 
                    : "bg-white hover:bg-zinc-100 text-zinc-950 border-white hover:scale-105"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus size={16} /> Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus size={16} /> Follow Artist
                  </>
                )}
              </button>
            )}
            <button 
              type="button" 
              onClick={() => router.push("/coming-soon")}
              className="py-3.5 px-5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-full transition flex items-center justify-center"
              title="Chat"
            >
              Message
            </button>
          </div>
        </div>

        {/* ARTWORKS SECTION */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
            <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
              <Sparkles size={18} className="text-purple-400" /> Digital Artwork Portfolio
            </h3>
            <span className="text-xs text-zinc-500">{arts.length} pieces</span>
          </div>

          {arts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-3xl">
              <Gavel size={40} className="mx-auto mb-3 text-zinc-700 animate-pulse" />
              <h4 className="font-bold text-white text-base">No Artworks Found</h4>
              <p className="text-xs text-zinc-500 mt-1">This artist hasn't uploaded any creations yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {arts.map((art) => (
                <div key={art.id} className="group overflow-hidden rounded-[2rem] border border-zinc-850 bg-zinc-900/40 hover:bg-zinc-900 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/10">
                  <Link href={`/art/${art.id}`} className="block aspect-[4/3] w-full overflow-hidden bg-zinc-950">
                    <img src={art.image} alt={art.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </Link>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm sm:text-base font-semibold text-white truncate line-clamp-1">{art.title}</h3>
                      <span className="text-sm font-bold text-purple-400 shrink-0">{formatCurrency(art.price)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-zinc-500">
                      <span>{art.style}</span>
                      <Link href={`/art/${art.id}`} className="text-purple-400 hover:text-purple-300 font-semibold transition">
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
