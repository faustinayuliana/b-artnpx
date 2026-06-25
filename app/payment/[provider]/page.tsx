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
  Plus,
  Check,
  Wallet,
} from "lucide-react";
import { useAuthStore, usePreferencesStore } from "@/src/lib/stores";
import toast, { Toaster } from "react-hot-toast";

const PROVIDERS: Record<string, { name: string; bg: string; logo: string; type: string }> = {
  mandiri: { name: "Mandiri", bg: "from-blue-700 to-indigo-900", logo: "🏦", type: "BANK_TRANSFER" },
  bca: { name: "BCA", bg: "from-sky-600 to-blue-800", logo: "🏦", type: "BANK_TRANSFER" },
  bni: { name: "BNI", bg: "from-teal-600 to-emerald-800", logo: "🏦", type: "BANK_TRANSFER" },
  bri: { name: "BRI", bg: "from-blue-600 to-cyan-700", logo: "🏦", type: "BANK_TRANSFER" },
  ovo: { name: "OVO", bg: "from-purple-700 to-indigo-800", logo: "💜", type: "E_WALLET" },
  dana: { name: "Dana", bg: "from-blue-500 to-sky-600", logo: "💙", type: "E_WALLET" },
  gopay: { name: "GoPay", bg: "from-emerald-500 to-teal-600", logo: "💚", type: "E_WALLET" },
  shopeepay: { name: "ShopeePay", bg: "from-orange-500 to-red-600", logo: "🧡", type: "E_WALLET" },
  wallet: { name: "B.Art Wallet", bg: "from-fuchsia-600 to-purple-800", logo: "🎨", type: "WALLET" },
};

interface PageProps {
  params: Promise<{ provider: string }>;
}

export default function PaymentMethodProviderPage({ params }: PageProps) {
  const router = useRouter();
  const { provider } = use(params);
  const { user, setUser, isGuest, reset: resetAuth } = useAuthStore();
  const { language } = usePreferencesStore();

  const providerKey = provider.toLowerCase();
  const providerInfo = PROVIDERS[providerKey];

  // States
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form states
  const [payNumber, setPayNumber] = useState("");
  const [payIsPrimary, setPayIsPrimary] = useState(false);

  const forceLogout = () => {
    resetAuth();
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  };

  const fetchPaymentDetails = async () => {
    if (!providerInfo) {
      toast.error("Invalid payment provider");
      router.push("/profile/payment");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user");
      if (!res.ok) {
        if (res.status === 401) {
          forceLogout();
        }
        return;
      }
      const data = await res.json();
      setUser(data);

      const found = data.payments?.find(
        (p: any) => p.bank.toLowerCase() === providerInfo.name.toLowerCase()
      );

      if (found) {
        setPayment(found);
        setPayNumber(found.number);
        setPayIsPrimary(found.isPrimary);
      } else {
        setPayment(null);
        setPayNumber("");
        setPayIsPrimary(false);
      }
    } catch {
      toast.error(language === "id" ? "Gagal memuat detail pembayaran" : "Failed to load payment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGuest) {
      router.push("/login");
      return;
    }
    fetchPaymentDetails();
  }, [provider, isGuest]);

  const handleLinkPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payNumber) {
      toast.error(language === "id" ? "Nomor rekening atau e-wallet wajib diisi" : "Account number or e-wallet number is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user?action=payment-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: providerInfo.type,
          bank: providerInfo.name,
          number: payNumber,
          isPrimary: payIsPrimary,
        }),
      });

      if (res.ok) {
        toast.success(
          language === "id"
            ? `Berhasil menghubungkan ${providerInfo.name}`
            : `Successfully linked ${providerInfo.name}`
        );
        fetchPaymentDetails();
      } else {
        if (res.status === 401) {
          forceLogout();
          return;
        }
        const data = await res.json();
        toast.error(data.error || "Failed to link payment method");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payNumber) {
      toast.error(language === "id" ? "Nomor rekening wajib diisi" : "Account number is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user?action=payment-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: payment.id,
          type: providerInfo.type,
          bank: providerInfo.name,
          number: payNumber,
          isPrimary: payIsPrimary,
        }),
      });

      if (res.ok) {
        toast.success(
          language === "id" ? "Detail pembayaran berhasil diubah" : "Payment method updated successfully"
        );
        fetchPaymentDetails();
      } else {
        if (res.status === 401) {
          forceLogout();
          return;
        }
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
        body: JSON.stringify({ id: payment.id }),
      });

      if (res.ok) {
        toast.success(
          language === "id" ? "Metode pembayaran berhasil dihapus" : "Payment method deleted successfully"
        );
        router.push("/profile/payment");
      } else {
        if (res.status === 401) {
          forceLogout();
          return;
        }
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

  if (!providerInfo) return null;
  if (isGuest) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Toaster position="top-right" />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <Link href="/profile/payment" className="flex items-center gap-2 text-zinc-400 hover:text-white transition font-semibold text-sm">
          <ChevronLeft size={18} /> {language === "id" ? "Kembali ke Metode Pembayaran" : "Back to Payment Methods"}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
            {/* Visual Card Preview */}
            <div className="md:col-span-2 space-y-4">
              <div className={`relative overflow-hidden rounded-[2rem] p-6 border border-zinc-800/80 bg-gradient-to-br ${
                payment ? providerInfo.bg : "from-zinc-900 to-zinc-950"
              } shadow-2xl aspect-[1.586] flex flex-col justify-between`}>
                {/* Mesh background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase font-mono">
                      {providerInfo.type === "BANK_TRANSFER" ? "BANK ACCOUNT" : providerInfo.type === "WALLET" ? "B.ART WALLET" : "E-WALLET"}
                    </span>
                    <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
                      <span>{providerInfo.logo}</span> {providerInfo.name}
                    </h3>
                  </div>
                  {payment && payIsPrimary && (
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

              {payment ? (
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="w-full py-3.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 font-bold rounded-full transition text-xs flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> {language === "id" ? "Hapus Metode Pembayaran" : "Remove Payment Method"}
                </button>
              ) : (
                <div className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl text-center">
                  <p className="text-xs text-zinc-500">
                    {language === "id"
                      ? `${providerInfo.name} belum terhubung dengan akun B.Art Anda.`
                      : `${providerInfo.name} is not linked to your B.Art account yet.`}
                  </p>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="md:col-span-3 bg-zinc-900/60 border border-zinc-850 rounded-[2rem] p-8 space-y-6 shadow-xl">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white font-serif" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {payment 
                    ? (language === "id" ? "Ubah Detail" : "Edit Details") 
                    : (language === "id" ? "Hubungkan Metode" : "Link Method")}
                </h2>
                <p className="text-xs text-zinc-400">
                  {payment 
                    ? (language === "id" ? "Ubah detail rekening atau pengaturan default pembayaran." : "Modify details or change your default payment settings.")
                    : (language === "id" ? "Masukkan rincian nomor akun untuk menghubungkan metode baru." : "Enter account details to link this payment method to your account.")}
                </p>
              </div>

              <form onSubmit={payment ? handleUpdatePayment : handleLinkPayment} className="space-y-5 text-sm">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-455 uppercase tracking-wider block">
                    {providerInfo.type === "BANK_TRANSFER" 
                      ? (language === "id" ? "Nomor Rekening" : "Account Number") 
                      : (language === "id" ? "Nomor Telepon E-Wallet" : "Wallet Phone Number")}
                  </label>
                  <input
                    type="text"
                    placeholder={providerInfo.type === "BANK_TRANSFER" ? "e.g., 124000987654" : "e.g., 081234567890"}
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
                    disabled={payment?.isPrimary} // cannot unset primary if it's already primary
                    className="w-4 h-4 rounded text-purple-600 bg-zinc-850 border-zinc-800 focus:ring-purple-500 disabled:opacity-50"
                  />
                  <label 
                    htmlFor="primary" 
                    className={`text-xs font-semibold text-zinc-350 select-none cursor-pointer ${payment?.isPrimary ? "cursor-not-allowed opacity-55" : ""}`}
                  >
                    {language === "id" ? "Jadikan Metode Pembayaran Utama" : "Set as Primary Payment Method"}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-white hover:bg-zinc-100 text-zinc-955 font-bold rounded-full transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                  ) : (
                    <>
                      {payment ? <Save size={14} /> : <Plus size={14} />}
                      {payment 
                        ? (language === "id" ? "Simpan Perubahan" : "Save Changes") 
                        : (language === "id" ? "Hubungkan Sekarang" : "Link Now")}
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
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-855 rounded-[2rem] p-8 shadow-2xl relative animate-scaleIn" onClick={(e) => e.stopPropagation()}>
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
                <h3 className="text-xl font-bold font-serif text-white" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {language === "id" ? "Hapus Metode Pembayaran" : "Remove Payment Method"}
                </h3>
                <p className="text-xs text-zinc-400 px-4">
                  {language === "id"
                    ? `Apakah Anda yakin ingin menghapus metode ${providerInfo.name}? Tindakan ini tidak dapat dibatalkan.`
                    : `Are you sure you want to delete this ${providerInfo.name} method? This action cannot be undone.`}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-350 font-bold rounded-full transition text-xs"
              >
                {language === "id" ? "Batal" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDeletePayment}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-555 text-white font-bold rounded-full transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                {deleting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  language === "id" ? "Hapus" : "Remove"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
