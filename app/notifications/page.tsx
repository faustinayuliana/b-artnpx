"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Bell, 
  Trash2, 
  CheckCheck, 
  Mail, 
  MailOpen, 
  Sparkles, 
  ShoppingBag,
  Info
} from "lucide-react";
import { useAuthStore } from "@/src/lib/stores";
import toast, { Toaster } from "react-hot-toast";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isGuest } = useAuthStore();

  // State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isGuest) {
      router.push("/login");
      return;
    }
    fetchNotifications();
  }, [isGuest]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleReadAll = async () => {
    try {
      const res = await fetch("/api/notifications?action=read-all", {
        method: "POST",
      });

      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      }
    } catch {
      toast.error("Failed to update notifications");
    }
  };

  const handleToggleRead = async (notifId: string) => {
    try {
      const res = await fetch("/api/notifications?action=toggle-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notifId }),
      });

      if (res.ok) {
        setNotifications(
          notifications.map((n) => (n.id === notifId ? { ...n, isRead: !n.isRead } : n))
        );
        toast.success("Notification updated");
      }
    } catch {
      toast.error("Failed to update notification");
    }
  };

  const handleDeleteNotif = async (notifId: string) => {
    try {
      const res = await fetch(`/api/notifications?notificationId=${notifId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotifications(notifications.filter((n) => n.id !== notifId));
        toast.success("Notification deleted");
      }
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch("/api/notifications?clearAll=true", {
        method: "DELETE",
      });

      if (res.ok) {
        setNotifications([]);
        toast.success("All notifications deleted");
      }
    } catch {
      toast.error("Failed to clear notifications");
    }
  };

  const getNotifIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("order") || t.includes("purchased") || t.includes("sold")) {
      return <ShoppingBag className="text-purple-400" size={18} />;
    }
    if (t.includes("deal") || t.includes("discount") || t.includes("offer")) {
      return <Sparkles className="text-yellow-400" size={18} />;
    }
    return <Info className="text-blue-400" size={18} />;
  };

  if (isGuest) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Toaster position="top-right" />

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

      {/* BODY */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-serif text-white flex items-center gap-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
              <Bell size={24} className="text-purple-400" /> Notifications
            </h1>
            <p className="text-zinc-400 text-sm">Updates on deals, discounts, recommendations, and your art trades.</p>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleReadAll}
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold bg-purple-500/10 px-4 py-2.5 rounded-full transition"
              >
                <CheckCheck size={14} /> Read All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold bg-red-500/10 px-4 py-2.5 rounded-full transition"
              >
                <Trash2 size={14} /> Clear All
              </button>
            </div>
          )}
        </div>

        {/* LIST */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-900 border border-zinc-850 rounded-2xl h-20 w-full"></div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/10 border border-zinc-850 rounded-3xl space-y-3">
            <Bell size={48} className="mx-auto text-zinc-700 animate-pulse" />
            <h4 className="font-bold text-white text-lg">No Notifications Yet</h4>
            <p className="text-xs text-zinc-500 mt-1">We'll alert you when there are news, purchases, or discount deals.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex gap-4 p-4 rounded-2xl border transition ${
                  notif.isRead 
                    ? "bg-zinc-900/30 border-zinc-850/60 text-zinc-400" 
                    : "bg-zinc-900 border-zinc-800 text-white shadow-lg"
                }`}
              >
                {/* Icon Container */}
                <div className={`p-2.5 rounded-xl shrink-0 ${notif.isRead ? "bg-zinc-800/40" : "bg-zinc-850"}`}>
                  {getNotifIcon(notif.title)}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className={`text-sm font-semibold ${notif.isRead ? "text-zinc-300" : "text-white"}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{notif.message}</p>

                  {/* Mini actions */}
                  <div className="flex items-center gap-4 pt-2.5 mt-0.5 text-xs border-t border-zinc-850/40">
                    <button
                      type="button"
                      onClick={() => handleToggleRead(notif.id)}
                      className="text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1"
                    >
                      {notif.isRead ? (
                        <>
                          <Mail size={12} /> Mark Unread
                        </>
                      ) : (
                        <>
                          <MailOpen size={12} /> Mark Read
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNotif(notif.id)}
                      className="text-zinc-500 hover:text-red-400 transition flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
