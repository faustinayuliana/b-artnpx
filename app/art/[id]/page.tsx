"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Heart, 
  ShoppingCart, 
  MessageSquare, 
  ChevronLeft, 
  Gavel, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Share2,
  Star,
  Trash2,
  Edit3,
  X
} from "lucide-react";
import { useAuthStore, usePreferencesStore } from "@/src/lib/stores";
import { useCartStore } from "@/src/lib/cartStore";
import { formatCurrency } from "@/src/lib/format";
import { translations } from "@/src/lib/translations";
import { LoginRequiredModal } from "@/src/components/login-required-modal";
import { Button } from "@/src/components/button";
import toast, { Toaster } from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export default function ArtDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { user, isGuest } = useAuthStore();
  const { language } = usePreferencesStore();
  const t = translations[language] || translations.en;
  const cartStore = useCartStore();

  // State
  const [art, setArt] = useState<any>(null);
  const [artistArts, setArtistArts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);

  // Gallery State
  const [selectedImage, setSelectedImage] = useState("");

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  useEffect(() => {
    fetchArtDetail();
    fetchReviews();
  }, [id]);

  const fetchArtDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/arts`);
      if (res.ok) {
        const allArts = await res.json();
        const found = allArts.find((a: any) => a.id === id);
        if (found) {
          setArt(found);
          setSelectedImage(found.image);

          // Fetch other works by same artist
          const otherWorks = allArts.filter((a: any) => a.artistId === found.artistId && a.id !== id);
          setArtistArts(otherWorks.slice(0, 4));
        }
      }

      // Check if liked
      if (user) {
        const favRes = await fetch("/api/favorites?type=art");
        if (favRes.ok) {
          const liked = await favRes.json();
          setIsLiked(liked.some((l: any) => l.id === id));
        }
      }
    } catch (error) {
      console.error("Failed to load artwork detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/reviews?artId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch {
      console.error("Failed to fetch reviews");
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (isGuest || !user) {
      setShowLoginModal(true);
      return;
    }
    // Add to cart first, then redirect to checkout page
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artId: id, qty: 1 }),
      });
      if (res.ok) {
        await cartStore.fetchCart();
        router.push("/checkout");
      } else {
        const data = await res.json();
        toast.error(data.error || (language === "id" ? "Gagal memproses pembelian" : "Failed to process purchase"));
      }
    } catch {
      toast.error(language === "id" ? "Gagal memproses pembelian" : "Failed to process purchase");
    }
  };

  const handleAddToCart = async () => {
    if (isGuest || !user) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artId: id, qty: 1 }),
      });
      if (res.ok) {
        toast.success(language === "id" ? "Ditambahkan ke keranjang" : "Added to cart");
        cartStore.fetchCart();
      } else {
        const data = await res.json();
        toast.error(data.error || (language === "id" ? "Gagal menambahkan ke keranjang" : "Failed to add to cart"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    }
  };

  const handleLike = async () => {
    if (isGuest || !user) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "art", targetId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        if (data.liked) {
          toast.success(language === "id" ? "Ditambahkan ke favorit" : "Added to favorites");
        } else {
          toast.success(language === "id" ? "Dihapus dari favorit" : "Removed from favorites");
        }
      } else {
        toast.error(language === "id" ? "Gagal mengubah status favorit" : "Failed to toggle favorite");
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(language === "id" ? "Tautan disalin!" : "Link copied!");
  };

  // Review Submissions
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artId: id, rating: newRating, comment: newComment }),
      });

      if (res.ok) {
        toast.success(language === "id" ? "Ulasan berhasil dikirim!" : "Review submitted successfully!");
        setNewComment("");
        setNewRating(5);
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.error || (language === "id" ? "Gagal mengirimkan ulasan" : "Failed to submit review"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editComment.trim() || !editingReviewId) return;
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/reviews?reviewId=${editingReviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });

      if (res.ok) {
        toast.success(language === "id" ? "Ulasan berhasil diperbarui!" : "Review updated successfully!");
        setEditingReviewId(null);
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.error || (language === "id" ? "Gagal memperbarui ulasan" : "Failed to update review"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async (reviewId: string) => {
    const confirmMsg = language === "id" ? "Apakah Anda yakin ingin menghapus ulasan ini?" : "Are you sure you want to delete this review?";
    if (!confirm(confirmMsg)) return;
    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(language === "id" ? "Ulasan dihapus" : "Review deleted");
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.error || (language === "id" ? "Gagal menghapus ulasan" : "Failed to delete review"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return "5.0";
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-955 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-zinc-400 text-sm tracking-widest">
            {language === "id" ? "MEMUAT KARYA SENI..." : "LOADING ARTWORK..."}
          </p>
        </div>
      </div>
    );
  }

  if (!art) {
    return (
      <div className="min-h-screen bg-zinc-955 text-white flex flex-col items-center justify-center p-4">
        <ShieldAlert size={48} className="text-red-500 animate-pulse mb-3" />
        <h3 className="text-lg font-bold">{language === "id" ? "Karya Seni Tidak Ditemukan" : "Artwork Not Found"}</h3>
        <p className="text-xs text-zinc-500 mt-1 mb-6">
          {language === "id" ? "Karya seni ini mungkin telah dihapus atau tidak tersedia." : "The artwork you are looking for does not exist or has been removed."}
        </p>
        <Link href="/home" className="py-2.5 px-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-semibold transition">
          {t.backToGallery}
        </Link>
      </div>
    );
  }

  // Multi image gallery options
  const images = [
    { url: art.image, label: "Main View" },
    { url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80", label: "Detail Crop" },
    { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80", label: "Mockup Space" }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative">
      <Toaster position="top-right" />
      <LoginRequiredModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/85 bg-zinc-955/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 text-zinc-400 hover:text-white transition font-semibold text-sm">
          <ChevronLeft size={18} /> {t.backToGallery}
        </Link>
        <span className="text-2xl font-bold font-serif bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-playfair), serif" }}>
          B.Art
        </span>
        <div className="w-24"></div>
      </header>

      {/* MAIN BODY */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-12">
        
        {/* UPPER GRID: IMAGE GALLERY & DIRECT BUY BOX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* GALLERY CAROUSEL (LHS) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/3] w-full bg-zinc-900 border border-zinc-850 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
              <img 
                src={selectedImage} 
                alt={art.title} 
                className="w-full h-full object-cover group-hover:scale-102 transition duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none"></div>
            </div>

            {/* Thumbnail Pickers */}
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img.url)}
                  className={`aspect-[4/3] rounded-2xl overflow-hidden border relative transition ${
                    selectedImage === img.url 
                      ? "border-purple-500 scale-[1.02] shadow-lg shadow-purple-500/10" 
                      : "border-zinc-850 hover:border-zinc-700 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 text-[8px] bg-black/60 px-1.5 py-0.5 rounded text-white tracking-wider font-semibold uppercase">
                    {img.label}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Properties Tags */}
            <div className="flex flex-wrap gap-2 pt-3">
              <span className="text-xs px-3.5 py-2 rounded-2xl bg-zinc-900 border border-zinc-850 text-zinc-400">
                {language === "id" ? "Gaya" : "Style"}: <strong className="text-white">{art.style}</strong>
              </span>
              <span className="text-xs px-3.5 py-2 rounded-2xl bg-zinc-900 border border-zinc-850 text-zinc-400">
                {language === "id" ? "Tema" : "Theme"}: <strong className="text-white">{art.theme}</strong>
              </span>
              <span className="text-xs px-3.5 py-2 rounded-2xl bg-zinc-900 border border-zinc-850 text-zinc-400">
                {language === "id" ? "Warna" : "Color"}: <strong className="text-white">{art.color}</strong>
              </span>
              <span className="text-xs px-3.5 py-2 rounded-2xl bg-zinc-900 border border-zinc-850 text-zinc-400">
                {language === "id" ? "Kategori" : "Category"}: <strong className="text-white">{art.category}</strong>
              </span>
            </div>
          </div>

          {/* ART INFO DETAILS & ACTIONS (RHS) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title / Artist */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold font-serif leading-tight text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
                {art.title}
              </h1>
              <div className="flex items-center gap-3">
                <img 
                  src={art.artist?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} 
                  alt={art.artist?.username} 
                  className="w-10 h-10 rounded-full border border-zinc-700 object-cover"
                />
                <div>
                  <Link href={`/artist/${art.artistId}`} className="text-sm font-semibold text-white hover:text-purple-400 transition">
                    {art.artist?.username}
                  </Link>
                  <p className="text-[10px] uppercase text-zinc-500 tracking-wider font-bold">
                    {getArtistBadgeLabel(art.artist?.badge, language)}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 border-t border-zinc-850 pt-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{t.description}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{art.description}</p>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                  {language === "id" ? "Harga Langsung" : "Direct Price"}
                </span>
                <p className="text-2xl font-bold text-purple-400 mt-1">{formatCurrency(art.price)}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                  {language === "id" ? "Ketersediaan" : "Availability"}
                </span>
                <p className={`text-sm font-semibold mt-1 ${art.stock > 0 ? "text-green-400" : "text-red-400"}`}>
                  {art.stock > 0 
                    ? `${art.stock} ${language === "id" ? "Tersedia" : "Available"}` 
                    : (language === "id" ? "Habis Terjual" : "Sold Out")}
                </p>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3.5 text-sm font-bold border-0"
                  onClick={handleBuyNow}
                  disabled={art.stock <= 0}
                >
                  {t.buyNow}
                </Button>
                <Button 
                  className="flex-1 bg-zinc-800 hover:bg-zinc-750 py-3.5 text-sm font-bold border border-zinc-700/80"
                  onClick={handleAddToCart}
                  disabled={art.stock <= 0}
                >
                  {t.addToCart}
                </Button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleLike}
                  className="flex-1 py-3 px-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition flex items-center justify-center gap-2"
                >
                  <Heart size={16} className={isLiked ? "fill-red-500 text-red-500 border-0" : ""} />
                  {isLiked 
                    ? (language === "id" ? "Difavoritkan" : "Favorited") 
                    : (language === "id" ? "Favoritkan Karya" : "Favorite Artwork")}
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-3 px-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl text-xs font-semibold text-zinc-355 hover:text-white hover:border-zinc-700 transition flex items-center justify-center gap-2 font-medium"
                >
                  <Share2 size={16} className="text-purple-400" /> {language === "id" ? "Bagikan Karya" : "Share Artwork"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/chat")}
                  className="px-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl text-zinc-300 hover:text-white transition flex items-center justify-center"
                  title="Open Chat"
                >
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>

            {/* Live Auction Card */}
            <div className="border border-zinc-800/80 rounded-3xl p-5 bg-gradient-to-br from-zinc-900 to-zinc-955 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/15 text-purple-400 rounded-2xl">
                  <Gavel size={22} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-full">
                    {language === "id" ? "Info Lelang" : "Auction Info"}
                  </span>
                  <h4 className="font-bold text-sm text-white mt-1.5">
                    {language === "id" ? "Tidak Ada Lelang Aktif" : "No Active Auction"}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {language === "id" 
                      ? "Karya seni ini tidak memiliki lelang yang sedang berlangsung. Penawaran tidak tersedia." 
                      : "This artwork has no ongoing auctions. Bidding is unavailable."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuctionModal(true)}
                className="w-full mt-4 py-2 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                {language === "id" ? "Lihat Lelang Mendatang" : "View Upcoming Auctions"} <ArrowRight size={12} />
              </button>
            </div>

          </div>
        </div>

        {/* REVIEWS SECTION */}
        <section className="space-y-8 border-t border-zinc-900 pt-10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-serif text-white flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
                {language === "id" ? "Ulasan Komunitas" : "Community Reviews"}
              </h3>
              <p className="text-xs text-zinc-500">
                {language === "id" ? "Apa pendapat kolektor tentang" : "What collectors think about"} {art.title}.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-850 px-5 py-3 rounded-2xl shrink-0 self-start sm:self-auto">
              <div className="text-center border-r border-zinc-800 pr-4">
                <p className="text-3xl font-serif font-bold text-white leading-none">{getAverageRating()}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">{t.rating}</p>
              </div>
              <div>
                <div className="flex gap-0.5 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={15} 
                      className={i < Math.round(Number(getAverageRating())) ? "fill-yellow-500" : "text-zinc-700"} 
                    />
                  ))}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {reviews.length} {language === "id" ? "total ulasan" : "total reviews"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Reviews list (LHS) */}
            <div className="lg:col-span-7 space-y-4">
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-zinc-900 border border-zinc-850 rounded-2xl h-24 w-full" />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/15 border border-dashed border-zinc-850 rounded-2xl space-y-2">
                  <Star size={32} className="mx-auto text-zinc-750 animate-pulse" />
                  <h4 className="font-bold text-white text-sm">
                    {language === "id" ? "Belum Ada Ulasan" : "No Reviews Yet"}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {language === "id" 
                      ? "Jadilah yang pertama mengulas aset digital yang menakjubkan ini!" 
                      : "Be the first to review this stunning digital asset!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => {
                    const isOwnReview = user?.id === rev.userId;
                    const isEditing = editingReviewId === rev.id;

                    return (
                      <div key={rev.id} className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={rev.user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} 
                              alt={rev.user?.username} 
                              className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-white">{rev.user?.username}</h4>
                              <div className="flex gap-0.5 mt-0.5 text-yellow-500">
                                {[...Array(5)].map((StarName, i) => (
                                  <Star 
                                    key={i} 
                                    size={10} 
                                    className={i < rev.rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-750"} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] text-zinc-500 font-mono">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                            {isOwnReview && !isEditing && (
                              <div className="flex gap-1.5 pl-2 border-l border-zinc-800">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingReviewId(rev.id);
                                    setEditRating(rev.rating);
                                    setEditComment(rev.comment);
                                  }}
                                  className="text-zinc-500 hover:text-purple-400 p-1 transition"
                                  title={language === "id" ? "Ubah Ulasan" : "Edit Review"}
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReviewDelete(rev.id)}
                                  className="text-zinc-500 hover:text-red-400 p-1 transition"
                                  title={language === "id" ? "Hapus Ulasan" : "Delete Review"}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          /* EDIT REVIEW FORM */
                          <form onSubmit={handleReviewUpdate} className="space-y-3 pt-2">
                            <div className="flex gap-1.5 items-center">
                              <span className="text-xs text-zinc-400 font-medium">
                                {language === "id" ? "Penilaian" : "Rating"}:
                              </span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEditRating(star)}
                                    className="text-yellow-500 hover:scale-110 transition"
                                  >
                                    <Star size={14} className={star <= editRating ? "fill-yellow-500 text-yellow-500" : "text-zinc-700"} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-purple-500 transition text-white resize-none"
                              rows={2}
                              required
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setEditingReviewId(null)}
                                className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-850 text-zinc-400 text-[10px] font-bold rounded-lg transition"
                              >
                                {t.cancel}
                              </button>
                              <button
                                type="submit"
                                disabled={submittingReview}
                                className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-zinc-955 text-[10px] font-bold rounded-lg transition"
                              >
                                {t.save}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <p className="text-xs sm:text-sm text-zinc-450 leading-relaxed pl-1">{rev.comment}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Write a review form (RHS) */}
            <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-855 rounded-[2rem] p-6 space-y-4 shadow-xl">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">{t.writeReview}</h4>
                <p className="text-xs text-zinc-500">
                  {language === "id" ? "Bagikan pemikiran Anda dengan kolektor lain." : "Share your thoughts with other collectors."}
                </p>
              </div>

              {!user ? (
                <div className="text-center py-6 bg-zinc-950/20 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <p className="text-xs text-zinc-500">
                    {language === "id" ? "Masuk untuk menulis ulasan untuk karya seni ini." : "Sign in to write a review for this artwork."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-full transition shadow"
                  >
                    {language === "id" ? "Masuk" : "Sign In"}
                  </button>
                </div>
              ) : reviews.some((r) => r.userId === user.id) ? (
                <div className="text-center py-6 bg-zinc-950/20 border border-zinc-850 rounded-2xl p-4">
                  <p className="text-xs text-zinc-500">
                    {language === "id" 
                      ? "Anda telah mengulas karya seni ini. Anda dapat mengubah atau menghapus ulasan Anda secara langsung di daftar." 
                      : "You have already reviewed this artwork. You can edit or delete your review directly in the list."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4 text-sm">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-450 uppercase tracking-wider block">
                      {language === "id" ? "Pilih Penilaian" : "Select Rating"}
                    </label>
                    <div className="flex gap-2 items-center py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-yellow-500 hover:scale-110 transition p-0.5"
                        >
                          <Star 
                            size={24} 
                            className={star <= newRating ? "fill-yellow-500 text-yellow-500" : "text-zinc-750"} 
                          />
                        </button>
                      ))}
                      <span className="text-xs text-zinc-400 font-bold ml-2 font-mono">({newRating} / 5)</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-455 uppercase tracking-wider block">
                      {language === "id" ? "Tulis Komentar" : "Write Comment"}
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={language === "id" ? "Apa yang Anda sukai dari karya ini? Jelaskan detailnya..." : "What do you love about this piece? Describe the details..."}
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-purple-500 transition text-white placeholder:text-zinc-700 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-2"
                  >
                    {submittingReview ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      language === "id" ? "Kirim Ulasan" : "Submit Review"
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>

        {/* BOTTOM SECTION: MORE FROM THIS ARTIST */}
        {artistArts.length > 0 && (
          <section className="space-y-6 border-t border-zinc-900 pt-10">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
                <Sparkles size={18} className="text-purple-400" /> {language === "id" ? "Lebih banyak dari Seniman ini" : "More from this Artist"}
              </h3>
              <Link href={`/artist/${art.artistId}`} className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                {language === "id" ? "Lihat Profil" : "View Profile"} <ArrowRight size={12} />
              </Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x">
              {artistArts.map((item) => (
                <div key={item.id} className="w-64 shrink-0 snap-start bg-zinc-900 border border-zinc-850 rounded-3xl overflow-hidden group hover:border-zinc-700 transition duration-300">
                  <Link href={`/art/${item.id}`} className="block aspect-[4/3] overflow-hidden bg-zinc-950">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                  </Link>
                  <div className="p-4 space-y-2">
                    <h4 className="font-semibold text-sm text-white line-clamp-1 truncate">{item.title}</h4>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-550">{item.style}</span>
                      <span className="font-bold text-purple-400">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Live Auction Info Modal */}
      {showAuctionModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] w-full max-w-md overflow-hidden flex flex-col p-6 text-center space-y-6 shadow-2xl">
            <header className="flex justify-between items-center w-full">
              <span className="text-xs font-bold text-zinc-550 uppercase tracking-wider">{language === "id" ? "Lelang Mendatang" : "Upcoming Auctions"}</span>
              <button onClick={() => setShowAuctionModal(false)} className="text-zinc-500 hover:text-white transition">
                <X size={20} />
              </button>
            </header>
            <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50/50 rounded-r-xl text-left">
              <h4 className="font-bold text-lg text-purple-950">Anime Spirit</h4>
              <p className="text-sm text-purple-800 font-medium">
                {language === "id" ? "Penawaran dimulai Besok jam 19:00" : "Bidding starts Tomorrow at 19:00"}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {language === "id" 
                  ? "Bersiaplah untuk menawar komisi karya seni anime langka." 
                  : "Get ready to bid on rare anime artwork commissions."}
              </p>
            </div>
            <button
              type="button"
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-1.5"
              onClick={() => {
                setShowAuctionModal(false);
                router.push("/auction");
              }}
            >
              {language === "id" ? "Buka Halaman Lelang" : "Go to Auction Page"} <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
