"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteRecipeButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/saved");
      } else {
        alert("Failed to delete recipe.");
      }
    } catch (e) {
      alert("Error deleting recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={handleDelete}
      className={`w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm text-red-500 border border-slate-100 cursor-pointer hover:bg-red-50 transition-colors ${loading ? "opacity-50" : ""}`}
    >
      <Trash2 size={24} />
    </div>
  );
}
