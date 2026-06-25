import Link from "next/link";
import { Home, Sparkles, Bell, User } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white px-4 py-3 shadow-[0_-1px_20px_rgba(0,0,0,0.04)] sm:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <Link href="/home" className="flex flex-col items-center gap-1 text-zinc-700 hover:text-black">
          <Home size={20} />
          <span className="text-[0.65rem] uppercase tracking-[0.18em]">Home</span>
        </Link>
        <Link href="/favorites" className="flex flex-col items-center gap-1 text-zinc-700 hover:text-black">
          <Sparkles size={20} />
          <span className="text-[0.65rem] uppercase tracking-[0.18em]">Deals</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center gap-1 text-zinc-700 hover:text-black">
          <Bell size={20} />
          <span className="text-[0.65rem] uppercase tracking-[0.18em]">Notifications</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-zinc-700 hover:text-black">
          <User size={20} />
          <span className="text-[0.65rem] uppercase tracking-[0.18em]">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
