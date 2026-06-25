"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  CreditCard,
  Trash2,
  Star,
  Save,
  AlertTriangle,
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PaymentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { isGuest } = useAuthStore();

  // Data states
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form states
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0]);
  const [payNumber, setPayNumber] = useState("");
  const [payIsPrimary, setPayIsPrimary] = useState(false);

  useEffect(() => {
    if (isGuest) {
      router.push("/login");
      return;
    }
    fetchPaymentDetails();
  }, [id, isGuest]);

  const fetchPaymentDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        const found = data.payments?.find((p: any) => p.id === id);
        if (found) {
          setPayment(found);
          const prov = PROVIDERS.find((p) => p.name.toLowerCase() === found.bank.toLowerCase()) || PROVIDERS[0];
          setSelectedProvider(prov);
          setPayNumber(found.number);
          setPayIsPrimary(found.isPrimary);
        } else {
          toast.error("Payment method not found");
          router.push("/profile/payment");
        }
      }
    } catch {
      toast.error("Failed to load payment details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payNumber) {
      toast.error("Account or Wallet number is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user?action=payment-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          type: selectedProvider.type,
          bank: selectedProvider.name,
          number: payNumber,
          isPrimary: payIsPrimary,
        }),
      });

      if (res.ok) {
        toast.success("Payment method updated successfully");
        fetchPaymentDetails();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update payment method");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/user?action=payment-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success("Payment method deleted successfully");
        router.push("/profile/payment");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete payment method");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (isGuest) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Toaster position="top-right" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <Link href="/profile/payment" className="flex items-center gap-2 text-zinc-400 hover:text-white transition font-semibold text-sm">
          <ChevronLeft size={18} /> Back to Payment Methods
        </Link>
        <span className="text-2xl font-bold font-serif bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-playfair), serif" }}>
          B.Art
        </span>
        <div className="w-24"></div>
      </header>

      {/* BODY */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 space-y-8">
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl h-48 w-full"></div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl h-64 w-full"></div>
          </div>
        ) : !payment ? (
          <div className="text-center py-20 bg-zinc-900/20 border border-zinc-850 rounded-3xl">
            <p className="text-zinc-550">Loading details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
            {/* Visual Card Preview */}
            <div className="md:col-span-2 space-y-4">
              <div className={`relative overflow-hidden rounded-[2rem] p-6 border border-zinc-800/80 bg-gradient-to-br ${selectedProvider.bg} shadow-2xl aspect-[1.586] flex flex-col justify-between`}>
                {/* Mesh background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase font-mono">
                      {selectedProvider.type === "BANK_TRANSFER" ? "BANK ACCOUNT" : "E-WALLET"}
                    </span>
                    <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
                      <span>{selectedProvider.logo}</span> {selectedProvider.name}
                    </h3>
                  </div>
                  {payIsPrimary && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30 backdrop-blur-md">
                      <Star size={10} className="fill-white" /> PRIMARY
                    </span>
                  )}
                </div>

                <div className="space-y-1 mt-auto">
                  <p className="text-[9px] text-white/60 tracking-widest font-mono font-medium">ACCOUNT NUMBER</p>
                  <p className="text-base font-mono font-semibold tracking-wider text-white">
                    {payNumber ? payNumber.replace(/(.{4})/g, "$1 ").trim() : "•••• •••• ••••"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="w-full py-3.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 font-bold rounded-full transition text-xs flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Remove Payment Method
              </button>
            </div>

            {/* Edit Form */}
            <div className="md:col-span-3 bg-zinc-900/60 border border-zinc-850 rounded-[2rem] p-8 space-y-6 shadow-xl">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white font-serif" style={{ fontFamily: "var(--font-playfair), serif" }}>Edit Details</h2>
                <p className="text-xs text-zinc-400">Modify card details or change your default payment settings.</p>
              </div>

              <form onSubmit={handleUpdatePayment} className="space-y-5 text-sm">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Provider</label>
                  <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                    {PROVIDERS.map((prov) => (
                      <button
                        key={prov.name}
                        type="button"
                        onClick={() => {
                          setSelectedProvider(prov);
                          if (prov.type !== selectedProvider.type) {
                            setPayNumber(""); // reset number if provider type changes
                          }
                        }}
                        className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition text-center ${
                          selectedProvider.name === prov.name
                            ? "bg-purple-600/10 border-purple-500 text-white font-bold"
                            : "bg-zinc-850 border-zinc-800 text-zinc-400 hover:border-zinc-750 hover:text-zinc-200"
                        }`}
                      >
                        <span className="text-lg mb-1">{prov.logo}</span>
                        <span className="text-[9px] truncate w-full">{prov.name}</span>
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
                    className="w-full bg-zinc-850 border border-zinc-800 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-purple-500 transition"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="primary"
                    checked={payIsPrimary}
                    onChange={(e) => setPayIsPrimary(e.target.checked)}
                    disabled={payment.isPrimary} // cannot unset primary if it's already primary
                    className="w-4 h-4 rounded text-purple-600 bg-zinc-850 border-zinc-800 focus:ring-purple-500 disabled:opacity-50"
                  />
                  <label 
                    htmlFor="primary" 
                    className={`text-xs font-semibold text-zinc-350 select-none cursor-pointer ${payment.isPrimary ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    Set as Primary Payment Method
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-full transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                  ) : (
                    <>
                      <Save size={14} /> Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-850 rounded-[2rem] p-8 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="absolute right-6 top-6 p-2 text-zinc-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-red-600/10 rounded-2xl text-red-500 animate-bounce">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-serif text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>Remove Payment Method</h3>
                <p className="text-xs text-zinc-400 px-4">
                  Are you sure you want to delete this {payment?.bank} method? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold rounded-full transition text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePayment}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                {deleting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Remove"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
