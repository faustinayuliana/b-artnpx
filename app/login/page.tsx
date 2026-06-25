"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/src/lib/validators";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";

const schema = loginSchema;
type LoginFormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      let result;
      try {
        result = await response.json();
      } catch {
        result = { error: "Terjadi kesalahan pada server (Server Error)." };
      }

      setLoading(false);

      if (!response.ok) {
        setError(result.error || "Unable to login.");
        return;
      }

      router.push("/home");
    } catch (err) {
      setLoading(false);
      setError("Gagal terhubung ke server.");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-4xl font-bold font-serif bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent inline-block"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            B.Art
          </Link>
          <p className="text-zinc-500 text-sm mt-2">Digital Art Marketplace</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-[2rem] p-8 sm:p-10 backdrop-blur-xl shadow-2xl">
          <div className="space-y-2 text-center mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-400 font-bold">Welcome Back</p>
            <h1 className="text-2xl font-bold text-white">Sign in to B.Art</h1>
            <p className="text-sm text-zinc-500">Continue your art journey</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={12} /> Email
              </label>
              <input
                type="email"
                placeholder="name@gmail.com"
                {...register("email")}
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/60 transition"
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock size={12} /> Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl py-3 pl-4 pr-11 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition text-sm disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition">
              Create account
            </Link>
            <button
              type="button"
              onClick={() => router.push("/home?guest=true")}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition text-xs"
            >
              <Sparkles size={12} /> Browse as guest
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
