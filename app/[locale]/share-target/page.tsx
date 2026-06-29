"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

function ShareTargetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const dict = useDictionary();
  const t = dict.share_target;
  const [status, setStatus] = useState(t.analyzing);

 useEffect(() => {
 const title = searchParams.get("title") || "";
 const text = searchParams.get("text") || "";
 const url = searchParams.get("url") || "";

 const fullText = `${title} ${text} ${url}`.trim();

  if (fullText) {
    setStatus(t.extracting);
    setTimeout(() => {
      setStatus(t.generating);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }, 1500);
 } else {
 router.push("/");
 }
 }, [searchParams, router]);

 return (
 <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
 <div className="w-24 h-24 bg-[var(--primary)]/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
 <Sparkles size={48} className="text-[var(--primary)] animate-bounce" />
 </div>
 <h2 className="text-2xl font-bold text-center mb-2 text-slate-900 ">Recipe AI</h2>
 <p className="text-slate-500 text-center flex items-center gap-2">
 <Loader2 size={16} className="animate-spin" />
 {status}
 </p>
 </div>
 );
}

export default function ShareTargetPage() {
 return (
 <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
 <ShareTargetContent />
 </Suspense>
 )
}
