"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function DeleteRecipeButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/saved");
      } else {
        alert("Tarif silinemedi.");
      }
    } catch (e) {
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setConfirmOpen(true)}
        className={`w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm text-red-500 border border-slate-100 cursor-pointer hover:bg-red-50 transition-colors ${loading ? "opacity-50" : ""}`}
      >
        <Trash2 size={24} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Tarifi Sil"
        message="Bu tarifi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        confirmLabel="Evet, Sil"
        cancelLabel="Vazgeç"
        variant="danger"
        onConfirm={() => { setConfirmOpen(false); handleDelete(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
