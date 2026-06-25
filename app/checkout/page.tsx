"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Star,
  Plus,
  Check,
  Loader2,
  ArrowRight,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Coins,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "@/src/lib/stores";
import { useCartStore } from "@/src/lib/cartStore";
import { formatCurrency } from "@/src/lib/format";
import toast, { Toaster } from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isGuest, setUser } = useAuthStore();
  const cartStore = useCartStore();

  // User relations from API
  const [addresses, setAddresses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);

  // Selections
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Modals
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Inline Add Address Form
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrAddress, setAddrAddress] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrProvince, setAddrProvince] = useState("");
  const [addrPostalCode, setAddrPostalCode] = useState("");
  const [addrIsPrimary, setAddrIsPrimary] = useState(false);

  // Inline Add Payment Form
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [payBank, setPayBank] = useState("Mandiri");
  const [payNumber, setPayNumber] = useState("");
  const [payIsPrimary, setPayIsPrimary] = useState(false);

  // Inline Top-up Form
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [toppingUp, setToppingUp] = useState(false);

  // Simulation State
  const [simulationState, setSimulationState] = useState<"idle" | "pending" | "paid" | "completed" | "cancelled">("idle");
  const [simulationError, setSimulationError] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/user");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data);
      setWalletBalance(data.wallet || 0);
      
      const addrList = data.addresses || [];
      setAddresses(addrList);
      // Auto select primary address, or first address
      const primaryAddr = addrList.find((a: any) => a.isPrimary) || addrList[0] || null;
      setSelectedAddress(primaryAddr);

      const payList = data.payments || [];
      setPayments(payList);
      // Auto select primary payment, or first payment
      const primaryPay = payList.find((p: any) => p.isPrimary) || payList[0] || null;
      setSelectedPayment(primaryPay);
    } catch {
      router.push("/login");
    }
  };

  useEffect(() => {
    if (isGuest) {
      router.push("/login");
      return;
    }
    cartStore.fetchCart();
    loadData();
  }, [isGuest]);

  // Calculations
  const subtotal = cartStore.subtotal;
  const adminFee = subtotal > 0 ? 2500 : 0;
  const serviceFee = subtotal > 0 ? 3000 : 0;
  const tax = Math.round(subtotal * 0.01);
  const total = subtotal + adminFee + serviceFee + tax;

  // Add Address Handler
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrAddress || !addrCity || !addrProvince || !addrPostalCode) {
      toast.error("All fields are required");
      return;
    }
    try {
      const res = await fetch("/api/user?action=address-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addrName,
          phone: addrPhone,
          address: addrAddress,
          city: addrCity,
          province: addrProvince,
          postalCode: addrPostalCode,
          isPrimary: addrIsPrimary,
        }),
      });

      if (res.ok) {
        toast.success("Address added");
        setShowAddAddress(false);
        resetAddressForm();
        // Reload and set newly added as selected
        const userRes = await fetch("/api/user");
        if (userRes.ok) {
          const freshData = await userRes.json();
          setAddresses(freshData.addresses || []);
          const added = freshData.addresses?.find((a: any) => a.name === addrName && a.address === addrAddress) || freshData.addresses?.[freshData.addresses.length - 1];
          if (added) setSelectedAddress(added);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add address");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const resetAddressForm = () => {
    setAddrName("");
    setAddrPhone("");
    setAddrAddress("");
    setAddrCity("");
    setAddrProvince("");
    setAddrPostalCode("");
    setAddrIsPrimary(false);
  };

  // Add Payment Handler
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payNumber) {
      toast.error("Account number is required");
      return;
    }
    try {
      const res = await fetch("/api/user?action=payment-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: ["OVO", "Dana", "ShopeePay"].includes(payBank) ? "E_WALLET" : "BANK_TRANSFER",
          bank: payBank,
          number: payNumber,
          isPrimary: payIsPrimary,
        }),
      });

      if (res.ok) {
        toast.success("Payment method added");
        setShowAddPayment(false);
        setPayNumber("");
        setPayIsPrimary(false);
        // Reload and set as selected
        const userRes = await fetch("/api/user");
        if (userRes.ok) {
          const freshData = await userRes.json();
          setPayments(freshData.payments || []);
          const added = freshData.payments?.find((p: any) => p.bank === payBank && p.number === payNumber) || freshData.payments?.[freshData.payments.length - 1];
          if (added) setSelectedPayment(added);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add payment");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  // Top up Handler
  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setToppingUp(true);
    try {
      const res = await fetch("/api/user?action=top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setWalletBalance(data.wallet || 0);
        toast.success(`Successfully topped up Rp${amount.toLocaleString()}`);
        setTopUpAmount("");
        setShowTopUp(false);
      } else {
        toast.error(data.error || "Top up failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setToppingUp(false);
    }
  };

  // Simulated Checkout execution
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }
    if (!selectedPayment) {
      toast.error("Please select a payment method");
      return;
    }
    if (cartStore.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Begin Simulation flow
    setSimulationState("pending");
    setSimulationError("");

    // Phase 1: Pending (Verify details...)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check if balance is sufficient if using B.Art Wallet
    const isWalletPayment = selectedPayment.bank === "B.Art Wallet";
    if (isWalletPayment && walletBalance < total) {
      // Transition to Cancelled state due to insufficient funds
      setSimulationState("cancelled");
      setSimulationError(`Insufficient wallet balance. Total is Rp${total.toLocaleString()}, but your balance is Rp${walletBalance.toLocaleString()}.`);
      return;
    }

    // Phase 2: Paid (Processing order...)
    setSimulationState("paid");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Execute actual database changes via backend endpoint
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        // Success
        setSimulationState("completed");
        cartStore.clearCart();
        // Update local user wallet balance
        const userRes = await fetch("/api/user");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
          setWalletBalance(userData.wallet || 0);
        }
      } else {
        // Failed
        setSimulationState("cancelled");
        setSimulationError(data.error || "Order execution failed");
      }
    } catch (err: any) {
      setSimulationState("cancelled");
      setSimulationError(err.message || "Something went wrong during database transaction");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans relative">
      <Toaster position="top-right" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 text-zinc-400 hover:text-white transition font-semibold text-sm">
          <ChevronLeft size={18} /> Back to Gallery
        </Link>
        <span className="text-2xl font-bold font-serif bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Checkout
        </span>
        <div className="w-24"></div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Address, Payment, Review Items */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SHIPPING ADDRESS */}
          <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <MapPin size={18} className="text-purple-400" /> Shipping Address
              </h3>
              <button
                type="button"
                onClick={() => setAddressModalOpen(true)}
                className="text-xs font-bold text-purple-450 hover:text-purple-400 transition"
              >
                {addresses.length > 0 ? "Change Address" : "Add Address"}
              </button>
            </div>

            {selectedAddress ? (
              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2 relative group">
                <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                  {selectedAddress.name}
                  <span className="text-xs text-zinc-500 font-normal">({selectedAddress.phone})</span>
                  {selectedAddress.isPrimary && (
                    <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      Primary
                    </span>
                  )}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{selectedAddress.address}</p>
                <p className="text-xs text-zinc-500">{selectedAddress.city}, {selectedAddress.province} {selectedAddress.postalCode}</p>
              </div>
            ) : (
              <div className="text-center py-6 bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-xs text-zinc-500 mb-3">No shipping address selected.</p>
                <button
                  type="button"
                  onClick={() => { setShowAddAddress(true); setAddressModalOpen(true); }}
                  className="inline-flex items-center gap-1 py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold border border-zinc-800 transition"
                >
                  <Plus size={12} /> Add Shipping Address
                </button>
              </div>
            )}
          </div>

          {/* PAYMENT METHOD */}
          <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CreditCard size={18} className="text-purple-400" /> Payment Method
              </h3>
              <button
                type="button"
                onClick={() => setPaymentModalOpen(true)}
                className="text-xs font-bold text-purple-450 hover:text-purple-400 transition"
              >
                {payments.length > 0 ? "Change Payment" : "Add Payment"}
              </button>
            </div>

            {selectedPayment ? (
              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                    {selectedPayment.bank}
                    {selectedPayment.isPrimary && (
                      <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                        Primary
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono tracking-wider">{selectedPayment.number}</p>
                </div>
                {selectedPayment.bank === "B.Art Wallet" && (
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Balance</span>
                    <span className="text-xs font-bold font-mono text-purple-400">
                      Rp{walletBalance.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-xs text-zinc-500 mb-3">No payment method selected.</p>
                <button
                  type="button"
                  onClick={() => { setShowAddPayment(true); setPaymentModalOpen(true); }}
                  className="inline-flex items-center gap-1 py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold border border-zinc-800 transition"
                >
                  <Plus size={12} /> Add Payment Method
                </button>
              </div>
            )}
          </div>

          {/* REVIEW ITEMS */}
          <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-3xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShoppingBag size={18} className="text-purple-400" /> Review Items ({cartStore.items.length})
            </h3>

            <div className="divide-y divide-zinc-850">
              {cartStore.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shrink-0">
                    <img src={item.art.image} alt={item.art.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-white truncate">{item.art.title}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">by {item.art.artist?.username}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-zinc-400">Qty: {item.qty}</span>
                      <span className="text-sm font-bold text-purple-400 font-mono">
                        {formatCurrency(item.art.price * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Placement */}
        <div className="space-y-6">
          
          {/* CALCULATION CARD */}
          <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-3xl space-y-6 sticky top-28">
            <h3 className="font-bold text-white text-base">Order Summary</h3>

            <div className="space-y-3.5 border-b border-zinc-850 pb-6 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Admin Fee</span>
                <span className="font-mono">{formatCurrency(adminFee)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Service Fee</span>
                <span className="font-mono">{formatCurrency(serviceFee)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tax (1%)</span>
                <span className="font-mono">{formatCurrency(tax)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-white">
              <span className="font-bold">Total Payment</span>
              <span className="text-xl font-extrabold text-purple-400 font-mono">
                {formatCurrency(total)}
              </span>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={cartStore.items.length === 0}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 disabled:opacity-50 text-base"
            >
              <ShieldCheck size={18} /> Place Simulated Order
            </button>
          </div>
        </div>
      </main>

      {/* ADDRESS SELECTION MODAL */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <header className="p-6 border-b border-zinc-850 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-base">Select Shipping Address</h3>
                <p className="text-xs text-zinc-500">Choose where to deliver your digital assets</p>
              </div>
              <button onClick={() => { setAddressModalOpen(false); setShowAddAddress(false); }} className="text-zinc-500 hover:text-white transition">
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {showAddAddress ? (
                /* INLINE FORM */
                <form onSubmit={handleAddAddress} className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest">New Address Detail</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text" required placeholder="Recipient Name" value={addrName} onChange={(e) => setAddrName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-purple-500 text-white"
                    />
                    <input
                      type="text" required placeholder="Recipient Phone" value={addrPhone} onChange={(e) => setAddrPhone(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-purple-500 text-white"
                    />
                  </div>
                  
                  <textarea
                    required placeholder="Street Address, Building, RT/RW" value={addrAddress} onChange={(e) => setAddrAddress(e.target.value)}
                    rows={2} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-purple-500 text-white resize-none"
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text" required placeholder="City" value={addrCity} onChange={(e) => setAddrCity(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-purple-500 text-white"
                    />
                    <input
                      type="text" required placeholder="Province" value={addrProvince} onChange={(e) => setAddrProvince(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-purple-500 text-white"
                    />
                    <input
                      type="text" required placeholder="Postal Code" value={addrPostalCode} onChange={(e) => setAddrPostalCode(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-purple-500 text-white"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setShowAddAddress(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition">
                      Add Address
                    </button>
                  </div>
                </form>
              ) : (
                /* LIST */
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => { setSelectedAddress(addr); setAddressModalOpen(false); }}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-4 ${
                        selectedAddress?.id === addr.id
                          ? "bg-purple-950/20 border-purple-500/60 shadow-lg"
                          : "bg-zinc-950 border-zinc-850 hover:border-zinc-750"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-semibold text-white text-xs sm:text-sm flex items-center gap-2">
                          {addr.name}
                          <span className="text-[10px] text-zinc-500 font-normal">({addr.phone})</span>
                        </h4>
                        <p className="text-[11px] sm:text-xs text-zinc-400 truncate max-w-xs">{addr.address}</p>
                        <p className="text-[10px] sm:text-xs text-zinc-500">{addr.city}, {addr.province}</p>
                      </div>
                      {selectedAddress?.id === addr.id && (
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                  ))}

                  {addresses.length < 10 && (
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(true)}
                      className="w-full py-3 bg-zinc-950 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl text-xs font-semibold text-zinc-400 hover:text-white transition flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} /> Add New Address
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT SELECTION MODAL */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <header className="p-6 border-b border-zinc-850 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-base">Select Payment Method</h3>
                <p className="text-xs text-zinc-500">Choose your preferred payment method</p>
              </div>
              <button onClick={() => { setPaymentModalOpen(false); setShowAddPayment(false); setShowTopUp(false); }} className="text-zinc-500 hover:text-white transition">
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {showTopUp ? (
                /* TOP UP FORM */
                <form onSubmit={handleTopUp} className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1">
                    <Wallet size={13} className="text-purple-400" /> Wallet Top Up
                  </h4>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase">Enter Amount (Rp)</label>
                    <input
                      type="number" required placeholder="500000" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500 text-white font-mono"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setShowTopUp(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition">
                      Cancel
                    </button>
                    <button type="submit" disabled={toppingUp} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition">
                      {toppingUp ? "Processing..." : "Confirm Top Up"}
                    </button>
                  </div>
                </form>
              ) : showAddPayment ? (
                /* INLINE ADD FORM */
                <form onSubmit={handleAddPayment} className="bg-zinc-950 p-5 rounded-2xl border border-zinc-850 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest">New Payment Method</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-zinc-550 uppercase">Provider</label>
                      <select
                        value={payBank} onChange={(e) => setPayBank(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-purple-500 text-white"
                      >
                        {["Mandiri", "BCA", "BNI", "BRI", "OVO", "Dana", "ShopeePay"].map((bank) => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-zinc-550 uppercase">Account Number</label>
                      <input
                        type="text" required placeholder="1234567890" value={payNumber} onChange={(e) => setPayNumber(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-purple-500 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setShowAddPayment(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-lg transition">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition">
                      Add Payment
                    </button>
                  </div>
                </form>
              ) : (
                /* LIST */
                <div className="space-y-3">
                  {/* B.Art Wallet Item (Standard Available) */}
                  <div
                    onClick={() => {
                      setSelectedPayment({ bank: "B.Art Wallet", number: "B.Art Balance", isPrimary: false });
                      setPaymentModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                      selectedPayment?.bank === "B.Art Wallet"
                        ? "bg-purple-950/20 border-purple-500/60 shadow-lg"
                        : "bg-zinc-950 border-zinc-850 hover:border-zinc-750"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-600/10 rounded-xl text-purple-400">
                        <Coins size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs sm:text-sm">B.Art Wallet</h4>
                        <span className="text-[10px] text-zinc-500">Balance: Rp{walletBalance.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowTopUp(true); }}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-[10px] font-bold text-purple-400 transition"
                      >
                        Top Up
                      </button>
                      {selectedPayment?.bank === "B.Art Wallet" && (
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white shrink-0">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Other Payment Lists */}
                  {payments.filter((p) => p.bank !== "B.Art Wallet").map((pay) => (
                    <div
                      key={pay.id}
                      onClick={() => { setSelectedPayment(pay); setPaymentModalOpen(false); }}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                        selectedPayment?.id === pay.id
                          ? "bg-purple-950/20 border-purple-500/60 shadow-lg"
                          : "bg-zinc-950 border-zinc-850 hover:border-zinc-750"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-zinc-900 rounded-xl text-zinc-400">
                          <CreditCard size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-white text-xs sm:text-sm truncate">{pay.bank}</h4>
                          <span className="text-[10px] text-zinc-500 font-mono truncate block">{pay.number}</span>
                        </div>
                      </div>
                      {selectedPayment?.id === pay.id && (
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white shrink-0">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setShowAddPayment(true)}
                    className="w-full py-3 bg-zinc-950 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl text-xs font-semibold text-zinc-400 hover:text-white transition flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} /> Add Payment Method
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SIMULATION TIMELINE OVERLAY */}
      {simulationState !== "idle" && (
        <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden p-8 text-center space-y-8 shadow-2xl relative">
            
            {/* PROGRESS VIEW */}
            {simulationState === "pending" && (
              <div className="space-y-6 py-4 animate-fadeIn">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500/25 animate-ping"></div>
                  <Loader2 size={80} className="text-purple-500 animate-spin" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-purple-400 uppercase block">Step 1 of 3</span>
                  <h3 className="text-xl font-bold text-white">Pending Verification</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                    Connecting to secure payment systems... verifying account credentials.
                  </p>
                </div>
              </div>
            )}

            {simulationState === "paid" && (
              <div className="space-y-6 py-4 animate-scaleIn">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse"></div>
                  <div className="w-20 h-20 rounded-full bg-blue-600/10 flex items-center justify-center border-2 border-blue-500 text-blue-400">
                    <Check size={36} className="animate-bounce" />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-blue-400 uppercase block">Step 2 of 3</span>
                  <h3 className="text-xl font-bold text-white">Payment Paid</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                    Payment authenticated successfully! Finalizing order transaction and deducting wallet.
                  </p>
                </div>
              </div>
            )}

            {/* COMPLETED SUCCESS STATE */}
            {simulationState === "completed" && (
              <div className="space-y-6 py-4 animate-scaleIn">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 mx-auto text-green-400">
                  <CheckCircle2 size={44} className="animate-bounce" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-green-400 uppercase block">Finished</span>
                  <h3 className="text-2xl font-extrabold text-white">Order Completed</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto pt-1">
                    Your order was successfully registered! Wallet balance and item stocks have been updated in Neon database.
                  </p>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 space-y-2 max-w-xs mx-auto">
                  <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                    <span>Payment:</span>
                    <span className="text-zinc-300">{selectedPayment?.bank}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                    <span>Total Bill:</span>
                    <span className="text-purple-400 font-bold">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSimulationState("idle");
                      router.push("/profile");
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition text-sm"
                  >
                    View Order in Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimulationState("idle");
                      router.push("/home");
                    }}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white font-semibold rounded-xl transition text-xs"
                  >
                    Back to Gallery
                  </button>
                </div>
              </div>
            )}

            {/* CANCELLED FAILURE STATE */}
            {simulationState === "cancelled" && (
              <div className="space-y-6 py-4 animate-scaleIn">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mx-auto text-red-400">
                  <AlertCircle size={44} className="animate-bounce" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-red-400 uppercase block">Cancelled</span>
                  <h3 className="text-2xl font-bold text-white">Order Cancelled</h3>
                  <p className="text-xs text-red-400/90 leading-relaxed max-w-xs mx-auto pt-1">
                    {simulationError || "The order could not be completed successfully."}
                  </p>
                </div>

                <div className="pt-4 flex flex-col gap-2.5">
                  {selectedPayment?.bank === "B.Art Wallet" && walletBalance < total && (
                    <button
                      type="button"
                      onClick={() => {
                        setSimulationState("idle");
                        setPaymentModalOpen(true);
                        setShowTopUp(true);
                      }}
                      className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition text-sm"
                    >
                      Top Up Wallet Balance
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSimulationState("idle")}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-450 hover:text-white font-semibold rounded-xl transition text-xs"
                  >
                    Modify Payment / Address
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
