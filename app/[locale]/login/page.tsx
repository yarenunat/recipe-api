"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, ChevronLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[10%] right-[-10%] w-72 h-72 bg-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <header className="px-6 pt-12 pb-6 flex items-center relative z-10">
        <Link href="/">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-slate-600 hover:bg-slate-50 transition-colors border border-slate-100">
            <ChevronLeft size={20} />
          </button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 pb-24 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500">Sign in to access your saved recipes and health stats.</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-500 p-4 rounded-xl text-sm font-medium border border-rose-100 text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={20} className="text-slate-400" />
                </div>
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all text-slate-700 placeholder:text-slate-400" />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-slate-400" />
                </div>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all text-slate-700 placeholder:text-slate-400" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[var(--primary)]/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 mt-6">
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Sign In"}
            </button>
            
            <p className="text-center text-slate-500 text-sm mt-6">
              Don't have an account?{" "}
              <Link href="/register" className="text-[var(--primary)] font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
