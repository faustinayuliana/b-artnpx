"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  CreditCard,
  Trash2,
  Star,
  Wallet,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import { useAuthStore } from "@/src/lib/stores";
import toast, { Toaster } from "react-hot-toast";

const PROVIDERS = [
  { name: "Mandiri", type: "BANK_TRANSFER", bg: "from-blue-700 to-indigo-900", logo: "🏦" },
  { name: "BCA", type: "BANK_TRANSFER", bg: "from-sky-600 to-blue-800", logo: "🏦" },
  { name: "BNI", type: "BANK_TRANSFER", bg: "from-teal-600 to-emerald-800", logo: "🏦" },
  { name: "BRI", type: "BANK_TRANSFER", bg: "from-blue-600 to-cyan-700", logo: "🏦" },
  { name: "OVO", type: "E_WALLET", bg: "from-purple-700 to-indigo-800", logo: "💜" },
  { name: "Dana", type: "E_WALLET", bg: "from-blue-500 to-sky-600", logo: "💙" },
  { name: "ShopeePay", type: "E_WALLET", bg: "from-orange-500 to-red-600", logo: "🧡" },
  { name: "GoPay", type: "E_WALLET", bg: "from-emerald-500 to-teal-600", logo: "💚" },
  { name: "B.Art Wallet", type: "WALLET", bg: "from-fuchsia-600 to-purple-800", logo: "🎨" },
];

export default function PaymentMethodsPage() {
  const router = useRouter();
  const { user, isGuest } = useAuthStore();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0]);
  const [payNumber, setPayNumber] = useState("");
  const [payIsPrimary, setPayIsPrimary] = useState(false);

  useEffect(() => {
    if (isGuest) {
      router.push("/login");
      return;
    }
    fetchPayments();
  }, [isGuest]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch {
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payNumber) {
      toast.error("Account or Wallet number is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user?action=payment-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedProvider.type,
          bank: selectedProvider.name,
          number: payNumber,
          isPrimary: payIsPrimary,
        }),
      });

      if (res.ok) {
        toast.success("Payment method added successfully");
        setFormOpen(false);
        setPayNumber("");
        setPayIsPrimary(false);
        fetchPayments();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add payment method");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent navigation
    try {
      const res = await fetch("/api/user?action=payment-set-primary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("Primary payment method updated");
        fetchPayments();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update primary payment");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const getProviderDetails = (bankName: string) => {
    return PROVIDERS.find((p) => p.name.toLowerCase() === bankName.toLowerCase()) || PROVIDERS[0];
  };

  if (isGuest) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Toaster position="top-right" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <Link href="/profile" className="flex items-center gap-2 text-zinc-400 hover:text-white transition font-semibold text-sm">
          <ChevronLeft size={18} /> Back to Profile
        </Link>
        <span className="text-2xl font-bold font-serif bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-playfair), serif" }}>
          B.Art
        </span>
        <div className="w-24"></div>
      </header>

      {/* BODY */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-serif text-white flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
              <CreditCard size={24} className="text-purple-400" /> Payment Methods
            </h1>
            <p className="text-zinc-400 text-sm">Manage your linked bank accounts, e-wallets, and B.Art Wallet for purchasing and commissions.</p>
          </div>

          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-2 text-sm text-purple-950 bg-white hover:bg-zinc-100 font-bold px-5 py-3 rounded-full transition self-start sm:self-auto shadow-lg shadow-white/5"
          >
            <Plus size={16} /> Add Payment Method
          </button>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-900 border border-zinc-800 rounded-3xl h-48 w-full"></div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl space-y-4">
            <CreditCard size={48} className="mx-auto text-zinc-700 animate-pulse" />
            <div className="space-y-1">
              <h4 className="font-bold text-white text-lg">No Payment Methods Linked</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">Link a bank account or e-wallet to purchase digital assets seamlessly and withdraw commission earnings.</p>
            </div>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-full text-xs font-bold transition"
            >
              Link Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {payments.map((payment) => {
              const prov = getProviderDetails(payment.bank);
              return (
                <div
                  key={payment.id}
                  onClick={() => router.push(`/profile/payment/${payment.id}`)}
                  className={`relative overflow-hidden rounded-[2rem] p-6 border border-zinc-800/80 bg-gradient-to-br ${prov.bg} shadow-2xl hover:scale-[1.02] transition cursor-pointer group`}
                >
                  {/* Decorative mesh */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black/20 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-xs font-bold tracking-widest text-white/70 uppercase font-mono">
                        {payment.type === "BANK_TRANSFER" ? "BANK ACCOUNT" : "E-WALLET"}
                      </span>
                      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>{prov.logo}</span> {payment.bank}
                      </h3>
                    </div>

                    <div className="flex gap-2">
                      {payment.isPrimary ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30 backdrop-blur-md">
                          <Star size={10} className="fill-white" /> PRIMARY
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleSetPrimary(e, payment.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/20 text-white/75 hover:bg-white/20 hover:text-white transition border border-white/10"
                          title="Set as Primary"
                        >
                          Make Primary
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-12 flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/60 tracking-widest font-mono font-medium">ACCOUNT NUMBER</p>
                      <p className="text-lg font-mono font-semibold tracking-wider text-white">
                        {payment.number.replace(/(.{4})/g, "$1 ").trim()}
                      </p>
                    </div>

                    <span className="p-2 bg-white/10 group-hover:bg-white/20 rounded-full transition text-white">
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ADD PAYMENT MODAL */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-850 rounded-[2rem] p-8 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="absolute right-6 top-6 p-2 text-zinc-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold font-serif text-white mb-1 flex items-center gap-2">
              <Plus size={20} className="text-purple-400" /> Link Payment Method
            </h3>
            <p className="text-xs text-zinc-400 mb-6">Choose a provider and enter your details to link a new payment method.</p>

            <form onSubmit={handleAddPayment} className="space-y-5 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Select Provider</label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {PROVIDERS.map((prov) => (
                    <button
                      key={prov.name}
                      type="button"
                      onClick={() => setSelectedProvider(prov)}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition text-center ${
                        selectedProvider.name === prov.name
                          ? "bg-purple-600/10 border-purple-500 text-white font-bold shadow-lg"
                          : "bg-zinc-850 border-zinc-800 text-zinc-400 hover:border-zinc-750 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-xl mb-1">{prov.logo}</span>
                      <span className="text-[10px] truncate w-full">{prov.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-455 uppercase tracking-wider">
                  {selectedProvider.type === "BANK_TRANSFER" ? "Account Number" : "Wallet Phone Number"}
                </label>
                <input
                  type="text"
                  placeholder={selectedProvider.type === "BANK_TRANSFER" ? "e.g., 124000987654" : "e.g., 081234567890"}
                  value={payNumber}
                  onChange={(e) => setPayNumber(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full bg-zinc-850 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="primary"
                  checked={payIsPrimary}
                  onChange={(e) => setPayIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-zinc-850 border-zinc-800 focus:ring-purple-500"
                />
                <label htmlFor="primary" className="text-xs font-semibold text-zinc-300 select-none cursor-pointer">
                  Set as Primary Payment Method
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold rounded-full transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-full transition text-xs flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                  ) : (
                    "Link Method"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
