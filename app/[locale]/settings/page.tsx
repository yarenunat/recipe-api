"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, Camera, ChevronLeft, Save, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useDictionary } from "@/components/DictionaryProvider";

const AVATAR_COLORS = ["FFB5A7", "93C5FD", "86EFAC", "FCD34D", "D8B4FE", "FDA4AF"];

export default function SettingsPage() {
  return (
    <SessionProvider>
      <SettingsContent />
    </SessionProvider>
  );
}

function SettingsContent() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const dict = useDictionary();
  const t = dict.settings;

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Profile State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      
      // Try to extract color from current avatar URL if it matches our pattern
      const match = session.user.image?.match(/background=([A-F0-9]{6})/i);
      if (match) {
        setSelectedColor(match[1].toUpperCase());
      }
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Use generated avatar from color + name
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=${selectedColor}&color=fff&size=200`;

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, avatar: avatarUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Force session refresh
      await update({
        name: data.user.name,
        email: data.user.email,
        image: data.user.image,
      });

      setSuccess(t.profile_updated);
    } catch (err: any) {
      setError(err.message || t.error_generic);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t.passwords_mismatch);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(t.password_updated);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || t.error_generic);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans text-slate-700">
      <header className="pt-14 pb-8 px-6 bg-white rounded-b-[3rem] shadow-sm border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shadow-sm hover:bg-slate-100 transition-colors text-slate-700 border border-slate-100">
                <ChevronLeft size={24} />
              </div>
            </Link>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              {t.title}
            </h1>
          </div>
          <p className="text-slate-500 font-medium pl-16">{t.subtitle}</p>
        </div>
      </header>

      <main className="px-6 mt-8 max-w-xl mx-auto">
        {/* Tabs */}
        <div className="flex bg-slate-200/50 p-1 rounded-2xl mb-8">
          <button
            onClick={() => { setActiveTab("profile"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === "profile" ? "bg-white text-[var(--primary)] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <User size={18} /> {t.profile_tab}
          </button>
          <button
            onClick={() => { setActiveTab("security"); setError(""); setSuccess(""); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${activeTab === "security" ? "bg-white text-[var(--primary)] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Lock size={18} /> {t.security_tab}
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl mb-6 text-sm font-medium border border-rose-100">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl mb-6 text-sm font-medium border border-emerald-100 flex items-center gap-2">
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {activeTab === "profile" ? (
            <form onSubmit={handleUpdateProfile} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
              
              {/* Avatar Selector */}
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden relative">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=${selectedColor}&color=fff&size=200`} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.avatar_color}</p>
                  <div className="flex gap-2">
                    {AVATAR_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full shadow-inner transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-slate-300' : 'hover:scale-110'}`}
                        style={{ backgroundColor: `#${color}` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t.name_label}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all font-medium"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t.email_label}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {t.save_changes}
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t.current_password}</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all font-medium"
                  required
                />
              </div>

              <div className="h-px bg-slate-100 my-2"></div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t.new_password}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all font-medium"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">{t.confirm_password}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white transition-all font-medium"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
                {t.update_password}
              </button>
            </form>
          )}
        </motion.div>
      </main>

    </div>
  );
}
