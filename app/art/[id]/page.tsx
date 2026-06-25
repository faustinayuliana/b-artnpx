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
import { useAuthStore } from "@/src/lib/stores";
import { useCartStore } from "@/src/lib/cartStore";
import { formatCurrency } from "@/src/lib/format";
import { LoginRequiredModal } from "@/src/components/login-required-modal";
import { Button } from "@/src/components/button";
import toast, { Toaster } from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ArtDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { user, isGuest } = useAuthStore();
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
          
          // Track recently viewed in localStorage
          try {
            const recentsStr = localStorage.getItem("b-art-recents");
            let recents = recentsStr ? JSON.parse(recentsStr) : [];
            recents = recents.filter((r: any) => r.id !== found.id);
            recents.unshift({ id: found.id, title: found.title, image: found.image, price: found.price });
            recents = recents.slice(0, 4);
            localStorage.setItem("b-art-recents", JSON.stringify(recents));
          } catch (e) {
            console.error("Failed to track recently viewed:", e);
          }

          // Fetch other arts by artist
          const others = allArts.filter((a: any) => a.artistId === found.artistId && a.id !== id);
          setArtistArts(others);
          
          // Check if liked
          if (user) {
            const favRes = await fetch("/api/favorites?type=art");
            if (favRes.ok) {
              const favs = await favRes.json();
              setIsLiked(favs.some((f: any) => f.id === found.id));
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to load art detail:", error);
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
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setReviewsLoading(false);
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
        body: JSON.stringify({ type: "art", targetId: art.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.favorited);
        if (data.favorited) {
          toast.success("Added to favorites");
        } else {
          toast.success("Removed from favorites");
        }
      }
    } catch {
      toast.error("Failed to update favorite");
    }
  };

  const handleAddToCart = async () => {
    if (isGuest || !user) {
      setShowLoginModal(true);
      return;
    }

    const success = await cartStore.addItem(art.id, 1);
    if (success) {
      toast.success("Added to cart");
    } else {
      toast.error(cartStore.error || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (isGuest || !user) {
      setShowLoginModal(true);
      return;
    }

    const success = await cartStore.addItem(art.id, 1);
    if (success) {
      router.push("/checkout");
    } else {
      toast.error("Failed to add to cart");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Artwork link copied to clipboard!", { icon: "📎" });
  };

  // Submit new review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest || !user) {
      setShowLoginModal(true);
      return;
    }

    if (!newComment.trim()) {
      toast.error("Review comment cannot be empty");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artId: id,
          rating: newRating,
          comment: newComment,
        }),
      });

      if (res.ok) {
        toast.success("Review submitted successfully");
        setNewComment("");
        setNewRating(5);
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit review");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Update existing review
  const handleReviewUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editComment.trim()) {
      toast.error("Review comment cannot be empty");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: editingReviewId,
          rating: editRating,
          comment: editComment,
        }),
      });

      if (res.ok) {
        toast.success("Review updated successfully");
        setEditingReviewId(null);
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update review");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete review
  const handleReviewDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Review deleted");
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete review");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-955 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-zinc-400 text-sm tracking-widest">LOADING ARTWORK DETAILS...</p>
        </div>
      </div>
    );
  }

  if (!art) {
    return (
      <div className="min-h-screen bg-zinc-955 text-white flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert size={64} className="text-zinc-600 mb-4" />
        <h2 className="text-2xl font-bold">Artwork Not Found</h2>
        <p className="text-zinc-400 mt-2 max-w-sm">The artwork you are looking for might have been removed or doesn't exist.</p>
        <Link href="/home" className="mt-6 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition">
          <ChevronLeft size={16} /> Back to Gallery
        </Link>
      </div>
    );
  }

  // Premium gallery images representing framing mockup and zoom detail
  const galleryImages = [
    { url: art.image, label: "Original" },
    { url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80", label: "Framed Canvas" },
    { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80", label: "Texture Zoom" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Toaster position="top-right" />
      <LoginRequiredModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Auction Modal */}
      {showAuctionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setShowAuctionModal(false)}>
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <Gavel size={48} className="mx-auto text-purple-400 animate-bounce" />
            <h3 className="text-xl font-bold text-white">Live Bidding</h3>
            <p className="text-sm text-zinc-400">Real-time auction features are currently under development. Be the first to know when it drops!</p>
            <button 
              type="button" 
              onClick={() => { setShowAuctionModal(false); router.push("/coming-soon"); }}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-full transition"
            >
              Learn More
            </button>
          </div>
        </div>
      )}

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 text-zinc-400 hover:text-white transition font-semibold text-sm">
          <ChevronLeft size={18} /> Back to Gallery
        </Link>
        <Link href="/home" className="text-2xl font-bold font-serif bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-playfair), serif" }}>
          B.Art
        </Link>
        <div className="w-24"></div>
      </header>

      {/* CONTENT BODY */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* IMAGE CARD & GALLERY (LHS) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-zinc-900/60 aspect-[4/3] relative flex items-center justify-center">
              <img src={selectedImage} alt={art.title} className="w-full h-full object-cover transition-all duration-300" />
              {art.isCommission && (
                <span className="absolute top-4 left-4 bg-purple-600/90 backdrop-blur text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Open Commission
                </span>
              )}
            </div>
            
            {/* Gallery Thumbnails */}
            <div className="flex gap-3 pt-1">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative flex-1 aspect-[4/3] rounded-xl overflow-hidden border transition ${
                    selectedImage === img.url 
                      ? "border-purple-500 ring-2 ring-purple-500/20" 
                      : "border-zinc-800 opacity-60 hover:opacity-100"
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
              <span className="text-xs px-3.5 py-2 rounded-2xl bg-zinc-900 border border-zinc-850 text-zinc-400">Style: <strong className="text-white">{art.style}</strong></span>
              <span className="text-xs px-3.5 py-2 rounded-2xl bg-zinc-900 border border-zinc-850 text-zinc-400">Theme: <strong className="text-white">{art.theme}</strong></span>
              <span className="text-xs px-3.5 py-2 rounded-2xl bg-zinc-900 border border-zinc-850 text-zinc-400">Color: <strong className="text-white">{art.color}</strong></span>
              <span className="text-xs px-3.5 py-2 rounded-2xl bg-zinc-900 border border-zinc-850 text-zinc-400">Category: <strong className="text-white">{art.category}</strong></span>
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
                  <p className="text-[10px] uppercase text-zinc-500 tracking-wider font-bold">{art.artist?.badge || "COPPER"} Artist</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 border-t border-zinc-850 pt-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Description</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{art.description}</p>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Direct Price</span>
                <p className="text-2xl font-bold text-purple-400 mt-1">{formatCurrency(art.price)}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Availability</span>
                <p className={`text-sm font-semibold mt-1 ${art.stock > 0 ? "text-green-400" : "text-red-400"}`}>
                  {art.stock > 0 ? `${art.stock} Available` : "Sold Out"}
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
                  Buy Now
                </Button>
                <Button 
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3.5 text-sm font-bold border border-zinc-700/80"
                  onClick={handleAddToCart}
                  disabled={art.stock <= 0}
                >
                  Add to Cart
                </Button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleLike}
                  className="flex-1 py-3 px-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition flex items-center justify-center gap-2"
                >
                  <Heart size={16} className={isLiked ? "fill-red-500 text-red-500 border-0" : ""} />
                  {isLiked ? "Favorited" : "Favorite Artwork"}
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-3 px-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl text-xs font-semibold text-zinc-350 hover:text-white hover:border-zinc-700 transition flex items-center justify-center gap-2 font-medium"
                >
                  <Share2 size={16} className="text-purple-400" /> Share Artwork
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/coming-soon")}
                  className="px-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl text-zinc-300 hover:text-white transition flex items-center justify-center"
                  title="Open Chat"
                >
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>

            {/* Live Auction Card */}
            <div className="border border-zinc-800/80 rounded-3xl p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/15 text-purple-400 rounded-2xl">
                  <Gavel size={22} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-full">Auction Info</span>
                  <h4 className="font-bold text-sm text-white mt-1.5">No Active Auction</h4>
                  <p className="text-xs text-zinc-500">This artwork has no ongoing auctions. Bidding is unavailable.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuctionModal(true)}
                className="w-full mt-4 py-2 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                View Upcoming Auctions <ArrowRight size={12} />
              </button>
            </div>

          </div>
        </div>

        {/* REVIEWS SECTION */}
        <section className="space-y-8 border-t border-zinc-900 pt-10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-serif text-white flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Ulasan Komunitas • Reviews
              </h3>
              <p className="text-xs text-zinc-500">What collectors think about {art.title}.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-850 px-5 py-3 rounded-2xl shrink-0 self-start sm:self-auto">
              <div className="text-center border-r border-zinc-800 pr-4">
                <p className="text-3xl font-serif font-bold text-white leading-none">{getAverageRating()}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">Rating</p>
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
                <p className="text-[10px] text-zinc-400 mt-1">{reviews.length} total reviews</p>
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
                  <h4 className="font-bold text-white text-sm">No Reviews Yet</h4>
                  <p className="text-xs text-zinc-500">Be the first to review this stunning digital asset!</p>
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
                                {[...Array(5)].map((_, i) => (
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
                                  title="Edit Review"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReviewDelete(rev.id)}
                                  className="text-zinc-500 hover:text-red-400 p-1 transition"
                                  title="Delete Review"
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
                              <span className="text-xs text-zinc-400 font-medium">Rating:</span>
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
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={submittingReview}
                                className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 text-[10px] font-bold rounded-lg transition"
                              >
                                Save
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
            <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-850 rounded-[2rem] p-6 space-y-4 shadow-xl">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Tulis Ulasan</h4>
                <p className="text-xs text-zinc-500">Share your thoughts with other collectors.</p>
              </div>

              {!user ? (
                <div className="text-center py-6 bg-zinc-950/20 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <p className="text-xs text-zinc-500">Sign in to write a review for this artwork.</p>
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-full transition shadow"
                  >
                    Sign In
                  </button>
                </div>
              ) : reviews.some((r) => r.userId === user.id) ? (
                <div className="text-center py-6 bg-zinc-950/20 border border-zinc-800 rounded-2xl p-4">
                  <p className="text-xs text-zinc-500">
                    You have already reviewed this artwork. You can edit or delete your review directly in the list.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4 text-sm">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-450 uppercase tracking-wider block">Select Rating</label>
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
                    <label className="text-xs font-bold text-zinc-455 uppercase tracking-wider block">Write Comment</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="What do you love about this piece? Describe the details..."
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
                      "Submit Ulasan"
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
                <Sparkles size={18} className="text-purple-400" /> More from this Artist
              </h3>
              <Link href={`/artist/${art.artistId}`} className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                View Profile <ArrowRight size={12} />
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
                      <span className="text-zinc-500">{item.style}</span>
                      <span className="font-bold text-purple-400">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
