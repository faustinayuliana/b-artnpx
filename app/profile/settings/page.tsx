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
import { useAuthStore } from "@/src/lib/stores";
import toast, { Toaster } from "react-hot-toast";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, setUser, reset: resetAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "payments" | "security" | "danger">("profile");

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
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Address CRUD Handlers
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrAddress || !addrCity || !addrProvince || !addrPostalCode) {
      toast.error("All fields are required");
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
        toast.success(editingAddressId ? "Address updated" : "Address added");
        setAddressFormOpen(false);
        resetAddressForm();
        fetchProfile();
      } else {
        toast.error(data.error || "Failed to save address");
      }
    } catch {
      toast.error("Something went wrong");
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
        toast.success("Primary address updated");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update primary address");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch("/api/user?action=address-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("Address deleted");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete address");
      }
    } catch {
      toast.error("Something went wrong");
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
      toast.error("Account/Wallet number is required");
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
        toast.success("Payment method added");
        setPaymentFormOpen(false);
        setPayNumber("");
        setPayIsPrimary(false);
        fetchProfile();
      } else {
        toast.error(data.error || "Failed to add payment method");
      }
    } catch {
      toast.error("Something went wrong");
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
        toast.success("Primary payment method updated");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update primary payment");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return;
    try {
      const res = await fetch("/api/user?action=payment-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("Payment method deleted");
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete payment method");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  // Wallet Top Up Handler
  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(topUpAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
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
        toast.success(`Successfully topped up Rp${parsedAmount.toLocaleString()}`);
        setTopUpAmount("");
      } else {
        toast.error(data.error || "Failed to top up");
      }
    } catch {
      toast.error("Something went wrong during top up");
    } finally {
      setToppingUp(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
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
        toast.success("Password changed successfully!");
        setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure? This action CANNOT be undone. All your data will be permanently deleted.")) {
      return;
    }
    try {
      const res = await fetch("/api/user?action=delete-account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (res.ok) {
        toast.success("Account deleted");
        resetAuth();
        router.push("/");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete account");
      }
    } catch {
      toast.error("Something went wrong");
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
          <h1 className="text-lg font-bold text-white">Account Settings</h1>
          <p className="text-xs text-zinc-500">Manage your profile, addresses, payments, and security</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-4 sm:px-8 py-10">
        {/* TAB NAV */}
        <div className="flex gap-1 border-b border-zinc-900 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
          {[
            { key: "profile" as const, label: "Profile", icon: User },
            { key: "addresses" as const, label: "Addresses", icon: MapPin },
            { key: "payments" as const, label: "Payments & Wallet", icon: CreditCard },
            { key: "security" as const, label: "Security", icon: Shield },
            { key: "danger" as const, label: "Danger Zone", icon: AlertTriangle },
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
                  <Camera size={14} /> Avatar URL
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500/60 transition text-white placeholder:text-zinc-600"
                />
                <p className="text-[11px] text-zinc-600">Use a direct image URL (JPG, PNG, WebP). Square photos work best.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { label: "Username", icon: User, value: username, setter: setUsername, placeholder: "your_username" },
                { label: "Email", icon: Mail, value: email, setter: setEmail, placeholder: "name@gmail.com" },
                { label: "Phone", icon: Phone, value: phone, setter: setPhone, placeholder: "+62 812 3456 7890" },
                { label: "Birth Date", icon: Calendar, value: birthDate, setter: setBirthDate, type: "date", placeholder: "" },
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
                  <Globe size={13} /> Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-purple-500/60 transition text-white"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself..."
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
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        )}

        {/* ADDRESSES TAB */}
        {activeTab === "addresses" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-lg">Saved Addresses</h3>
                <p className="text-xs text-zinc-500">Manage up to 10 delivery addresses</p>
              </div>
              {addresses.length < 10 && !addressFormOpen && (
                <button
                  type="button"
                  onClick={() => { resetAddressForm(); setAddressFormOpen(true); }}
                  className="inline-flex items-center gap-1.5 py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition"
                >
                  <Plus size={14} /> Add New
                </button>
              )}
            </div>

            {/* Address Form */}
            {addressFormOpen && (
              <form onSubmit={handleSaveAddress} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h4 className="font-bold text-white text-sm">{editingAddressId ? "Edit Address" : "Add New Address"}</h4>
                  <button type="button" onClick={() => setAddressFormOpen(false)} className="text-zinc-500 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-450 uppercase tracking-wider">Recipient Name</label>
                    <input
                      type="text"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-zinc-955 border border-zinc-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-455 uppercase tracking-wider">Phone Number</label>
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
                  <label className="text-xs font-semibold text-zinc-456 uppercase tracking-wider">Street Address</label>
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
                    <label className="text-xs font-semibold text-zinc-457 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      placeholder="Jakarta Selatan"
                      className="w-full bg-zinc-955 border border-zinc-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-458 uppercase tracking-wider">Province</label>
                    <input
                      type="text"
                      value={addrProvince}
                      onChange={(e) => setAddrProvince(e.target.value)}
                      placeholder="DKI Jakarta"
                      className="w-full bg-zinc-955 border border-zinc-800 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-purple-500 transition text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-459 uppercase tracking-wider">Postal Code</label>
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
                  <span className="text-xs text-zinc-400">Set as primary shipping address</span>
                </label>

                <div className="flex gap-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setAddressFormOpen(false)}
                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition"
                  >
                    {saving ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            {addresses.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/10 border border-zinc-850 rounded-2xl space-y-3">
                <MapPin size={36} className="mx-auto text-zinc-700" />
                <h4 className="font-semibold text-white">No Addresses Saved</h4>
                <p className="text-xs text-zinc-500 mt-1">Please add a shipping address to enable smooth checkout.</p>
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
                        <Star size={11} className="fill-purple-400" /> Primary
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
                          <Star size={12} /> Set Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditAddress(addr)}
                        className="text-zinc-400 hover:text-white transition"
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-zinc-500 hover:text-red-400 transition ml-auto flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Delete
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
                  <Wallet size={13} /> B.Art Wallet Balance
                </span>
                <h3 className="text-3xl font-bold text-white font-mono">
                  Rp{(user?.wallet || 0).toLocaleString()}
                </h3>
                <p className="text-[10px] text-purple-300/60">Top up instantly to make simulated purchases.</p>
              </div>

              <form onSubmit={handleTopUp} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Rp Top Up Amount"
                  className="bg-zinc-950 border border-purple-500/30 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 w-full sm:w-36 placeholder:text-zinc-700"
                />
                <button
                  type="submit"
                  disabled={toppingUp}
                  className="bg-white hover:bg-zinc-150 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs transition shrink-0"
                >
                  {toppingUp ? "Processing..." : "Top Up"}
                </button>
              </form>
            </div>

            {/* Payment Methods Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-lg">Saved Payment Methods</h3>
                  <p className="text-xs text-zinc-500">Manage your active banks and e-wallets</p>
                </div>
                {!paymentFormOpen && (
                  <button
                    type="button"
                    onClick={() => setPaymentFormOpen(true)}
                    className="inline-flex items-center gap-1.5 py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition"
                  >
                    <Plus size={14} /> Add Payment
                  </button>
                )}
              </div>

              {/* Add Payment Form */}
              {paymentFormOpen && (
                <form onSubmit={handleAddPayment} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <h4 className="font-bold text-white text-sm">Add Payment Method</h4>
                    <button type="button" onClick={() => setPaymentFormOpen(false)} className="text-zinc-500 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-450 uppercase tracking-wider">Bank / Provider</label>
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
                      <label className="text-xs font-semibold text-zinc-455 uppercase tracking-wider">Account / Wallet Number</label>
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
                    <span className="text-xs text-zinc-400">Set as primary payment method</span>
                  </label>

                  <div className="flex gap-2 pt-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setPaymentFormOpen(false)}
                      className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition"
                    >
                      {saving ? "Saving..." : "Add Method"}
                    </button>
                  </div>
                </form>
              )}

              {/* Payment Methods List */}
              {payments.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/10 border border-zinc-850 rounded-2xl space-y-3">
                  <CreditCard size={36} className="mx-auto text-zinc-700" />
                  <h4 className="font-semibold text-white">No Payment Methods</h4>
                  <p className="text-xs text-zinc-500 mt-1">Please add a payment method to streamline order simulation.</p>
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
                            Primary
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase block mb-1">
                          {pay.type === "E_WALLET" ? "E-Wallet" : "Bank Transfer"}
                        </span>
                        <h4 className="font-bold text-white text-base">{pay.bank}</h4>
                        <p className="text-sm text-zinc-400 font-mono mt-2 tracking-wider">{pay.number}</p>
                      </div>

                      <div className="flex gap-4 border-t border-zinc-850/30 pt-4 mt-6 text-xs">
                        {!pay.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryPayment(pay.id)}
                            className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePayment(pay.id)}
                          className="text-zinc-500 hover:text-red-400 transition ml-auto flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-6 bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield size={18} className="text-purple-400" /> Change Password
              </h3>
              {[
                { label: "Current Password", value: oldPassword, setter: setOldPassword },
                { label: "New Password", value: newPassword, setter: setNewPassword },
                { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword },
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
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        )}

        {/* DANGER ZONE TAB */}
        {activeTab === "danger" && (
          <div className="p-6 bg-red-950/10 rounded-2xl border border-red-900/40 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-950/40 rounded-xl">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Delete Account</h3>
                <p className="text-sm text-zinc-500">Permanently delete your account and all associated data</p>
              </div>
            </div>
            <ul className="list-disc list-inside text-xs text-zinc-500 space-y-1 pl-2">
              <li>Your profile, artworks, and purchase history will be deleted</li>
              <li>Your wallet balance will be lost</li>
              <li>This action cannot be undone</li>
            </ul>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="w-full py-3.5 bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 text-red-400 hover:text-red-300 font-bold rounded-2xl transition flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Delete My Account Permanently
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
