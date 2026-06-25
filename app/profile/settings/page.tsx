"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  User,
  Camera,
  Mail,
  Phone,
  Calendar,
  Globe,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  MapPin,
  CreditCard,
  Plus,
  Star,
  Wallet,
  Check,
  X,
} from "lucide-react";
import { useAuthStore, usePreferencesStore } from "@/src/lib/stores";
import { translations } from "@/src/lib/translations";
import toast, { Toaster } from "react-hot-toast";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, setUser, reset: resetAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "payments" | "preferences" | "security" | "danger">("profile");

  // Preferences
  const { theme, language, setTheme, setLanguage } = usePreferencesStore();
  const t = translations[language] || translations.en;

  // Profile fields
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Password change
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Address list and form states
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrAddress, setAddrAddress] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrProvince, setAddrProvince] = useState("");
  const [addrPostalCode, setAddrPostalCode] = useState("");
  const [addrIsPrimary, setAddrIsPrimary] = useState(false);

  // Payment list and form states
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [payBank, setPayBank] = useState("Mandiri");
  const [payNumber, setPayNumber] = useState("");
  const [payIsPrimary, setPayIsPrimary] = useState(false);

  // Top up state
  const [topUpAmount, setTopUpAmount] = useState("");
  const [toppingUp, setToppingUp] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data);
      setUsername(data.username || "");
      setBio(data.bio || "");
      setPhone(data.phone || "");
      setAvatar(data.avatar || "");
      setEmail(data.email || "");
      setGender(data.gender || "");
      setBirthDate(data.birthDate ? data.birthDate.split("T")[0] : "");
      
      // Load relations
      setAddresses(data.addresses || []);
      setPayments(data.payments || []);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [router, setUser]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user?action=update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, bio, phone, avatar, email, gender, birthDate }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        toast.success(language === "id" ? "Profil berhasil diperbarui!" : "Profile updated successfully!");
      } else {
        toast.error(data.error || (language === "id" ? "Gagal memperbarui profil" : "Failed to update profile"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Address CRUD Handlers
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrAddress || !addrCity || !addrProvince || !addrPostalCode) {
      toast.error(language === "id" ? "Semua kolom wajib diisi" : "All fields are required");
      return;
    }
    setSaving(true);
    try {
      const action = editingAddressId ? "address-update" : "address-create";
      const payload = {
        id: editingAddressId || undefined,
        name: addrName,
        phone: addrPhone,
        address: addrAddress,
        city: addrCity,
        province: addrProvince,
        postalCode: addrPostalCode,
        isPrimary: addrIsPrimary,
      };

      const res = await fetch(`/api/user?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          editingAddressId
            ? (language === "id" ? "Alamat diperbarui" : "Address updated")
            : (language === "id" ? "Alamat ditambahkan" : "Address added")
        );
        setAddressFormOpen(false);
        resetAddressForm();
        fetchProfile();
      } else {
        toast.error(data.error || (language === "id" ? "Gagal menyimpan alamat" : "Failed to save address"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimaryAddress = async (id: string) => {
    try {
      const res = await fetch("/api/user?action=address-set-primary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success(language === "id" ? "Alamat utama diperbarui" : "Primary address updated");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || (language === "id" ? "Gagal memperbarui alamat utama" : "Failed to update primary address"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const confirmMsg = language === "id" ? "Apakah Anda yakin ingin menghapus alamat ini?" : "Are you sure you want to delete this address?";
    if (!confirm(confirmMsg)) return;
    try {
      const res = await fetch("/api/user?action=address-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success(language === "id" ? "Alamat dihapus" : "Address deleted");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || (language === "id" ? "Gagal menghapus alamat" : "Failed to delete address"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    }
  };

  const openEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrAddress(addr.address);
    setAddrCity(addr.city);
    setAddrProvince(addr.province);
    setAddrPostalCode(addr.postalCode);
    setAddrIsPrimary(addr.isPrimary);
    setAddressFormOpen(true);
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddrName("");
    setAddrPhone("");
    setAddrAddress("");
    setAddrCity("");
    setAddrProvince("");
    setAddrPostalCode("");
    setAddrIsPrimary(false);
  };

  // Payment Method CRUD Handlers
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payNumber) {
      toast.error(language === "id" ? "Nomor rekening/dompet wajib diisi" : "Account/Wallet number is required");
      return;
    }
    setSaving(true);
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

      const data = await res.json();
      if (res.ok) {
        toast.success(language === "id" ? "Metode pembayaran ditambahkan" : "Payment method added");
        setPaymentFormOpen(false);
        setPayNumber("");
        setPayIsPrimary(false);
        fetchProfile();
      } else {
        toast.error(data.error || (language === "id" ? "Gagal menambahkan metode pembayaran" : "Failed to add payment method"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimaryPayment = async (id: string) => {
    try {
      const res = await fetch("/api/user?action=payment-set-primary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success(language === "id" ? "Metode pembayaran utama diperbarui" : "Primary payment method updated");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || (language === "id" ? "Gagal memperbarui pembayaran utama" : "Failed to update primary payment"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    }
  };

  const handleDeletePayment = async (id: string) => {
    const confirmMsg = language === "id" ? "Apakah Anda yakin ingin menghapus metode pembayaran ini?" : "Are you sure you want to delete this payment method?";
    if (!confirm(confirmMsg)) return;
    try {
      const res = await fetch("/api/user?action=payment-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success(language === "id" ? "Metode pembayaran dihapus" : "Payment method deleted");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || (language === "id" ? "Gagal menghapus metode pembayaran" : "Failed to delete payment method"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    }
  };

  // Wallet Top Up Handler
  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(topUpAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error(language === "id" ? "Silakan masukkan jumlah yang valid lebih besar dari 0" : "Please enter a valid amount greater than 0");
      return;
    }
    setToppingUp(true);
    try {
      const res = await fetch("/api/user?action=top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        toast.success(language === "id" ? `Berhasil mengisi ulang Rp${parsedAmount.toLocaleString()}` : `Successfully topped up Rp${parsedAmount.toLocaleString()}`);
        setTopUpAmount("");
      } else {
        toast.error(data.error || (language === "id" ? "Gagal mengisi ulang" : "Failed to top up"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan saat mengisi ulang" : "Something went wrong during top up");
    } finally {
      setToppingUp(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(language === "id" ? "Kata sandi tidak cocok!" : "Passwords don't match!");
      return;
    }
    if (newPassword.length < 8) {
      toast.error(language === "id" ? "Kata sandi harus minimal 8 karakter" : "Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user?action=change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(language === "id" ? "Kata sandi berhasil diubah!" : "Password changed successfully!");
        setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        toast.error(data.error || (language === "id" ? "Gagal mengubah kata sandi" : "Failed to change password"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmMsg = language === "id"
      ? "Apakah Anda benar-benar yakin? Tindakan ini TIDAK dapat dibatalkan. Semua data Anda akan dihapus secara permanen."
      : "Are you absolutely sure? This action CANNOT be undone. All your data will be permanently deleted.";
    if (!confirm(confirmMsg)) {
      return;
    }
    try {
      const res = await fetch("/api/user?action=delete-account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (res.ok) {
        toast.success(language === "id" ? "Akun dihapus" : "Account deleted");
        resetAuth();
        router.push("/");
      } else {
        const data = await res.json();
        toast.error(data.error || (language === "id" ? "Gagal menghapus akun" : "Failed to delete account"));
      }
    } catch {
      toast.error(language === "id" ? "Terjadi kesalahan" : "Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <Toaster position="top-right" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center gap-4">
        <Link href="/profile" className="p-2 hover:bg-zinc-900 rounded-xl transition text-zinc-400 hover:text-white">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white">{t.profileSettings}</h1>
          <p className="text-xs text-zinc-500">
            {language === "id" 
              ? "Kelola profil, alamat, pembayaran, dan keamanan Anda" 
              : "Manage your profile, addresses, payments, and security"}
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-4 sm:px-8 py-10">
        {/* TAB NAV */}
        <div className="flex gap-1 border-b border-zinc-900 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
          {[
            { key: "profile" as const, label: t.profile, icon: User },
            { key: "addresses" as const, label: t.addresses, icon: MapPin },
            { key: "payments" as const, label: language === "id" ? "Pembayaran & Dompet" : "Payments & Wallet", icon: CreditCard },
            { key: "preferences" as const, label: t.preferences, icon: Globe },
            { key: "security" as const, label: t.security, icon: Shield },
            { key: "danger" as const, label: t.dangerZone, icon: AlertTriangle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition shrink-0 ${
                activeTab === key
                  ? key === "danger"
                    ? "border-red-500 text-red-400"
                    : "border-purple-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-zinc-900/40 rounded-2xl border border-zinc-800">
              <img
                src={avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"}
                alt="Avatar preview"
                className="w-20 h-20 rounded-[1.2rem] object-cover border border-zinc-700"
              />
              <div className="flex-1 space-y-2 w-full">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Camera size={14} /> {language === "id" ? "URL Avatar" : "Avatar URL"}
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500/60 transition text-white placeholder:text-zinc-600"
                />
                <p className="text-[11px] text-zinc-600">
                  {language === "id" 
                    ? "Gunakan URL gambar langsung (JPG, PNG, WebP). Foto persegi berfungsi paling baik." 
                    : "Use a direct image URL (JPG, PNG, WebP). Square photos work best."}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { label: "Username", icon: User, value: username, setter: setUsername, placeholder: "your_username" },
                { label: "Email", icon: Mail, value: email, setter: setEmail, placeholder: "name@gmail.com" },
                { label: language === "id" ? "Nomor Telepon" : "Phone", icon: Phone, value: phone, setter: setPhone, placeholder: "+62 812 3456 7890" },
                { label: language === "id" ? "Tanggal Lahir" : "Birth Date", icon: Calendar, value: birthDate, setter: setBirthDate, type: "date", placeholder: "" },
              ].map(({ label, icon: Icon, value, setter, placeholder, type = "text" }) => (
                <div key={label} className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon size={13} /> {label}
                  </label>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500/60 transition text-white placeholder:text-zinc-600 [color-scheme:dark]"
                  />
                </div>
              ))}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe size={13} /> {language === "id" ? "Jenis Kelamin" : "Gender"}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500/60 transition text-white"
                >
                  <option value="">{language === "id" ? "Pilih tidak menyebutkan" : "Prefer not to say"}</option>
                  <option value="male">{language === "id" ? "Laki-laki" : "Male"}</option>
                  <option value="female">{language === "id" ? "Perempuan" : "Female"}</option>
                  <option value="other">{language === "id" ? "Lainnya" : "Other"}</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={language === "id" ? "Ceritakan tentang diri Anda kepada komunitas..." : "Tell the community about yourself..."}
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500/60 transition text-white placeholder:text-zinc-600 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Save size={16} />
              {saving 
                ? (language === "id" ? "Menyimpan..." : "Saving...") 
                : (language === "id" ? "Simpan Profil" : "Save Profile")}
            </button>
          </div>
        )}

        {/* ADDRESSES TAB */}
        {activeTab === "addresses" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-lg">{language === "id" ? "Alamat Tersimpan" : "Saved Addresses"}</h3>
                <p className="text-xs text-zinc-500">{language === "id" ? "Kelola hingga 10 alamat pengiriman" : "Manage up to 10 delivery addresses"}</p>
              </div>
              {addresses.length < 10 && !addressFormOpen && (
                <button
                  type="button"
                  onClick={() => { resetAddressForm(); setAddressFormOpen(true); }}
                  className="inline-flex items-center gap-1.5 py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition"
                >
                  <Plus size={14} /> {language === "id" ? "Tambah Baru" : "Add New"}
                </button>
              )}
            </div>

            {/* Address Form */}
            {addressFormOpen && (
              <form onSubmit={handleSaveAddress} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h4 className="font-bold text-white text-sm">
                    {editingAddressId 
                      ? (language === "id" ? "Ubah Alamat" : "Edit Address") 
                      : (language === "id" ? "Tambah Alamat Baru" : "Add New Address")}
                  </h4>
                  <button type="button" onClick={() => setAddressFormOpen(false)} className="text-zinc-500 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-450 uppercase tracking-wider">{language === "id" ? "Nama Penerima" : "Recipient Name"}</label>
                    <input
                      type="text"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-zinc-955 border border-zinc-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-455 uppercase tracking-wider">{language === "id" ? "Nomor Telepon" : "Phone Number"}</label>
                    <input
                      type="text"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      placeholder="08123456789"
                      className="w-full bg-zinc-955 border border-zinc-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-456 uppercase tracking-wider">{language === "id" ? "Alamat Jalan" : "Street Address"}</label>
                  <textarea
                    value={addrAddress}
                    onChange={(e) => setAddrAddress(e.target.value)}
                    placeholder="Jl. Sudirman No. 45, RT 02/RW 03"
                    rows={2}
                    className="w-full bg-zinc-955 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-457 uppercase tracking-wider">{language === "id" ? "Kota" : "City"}</label>
                    <input
                      type="text"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      placeholder="Jakarta Selatan"
                      className="w-full bg-zinc-955 border border-zinc-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-458 uppercase tracking-wider">{language === "id" ? "Provinsi" : "Province"}</label>
                    <input
                      type="text"
                      value={addrProvince}
                      onChange={(e) => setAddrProvince(e.target.value)}
                      placeholder="DKI Jakarta"
                      className="w-full bg-zinc-955 border border-zinc-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-459 uppercase tracking-wider">{language === "id" ? "Kode Pos" : "Postal Code"}</label>
                    <input
                      type="text"
                      value={addrPostalCode}
                      onChange={(e) => setAddrPostalCode(e.target.value)}
                      placeholder="12190"
                      className="w-full bg-zinc-955 border border-zinc-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={addrIsPrimary}
                    onChange={(e) => setAddrIsPrimary(e.target.checked)}
                    className="accent-purple-600 rounded"
                  />
                  <span className="text-xs text-zinc-400">{language === "id" ? "Atur sebagai alamat pengiriman utama" : "Set as primary shipping address"}</span>
                </label>

                <div className="flex gap-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setAddressFormOpen(false)}
                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition"
                  >
                    {saving ? (language === "id" ? "Menyimpan..." : "Saving...") : (language === "id" ? "Simpan Alamat" : "Save Address")}
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            {addresses.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/10 border border-zinc-850 rounded-2xl space-y-3">
                <MapPin size={36} className="mx-auto text-zinc-700" />
                <h4 className="font-semibold text-white">{language === "id" ? "Tidak Ada Alamat Tersimpan" : "No Addresses Saved"}</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  {language === "id" 
                    ? "Silakan tambahkan alamat pengiriman untuk mempermudah checkout." 
                    : "Please add a shipping address to enable smooth checkout."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-5 rounded-2xl border transition relative ${
                      addr.isPrimary ? "bg-zinc-900 border-purple-500/60 shadow-lg" : "bg-zinc-900/40 border-zinc-800"
                    }`}
                  >
                    {addr.isPrimary && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                        <Star size={11} className="fill-purple-400" /> {t.primary}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        {addr.name} 
                        <span className="text-xs text-zinc-500 font-normal">({addr.phone})</span>
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">{addr.address}</p>
                      <p className="text-xs text-zinc-500">{addr.city}, {addr.province} {addr.postalCode}</p>
                    </div>

                    <div className="flex gap-4 border-t border-zinc-855/40 pt-4 mt-4 text-xs">
                      {!addr.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryAddress(addr.id)}
                          className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition"
                        >
                          <Star size={12} /> {language === "id" ? "Atur Utama" : "Set Primary"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditAddress(addr)}
                        className="text-zinc-400 hover:text-white transition"
                      >
                        {language === "id" ? "Ubah Detail" : "Edit Details"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-zinc-500 hover:text-red-400 transition ml-auto flex items-center gap-1"
                      >
                        <Trash2 size={12} /> {t.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === "payments" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Wallet Balance Widget */}
            <div className="p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/30 border border-purple-500/20 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-purple-350 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet size={13} /> {language === "id" ? "Saldo Dompet B.Art" : "B.Art Wallet Balance"}
                </span>
                <h3 className="text-3xl font-bold text-white font-mono">
                  Rp{(user?.wallet || 0).toLocaleString()}
                </h3>
                <p className="text-[10px] text-purple-300/60">
                  {language === "id" 
                    ? "Isi ulang secara instan untuk melakukan simulasi pembelian." 
                    : "Top up instantly to make simulated purchases."}
                </p>
              </div>

              <form onSubmit={handleTopUp} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder={language === "id" ? "Jumlah Isi Ulang" : "Top Up Amount"}
                  className="bg-zinc-955 border border-purple-500/30 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 w-full sm:w-36 placeholder:text-zinc-700"
                />
                <button
                  type="submit"
                  disabled={toppingUp}
                  className="bg-white hover:bg-zinc-150 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs transition shrink-0"
                >
                  {toppingUp ? (language === "id" ? "Memproses..." : "Processing...") : t.topUp}
                </button>
              </form>
            </div>

            {/* Payment Methods Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-lg">{language === "id" ? "Metode Pembayaran Tersimpan" : "Saved Payment Methods"}</h3>
                  <p className="text-xs text-zinc-500">{language === "id" ? "Kelola bank dan e-wallet aktif Anda" : "Manage your active banks and e-wallets"}</p>
                </div>
                {!paymentFormOpen && (
                  <button
                    type="button"
                    onClick={() => setPaymentFormOpen(true)}
                    className="inline-flex items-center gap-1.5 py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition"
                  >
                    <Plus size={14} /> {language === "id" ? "Tambah Pembayaran" : "Add Payment"}
                  </button>
                )}
              </div>

              {/* Add Payment Form */}
              {paymentFormOpen && (
                <form onSubmit={handleAddPayment} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <h4 className="font-bold text-white text-sm">{language === "id" ? "Tambah Metode Pembayaran" : "Add Payment Method"}</h4>
                    <button type="button" onClick={() => setPaymentFormOpen(false)} className="text-zinc-500 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-450 uppercase tracking-wider">{language === "id" ? "Bank / Penyedia" : "Bank / Provider"}</label>
                      <select
                        value={payBank}
                        onChange={(e) => setPayBank(e.target.value)}
                        className="w-full bg-zinc-955 border border-zinc-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white"
                      >
                        {["Mandiri", "BCA", "BNI", "BRI", "OVO", "Dana", "ShopeePay", "B.Art Wallet"].map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-455 uppercase tracking-wider">{language === "id" ? "Nomor Rekening / Dompet" : "Account / Wallet Number"}</label>
                      <input
                        type="text"
                        value={payNumber}
                        onChange={(e) => setPayNumber(e.target.value)}
                        placeholder="1234567890"
                        className="w-full bg-zinc-955 border border-zinc-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={payIsPrimary}
                      onChange={(e) => setPayIsPrimary(e.target.checked)}
                      className="accent-purple-650 rounded"
                    />
                    <span className="text-xs text-zinc-400">{language === "id" ? "Atur sebagai metode pembayaran utama" : "Set as primary payment method"}</span>
                  </label>

                  <div className="flex gap-2 pt-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setPaymentFormOpen(false)}
                      className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition"
                    >
                      {saving ? (language === "id" ? "Menyimpan..." : "Saving...") : (language === "id" ? "Tambah Metode" : "Add Method")}
                    </button>
                  </div>
                </form>
              )}

              {/* Payment Methods List */}
              {payments.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/10 border border-zinc-850 rounded-2xl space-y-3">
                  <CreditCard size={36} className="mx-auto text-zinc-700" />
                  <h4 className="font-semibold text-white">{language === "id" ? "Tidak Ada Metode Pembayaran" : "No Payment Methods"}</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {language === "id" 
                      ? "Silakan tambahkan metode pembayaran untuk merampingkan simulasi pesanan." 
                      : "Please add a payment method to streamline order simulation."}
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {payments.map((pay) => (
                    <div
                      key={pay.id}
                      className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                        pay.isPrimary ? "bg-zinc-900 border-purple-500/60 shadow-lg" : "bg-zinc-900/40 border-zinc-800"
                      }`}
                    >
                      <div>
                        {pay.isPrimary && (
                          <span className="absolute top-4 right-4 text-[9px] text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                            {t.primary}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase block mb-1">
                          {pay.type === "E_WALLET" 
                            ? (language === "id" ? "Dompet Digital" : "E-Wallet") 
                            : (language === "id" ? "Transfer Bank" : "Bank Transfer")}
                        </span>
                        <h4 className="font-bold text-white text-base">{pay.bank}</h4>
                        <p className="text-sm text-zinc-400 font-mono mt-2 tracking-wider">{pay.number}</p>
                      </div>

                      <div className="flex gap-4 border-t border-zinc-855/30 pt-4 mt-6 text-xs">
                        {!pay.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryPayment(pay.id)}
                            className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition"
                          >
                            {language === "id" ? "Atur Utama" : "Set Primary"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePayment(pay.id)}
                          className="text-zinc-500 hover:text-red-400 transition ml-auto flex items-center gap-1"
                        >
                          <Trash2 size={12} /> {language === "id" ? "Hapus" : "Remove"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === "preferences" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Theme Preference */}
            <div className="p-6 bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe size={18} className="text-purple-400" /> {language === "id" ? "Preferensi Tema" : "Theme Preference"}
              </h3>
              <p className="text-xs text-zinc-500">
                {language === "id" 
                  ? "Pilih bagaimana B.Art muncul di perangkat Anda. Disimpan secara lokal." 
                  : "Choose how B.Art appears on your device. Persisted locally."}
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: "light" as const, label: t.lightTheme, desc: language === "id" ? "Bersih dan terang" : "Clean and bright", logo: "☀️" },
                  { key: "dark" as const, label: t.darkTheme, desc: language === "id" ? "Nyaman dan premium" : "Cozy and premium", logo: "🌙" },
                  { key: "system" as const, label: t.systemTheme, desc: language === "id" ? "Sesuai perangkat" : "Matches device", logo: "🖥️" },
                ].map(({ key, label, desc, logo }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTheme(key)}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition ${
                      theme === key
                        ? "bg-purple-600/10 border-purple-500 text-white font-bold shadow-lg"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <span className="text-2xl mb-2">{logo}</span>
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-[10px] text-zinc-500 mt-1">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Preference */}
            <div className="p-6 bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe size={18} className="text-purple-400" /> {language === "id" ? "Bahasa / Language" : "Language / Bahasa"}
              </h3>
              <p className="text-xs text-zinc-500">
                {language === "id" 
                  ? "Pilih bahasa pilihan Anda. Disimpan secara lokal." 
                  : "Select your preferred language. Persisted locally."}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "en" as const, label: "English", desc: language === "id" ? "Komunikasi global" : "Global communication", flag: "🇺🇸" },
                  { key: "id" as const, label: "Bahasa Indonesia", desc: language === "id" ? "Komunikasi lokal" : "Local communication", flag: "🇮🇩" },
                ].map(({ key, label, desc, flag }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setLanguage(key);
                      toast.success(language === "id" ? `Bahasa diatur ke ${label}` : `Language set to ${label}`);
                    }}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition ${
                      language === key
                        ? "bg-purple-600/10 border-purple-500 text-white font-bold shadow-lg"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <span className="text-2xl mb-2">{flag}</span>
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-[10px] text-zinc-500 mt-1">{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield size={18} className="text-purple-400" /> {language === "id" ? "Ubah Kata Sandi" : "Change Password"}
              </h3>
              {[
                { label: language === "id" ? "Kata Sandi Saat Ini" : "Current Password", value: oldPassword, setter: setOldPassword },
                { label: language === "id" ? "Kata Sandi Baru" : "New Password", value: newPassword, setter: setNewPassword },
                { label: language === "id" ? "Konfirmasi Kata Sandi Baru" : "Confirm New Password", value: confirmPassword, setter: setConfirmPassword },
              ].map(({ label, value, setter }) => (
                <div key={label} className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-purple-500/60 transition text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving 
                  ? (language === "id" ? "Memperbarui..." : "Updating...") 
                  : (language === "id" ? "Perbarui Kata Sandi" : "Update Password")}
              </button>
            </div>
          </div>
        )}

        {/* DANGER ZONE TAB */}
        {activeTab === "danger" && (
          <div className="p-6 bg-red-955/10 rounded-2xl border border-red-900/40 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-955/40 rounded-xl">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">{language === "id" ? "Hapus Akun" : "Delete Account"}</h3>
                <p className="text-sm text-zinc-500">{language === "id" ? "Hapus akun Anda dan semua data terkait secara permanen" : "Permanently delete your account and all associated data"}</p>
              </div>
            </div>
            <ul className="list-disc list-inside text-xs text-zinc-550 space-y-1 pl-2">
              <li>{language === "id" ? "Profil, karya seni, dan riwayat pembelian Anda akan dihapus" : "Your profile, artworks, and purchase history will be deleted"}</li>
              <li>{language === "id" ? "Saldo dompet Anda akan hilang" : "Your wallet balance will be lost"}</li>
              <li>{language === "id" ? "Tindakan ini tidak dapat dibatalkan" : "This action cannot be undone"}</li>
            </ul>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="w-full py-3.5 bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 text-red-400 hover:text-red-300 font-bold rounded-2xl transition flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> {language === "id" ? "Hapus Akun Saya Secara Permanen" : "Delete My Account Permanently"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
