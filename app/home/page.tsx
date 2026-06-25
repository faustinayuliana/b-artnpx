"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Menu, 
  Gavel, 
  ShoppingCart, 
  MessageSquare, 
  Heart, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Minus,
  Sparkles,
  Filter,
  X
} from "lucide-react";
import { useAuthStore } from "@/src/lib/stores";
import { useCartStore } from "@/src/lib/cartStore";
import { formatCurrency } from "@/src/lib/format";
import { LoginRequiredModal } from "@/src/components/login-required-modal";
import { Button } from "@/src/components/button";
import toast, { Toaster } from "react-hot-toast";

const STYLES = ["All Arts", "Illustration", "Graphic Design", "Photography", "Japanese", "Abstract", "Paintings", "Traditional Art"];
const COLORS = ["Red", "Blue", "Green", "Black", "White", "Purple", "Pink", "Orange", "Yellow"];
const THEMES = ["Japanese", "Anime", "Sports", "Cars", "Movies", "Animals", "Nature", "Travel", "Food"];
const PRICES = [
  { label: "All Prices", value: "" },
  { label: "Under Rp100.000", value: "under-100k" },
  { label: "Rp100.000–Rp500.000", value: "100k-500k" },
  { label: "Rp500.000–Rp1.000.000", value: "500k-1m" },
  { label: "Rp1.000.000–Rp5.000.000", value: "1m-5m" },
  { label: "Above Rp5.000.000", value: "above-5m" }
];
const CATEGORIES = ["All", "Poster", "Wallpaper", "Sticker", "Anime Graph", "Illustration", "Digital Asset", "Open Commission"];

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isGuest, setUser, setGuest, reset: resetAuth } = useAuthStore();
  const cartStore = useCartStore();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("All Arts");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // UI States
  const [arts, setArts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Slider states
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [newestArtists, setNewestArtists] = useState<any[]>([]);
  const [bestDeals, setBestDeals] = useState<any[]>([]);
  const [digitalAssets, setDigitalAssets] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);

  // User likes tracking
  const [userLikes, setUserLikes] = useState<string[]>([]);

  useEffect(() => {
    // Resolve guest query param
    const isGuestQuery = searchParams.get("guest") === "true";
    if (isGuestQuery) {
      setGuest(true);
    }
  }, [searchParams, setGuest]);

  // Load Initial Data
  useEffect(() => {
    fetchArts();
    fetchSliders();
    if (user) {
      cartStore.fetchCart();
      fetchUserLikes();
    }
  }, [user, selectedStyle, selectedColor, selectedTheme, selectedPriceRange, selectedCategory]);

  const fetchArts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedStyle && selectedStyle !== "All Arts") params.append("style", selectedStyle);
      if (selectedColor) params.append("color", selectedColor);
      if (selectedTheme) params.append("theme", selectedTheme);
      if (selectedCategory && selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedPriceRange) params.append("priceRange", selectedPriceRange);

      const res = await fetch(`/api/arts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setArts(data);
      }
    } catch (error) {
      console.error("Failed to fetch arts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSliders = async () => {
    try {
      // Fetch deals
      const dealsRes = await fetch("/api/arts");
      if (dealsRes.ok) {
        const allArts = await dealsRes.json();
        // Best deals: arts sorted by price asc, or mock discounts
        setBestDeals(allArts.slice(0, 6));
        // Digital assets: style 'Digital Asset' or category 'Digital Asset'
        setDigitalAssets(allArts.filter((a: any) => a.category === "Digital Asset"));
        // Commissions: isCommission = true
        setCommissions(allArts.filter((a: any) => a.isCommission));
      }

      // Fetch Top Artists (mock / users list)
      const artistsRes = await fetch("/api/seed/artists"); // fallback below if not exists
      let artistsData = [];
      try {
        const res = await fetch("/api/arts");
        const all = await res.json();
        const artistMap = new Map();
        all.forEach((art: any) => {
          if (art.artist) {
            artistMap.set(art.artist.id, art.artist);
          }
        });
        artistsData = Array.from(artistMap.values());
      } catch {}
      
      setTopArtists(artistsData.slice(0, 10));
      setNewestArtists(artistsData.slice().reverse());
    } catch (error) {
      console.error("Failed to fetch sliders data:", error);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const res = await fetch("/api/favorites?type=art");
      if (res.ok) {
        const data = await res.json();
        setUserLikes(data.map((art: any) => art.id));
      }
    } catch {}
  };

  const handleLike = async (artId: string) => {
    if (isGuest || !user) {
      setShowLoginModal(true);
      return;
    }

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "art", targetId: artId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.favorited) {
          setUserLikes([...userLikes, artId]);
          toast.success("Added to favorites");
        } else {
          setUserLikes(userLikes.filter((id) => id !== artId));
          toast.success("Removed from favorites");
        }
      }
    } catch {
      toast.error("Failed to toggle favorite");
    }
  };

  const handleAddToCart = async (artId: string) => {
    if (isGuest || !user) {
      setShowLoginModal(true);
      return;
    }

    const success = await cartStore.addItem(artId, 1);
    if (success) {
      toast.success("Added to cart");
      setCartOpen(true);
    } else {
      toast.error(cartStore.error || "Failed to add to cart");
    }
  };

  const handleCheckout = () => {
    if (isGuest || !user) {
      setShowLoginModal(true);
      return;
    }
    setCartOpen(false);
    router.push("/checkout");
  };

  const handleLogout = async () => {
    await fetch("/api/auth?action=logout", { method: "POST" });
    resetAuth();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Toaster position="top-right" />
      
      {/* Login Required Modal */}
      <LoginRequiredModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Live Auction Info Modal */}
      <Modal open={showAuctionModal} title="Upcoming Auctions" onClose={() => setShowAuctionModal(false)}>
        <div className="space-y-4 p-2 text-zinc-800">
          <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50/50 rounded-r-xl">
            <h4 className="font-bold text-lg text-purple-950">Anime Spirit</h4>
            <p className="text-sm text-purple-800 font-medium">Bidding starts Tomorrow at 19:00</p>
            <p className="text-xs text-zinc-500 mt-1">Get ready to bid on rare anime artwork commissions.</p>
          </div>
          <button 
            type="button" 
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-full transition"
            onClick={() => {
              setShowAuctionModal(false);
              router.push("/coming-soon");
            }}
          >
            Go to Auction Page
          </button>
        </div>
      </Modal>

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            className="p-2 hover:bg-zinc-900 rounded-xl transition text-zinc-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={22} />
          </button>
          <Link href="/home" className="text-2xl font-bold font-serif bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-playfair), serif" }}>
            B.Art
          </Link>
        </div>

        {/* Search Bar */}
        <form 
          className="flex-1 max-w-lg relative hidden md:block"
          onSubmit={(e) => { e.preventDefault(); fetchArts(); }}
        >
          <input
            type="text"
            placeholder="Search arts, artists, style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-full py-2.5 pl-5 pr-12 text-sm focus:outline-none focus:border-purple-500/50 transition focus:ring-1 focus:ring-purple-500/20 text-white"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-purple-400 transition">
            <Search size={18} />
          </button>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Live Auction Indicator (Gray/No auction) */}
          <button 
            type="button" 
            className="relative p-2 hover:bg-zinc-900 rounded-xl transition text-zinc-400 hover:text-zinc-200 group"
            onClick={() => setShowAuctionModal(true)}
          >
            <Gavel size={20} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-zinc-600 ring-2 ring-zinc-950 animate-pulse"></span>
          </button>

          {/* Cart Icon */}
          <button 
            type="button" 
            className="relative p-2 hover:bg-zinc-900 rounded-xl transition text-zinc-400 hover:text-zinc-200"
            onClick={() => {
              if (isGuest) setShowLoginModal(true);
              else setCartOpen(true);
            }}
          >
            <ShoppingCart size={20} />
            {!isGuest && cartStore.items.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[1rem] flex items-center justify-center rounded-full bg-purple-600 px-1 text-[0.6rem] font-bold text-white ring-2 ring-zinc-950">
                {cartStore.items.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            )}
          </button>

          {/* Chat Icon */}
          <button 
            type="button" 
            className="p-2 hover:bg-zinc-900 rounded-xl transition text-zinc-400 hover:text-zinc-200"
            onClick={() => router.push("/coming-soon")}
          >
            <MessageSquare size={20} />
          </button>

          {/* User Section */}
          {isGuest ? (
            <Link href="/login">
              <Button className="py-2 px-5 text-xs bg-purple-600 hover:bg-purple-500 font-semibold border-0">Sign In</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
              <Link href="/profile" className="flex items-center gap-2 group">
                <img 
                  src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} 
                  alt="Avatar" 
                  className="h-8 w-8 rounded-full border border-zinc-700 object-cover transition group-hover:border-purple-400"
                />
                <span className="text-sm font-medium text-zinc-300 hidden lg:inline max-w-[100px] truncate group-hover:text-white transition">
                  {user?.username}
                </span>
              </Link>
              <button 
                type="button" 
                className="p-2 hover:bg-red-950/30 text-zinc-500 hover:text-red-400 rounded-xl transition"
                onClick={handleLogout}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MOBILE MENU / SIDEBAR DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm sm:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 bg-zinc-900 p-6 flex flex-col justify-between h-full" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold font-serif" style={{ fontFamily: "var(--font-playfair), serif" }}>B.Art Menu</span>
                <button type="button" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
              </div>
              <nav className="flex flex-col gap-4 text-sm font-medium">
                <Link href="/home" className="flex items-center gap-3 text-white py-2 border-b border-zinc-800"><Sparkles size={16} /> Dashboard</Link>
                <button 
                  type="button" 
                  className="flex items-center gap-3 text-zinc-300 hover:text-white py-2 text-left"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isGuest) setShowLoginModal(true);
                    else router.push("/favorites");
                  }}
                >
                  <Heart size={16} /> Favorites
                </button>
                <button 
                  type="button" 
                  className="flex items-center gap-3 text-zinc-300 hover:text-white py-2 text-left"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isGuest) setShowLoginModal(true);
                    else router.push("/notifications");
                  }}
                >
                  <MessageSquare size={16} /> Notifications
                </button>
                {!isGuest && (
                  <>
                    <Link href="/profile" className="flex items-center gap-3 text-zinc-300 hover:text-white py-2"><UserIcon size={16} /> My Profile</Link>
                    <Link href="/profile/settings" className="flex items-center gap-3 text-zinc-300 hover:text-white py-2"><Settings size={16} /> Settings</Link>
                    {user?.role === "ARTIST" ? (
                      <Link href="/artist/manage" className="flex items-center gap-3 text-zinc-300 hover:text-white py-2"><Gavel size={16} /> Manage Arts</Link>
                    ) : (
                      <Link href="/become-artist" className="flex items-center gap-3 text-purple-400 hover:text-purple-300 py-2"><Sparkles size={16} /> Become Artist</Link>
                    )}
                  </>
                )}
              </nav>
            </div>
            {user ? (
              <button 
                type="button" 
                className="w-full py-3 bg-red-950/30 text-red-400 rounded-xl hover:bg-red-950/60 font-semibold transition"
                onClick={handleLogout}
              >
                Log Out
              </button>
            ) : (
              <Link href="/login" className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-500">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* DYNAMIC CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
          <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 p-6 flex flex-col justify-between h-full" onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2"><ShoppingCart size={22} className="text-purple-400" /> Your Cart</h3>
                <button type="button" onClick={() => setCartOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white"><X size={20} /></button>
              </div>

              {cartStore.items.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Your cart is empty.</p>
                  <p className="text-sm mt-1">Discover arts and add them here!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {cartStore.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-zinc-800/40 rounded-2xl border border-zinc-800/50">
                      <img src={item.art.image} alt={item.art.title} className="h-16 w-16 object-cover rounded-xl bg-zinc-900 border border-zinc-700" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-white line-clamp-1">{item.art.title}</h4>
                          <p className="text-xs text-zinc-400">by {item.art.artist.username}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium text-zinc-300">{formatCurrency(item.art.price)}</span>
                          <div className="flex items-center gap-2.5 bg-zinc-900/60 border border-zinc-850 px-2 py-1 rounded-full">
                            <button type="button" onClick={() => cartStore.updateQty(item.id, item.qty - 1)} className="text-zinc-500 hover:text-white transition"><Minus size={12} /></button>
                            <span className="text-xs font-semibold text-white">{item.qty}</span>
                            <button type="button" onClick={() => cartStore.updateQty(item.id, item.qty + 1)} className="text-zinc-500 hover:text-white transition"><Plus size={12} /></button>
                          </div>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => cartStore.removeItem(item.id)}
                        className="text-zinc-500 hover:text-red-400 p-1.5 self-start hover:bg-zinc-850 rounded-xl transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartStore.items.length > 0 && (
              <div className="border-t border-zinc-800 pt-6 mt-4 space-y-4">
                <div className="space-y-2 text-sm text-zinc-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white">{formatCurrency(cartStore.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admin Fee</span>
                    <span className="text-white">{formatCurrency(cartStore.adminFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span className="text-white">{formatCurrency(cartStore.serviceFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (1%)</span>
                    <span className="text-white">{formatCurrency(cartStore.tax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800/50">
                    <span>Total Amount</span>
                    <span className="text-purple-400">{formatCurrency(cartStore.total)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 py-3.5 font-bold"
                    onClick={handleCheckout}
                    disabled={cartStore.loading}
                  >
                    Buy Now
                  </Button>
                  <p className="text-[10px] text-center text-zinc-500">Secure transaction powered by B.Art Wallet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CORE CONTENT LAYOUT */}
      <div className="flex flex-1 relative">
        
        {/* SIDEBAR FILTERS (DESKTOP) */}
        <aside className="w-64 border-r border-zinc-850 p-6 hidden md:flex flex-col gap-8 sticky top-[73px] h-[calc(105vh-73px)] overflow-y-auto shrink-0 bg-zinc-950">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
            <Filter size={16} className="text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Filters</h3>
          </div>

          {/* Style Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Style</h4>
            <div className="flex flex-col gap-2">
              {STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={`text-left text-sm py-1.5 px-3 rounded-xl transition ${selectedStyle === style ? "bg-purple-600/10 text-purple-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Colors</h4>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  title={col}
                  onClick={() => setSelectedColor(selectedColor === col ? "" : col)}
                  className={`w-7 h-7 rounded-full border transition hover:scale-110 relative ${selectedColor === col ? "border-purple-400 ring-2 ring-purple-600/30 scale-105" : "border-zinc-800"}`}
                  style={{
                    backgroundColor: col.toLowerCase() === "white" ? "#fff" : 
                                     col.toLowerCase() === "black" ? "#000" :
                                     col.toLowerCase() === "pink" ? "#ec4899" :
                                     col.toLowerCase() === "purple" ? "#a855f7" : col.toLowerCase()
                  }}
                >
                  {selectedColor === col && (
                    <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${col === "White" || col === "Yellow" ? "text-zinc-950" : "text-white"}`}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Theme</h4>
            <div className="flex flex-wrap gap-1.5">
              {THEMES.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setSelectedTheme(selectedTheme === theme ? "" : theme)}
                  className={`text-xs px-2.5 py-1.5 rounded-full border transition ${selectedTheme === theme ? "bg-purple-600 text-white border-purple-500 font-medium" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"}`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Price</h4>
            <div className="flex flex-col gap-2">
              {PRICES.map((pr) => (
                <button
                  key={pr.label}
                  type="button"
                  onClick={() => setSelectedPriceRange(pr.value)}
                  className={`text-left text-sm py-1 px-3 rounded-xl transition ${selectedPriceRange === pr.value ? "bg-purple-600/10 text-purple-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"}`}
                >
                  {pr.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN BODY CONTAINER */}
        <main className="flex-1 p-4 sm:p-8 space-y-12 overflow-x-hidden">
          
          {/* WELCOME / SEARCH BAR MOBILE */}
          <div className="space-y-4 md:hidden">
            <form 
              className="w-full relative"
              onSubmit={(e) => { e.preventDefault(); fetchArts(); }}
            >
              <input
                type="text"
                placeholder="Search arts, artists, style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2.5 pl-5 pr-12 text-sm focus:outline-none focus:border-purple-500/50"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400">
                <Search size={18} />
              </button>
            </form>
            <div className="flex gap-2">
              <button 
                type="button"
                className="flex-1 py-2 bg-zinc-900 text-sm font-semibold rounded-xl text-zinc-300 hover:text-white flex items-center justify-center gap-2 border border-zinc-800"
                onClick={() => setMobileFilterOpen(true)}
              >
                <Filter size={14} /> Filter Styles & Colors
              </button>
            </div>
          </div>

          {/* DYNAMIC CATEGORY TABS */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-900">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0 transition-all ${selectedCategory === cat ? "bg-white text-zinc-950 shadow-lg scale-105" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* SLIDER SECTION: BEST DEALS */}
          {bestDeals.length > 0 && selectedCategory === "All" && !searchQuery && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight"><Sparkles size={18} className="text-purple-400" /> Best Deals</h3>
                <span className="text-xs text-zinc-500">Swipe to view</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
                {bestDeals.map((art) => (
                  <div key={art.id} className="w-64 shrink-0 snap-start bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group hover:border-zinc-700 transition duration-300">
                    <Link href={`/art/${art.id}`} className="block aspect-[4/3] overflow-hidden bg-zinc-950 relative">
                      <img src={art.image} alt={art.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                      <span className="absolute top-3 right-3 bg-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">DEAL</span>
                    </Link>
                    <div className="p-4 space-y-3">
                      <h4 className="font-semibold text-sm text-white line-clamp-1">{art.title}</h4>
                      <div className="flex justify-between items-center text-xs text-zinc-400">
                        <span>by {art.artist?.username}</span>
                        <span className="font-bold text-white text-sm">{formatCurrency(art.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SLIDER SECTION: TOP 10 ARTISTS */}
          {topArtists.length > 0 && selectedCategory === "All" && !searchQuery && (
            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight"><UserIcon size={18} className="text-purple-400" /> Top Artists</h3>
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x">
                {topArtists.map((artist, idx) => (
                  <div key={artist.id} className="w-48 shrink-0 snap-start bg-zinc-900/40 border border-zinc-850 p-5 rounded-3xl text-center flex flex-col items-center gap-3 group hover:border-purple-500/30 transition">
                    <div className="relative">
                      <img src={artist.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} alt={artist.username} className="w-16 h-16 rounded-full border border-zinc-750 object-cover group-hover:border-purple-400 transition" />
                      <span className="absolute -top-1 -left-1 bg-purple-600 text-[10px] w-5 h-5 flex items-center justify-center font-bold rounded-full">#{idx+1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-white">{artist.username}</h4>
                      <span className="text-[9px] uppercase tracking-widest text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {artist.badge || "COPPER"} ARTIST
                      </span>
                    </div>
                    <Link href={`/artist/${artist.id}`} className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 mt-1 transition">
                      View Profile <ChevronRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ART GRID */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold tracking-tight">Digital Gallery</h3>
              <span className="text-xs text-zinc-500">{arts.length} artworks found</span>
            </div>

            {loading ? (
              // SKELETON LOADER
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-zinc-900 border border-zinc-850 rounded-[2rem] overflow-hidden aspect-[4/3] w-full flex flex-col p-4 justify-between">
                    <div className="bg-zinc-850 h-2/3 w-full rounded-2xl"></div>
                    <div className="space-y-2 mt-4">
                      <div className="bg-zinc-850 h-4 w-1/2 rounded"></div>
                      <div className="bg-zinc-850 h-3 w-1/3 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : arts.length === 0 ? (
              // EMPTY STATE
              <div className="text-center py-20 bg-zinc-900/20 border border-zinc-850/60 rounded-[2rem]">
                <Search size={48} className="mx-auto mb-4 text-zinc-700" />
                <h4 className="font-bold text-lg text-white">No Artworks Found</h4>
                <p className="text-zinc-500 text-sm mt-1">Try relaxing filters or search fields.</p>
              </div>
            ) : (
              // ARTWORKS GRID
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {arts.map((art) => (
                  <div key={art.id} className="group overflow-hidden rounded-[2rem] border border-zinc-850 bg-zinc-900/40 hover:bg-zinc-900 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/10">
                    <Link href={`/art/${art.id}`} className="block aspect-[4/3] w-full overflow-hidden bg-zinc-950">
                      <img src={art.image} alt={art.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    </Link>
                    <div className="space-y-3 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-white truncate line-clamp-1">{art.title}</h3>
                          <Link href={`/artist/${art.artistId}`} className="text-xs text-zinc-400 hover:text-white transition">
                            by {art.artist?.username}
                          </Link>
                        </div>
                        <span className="text-sm font-bold text-purple-400">{formatCurrency(art.price)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 border-t border-zinc-800/60 pt-3 mt-1">
                        <button 
                          type="button" 
                          onClick={() => handleLike(art.id)} 
                          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
                        >
                          <Heart size={16} className={userLikes.includes(art.id) ? "fill-red-500 text-red-500" : ""} />
                          {userLikes.includes(art.id) ? "Liked" : "Like"}
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button 
                            type="button" 
                            onClick={() => handleAddToCart(art.id)} 
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-[10px] font-bold text-white transition"
                          >
                            <ShoppingCart size={10} /> Add
                          </button>
                          <Link 
                            href={`/art/${art.id}`} 
                            className="inline-flex items-center gap-1 rounded-full border border-zinc-800 px-3 py-1.5 text-[10px] font-bold text-zinc-300 hover:border-zinc-600 hover:text-white transition"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SLIDER SECTION: COMMISSION SLIDER */}
          {commissions.length > 0 && selectedCategory === "All" && !searchQuery && (
            <section className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight"><Sparkles size={18} className="text-purple-400" /> Open Commission</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
                {commissions.map((art) => (
                  <div key={art.id} className="w-64 shrink-0 snap-start bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group hover:border-zinc-700 transition duration-300">
                    <Link href={`/art/${art.id}`} className="block aspect-[4/3] overflow-hidden bg-zinc-950 relative">
                      <img src={art.image} alt={art.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                      <span className="absolute top-3 right-3 bg-purple-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">COMMISSION</span>
                    </Link>
                    <div className="p-4 space-y-3">
                      <h4 className="font-semibold text-sm text-white line-clamp-1">{art.title}</h4>
                      <div className="flex justify-between items-center text-xs text-zinc-400">
                        <span>by {art.artist?.username}</span>
                        <span className="font-bold text-purple-400 text-sm">{formatCurrency(art.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* MOBILE FILTER MODAL */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)}>
          <div className="w-full max-w-sm bg-zinc-900 p-6 flex flex-col justify-between h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <span className="text-base font-bold uppercase tracking-wider text-zinc-300">Filters</span>
                <button type="button" onClick={() => setMobileFilterOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
              </div>

              {/* Styles */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Style</h4>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => { setSelectedStyle(style); setMobileFilterOpen(false); }}
                      className={`text-xs px-3 py-1.5 rounded-full transition ${selectedStyle === style ? "bg-purple-600 text-white font-semibold" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => { setSelectedColor(selectedColor === col ? "" : col); setMobileFilterOpen(false); }}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${selectedColor === col ? "bg-purple-600 border-purple-500 text-white font-semibold" : "bg-zinc-800 border-zinc-800 text-zinc-400"}`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Ranges */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Price</h4>
                <div className="flex flex-col gap-2">
                  {PRICES.map((pr) => (
                    <button
                      key={pr.label}
                      type="button"
                      onClick={() => { setSelectedPriceRange(pr.value); setMobileFilterOpen(false); }}
                      className={`text-left text-xs py-2 px-3 rounded-xl transition ${selectedPriceRange === pr.value ? "bg-purple-600/10 text-purple-400 font-semibold" : "bg-zinc-800 text-zinc-400"}`}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <button 
              type="button" 
              className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-full transition"
              onClick={() => setMobileFilterOpen(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple base Modal component used inside page
interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl relative">
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-zinc-600 transition"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold font-serif text-zinc-950 mb-3">{title}</h3>
        <div>{children}</div>
      </div>
    </div>
  );
}
