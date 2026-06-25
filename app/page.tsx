"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/button";
import { useAuthStore } from "@/src/lib/stores";

export default function LandingPage() {
  const router = useRouter();
  const { user, setUser, setGuest, reset: resetAuth } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    document.title = "B.Art | Digital Art Marketplace";

    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          router.push("/home");
        } else {
          if (res.status === 401) {
            resetAuth();
            localStorage.clear();
            sessionStorage.clear();
          }
          setCheckingAuth(false);
        }
      } catch {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, setUser, resetAuth]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-zinc-400 text-sm tracking-widest font-mono">LOADING B.ART...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden flex items-center justify-center px-4">
      {/* Dynamic colorful blur backgrounds */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-10 rounded-[2.5rem] border border-white/10 bg-zinc-900/60 p-8 sm:p-12 shadow-2xl shadow-purple-950/20 backdrop-blur-2xl text-center">
        <div className="flex flex-col items-center gap-6">
          <span className="text-sm font-semibold uppercase tracking-[0.4em] bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            B.Art Marketplace
          </span>
          <h1
            className="text-5xl sm:text-6xl font-semibold leading-none tracking-tight font-serif"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Welcome to B.Art
          </h1>
          <p className="max-w-md text-zinc-400 text-base sm:text-lg leading-relaxed">
            Step into a world of digital creations and experience art like never before. Browse, collect, and support global creators.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Button
            className="w-full sm:w-44 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-purple-500/20 border-0 transition duration-300 transform hover:scale-105"
            onClick={() => {
              setGuest(true);
              router.push("/home?guest=true");
            }}
          >
            Browse as Guest
          </Button>
          <Link href="/login" className="w-full sm:w-auto">
            <Button className="w-full sm:w-44 bg-zinc-800 hover:bg-zinc-700 text-white font-medium border border-zinc-700/60 hover:border-zinc-500/50 transition duration-300 transform hover:scale-105">
              Login / Register
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
