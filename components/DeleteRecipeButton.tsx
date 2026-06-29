"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useDictionary } from "@/components/DictionaryProvider";

export default function DeleteRecipeButton({ id }: { id: string }) {
  const dict = useDictionary();
  const t = dict.components;
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
        alert(t.delete_error);
      }
    } catch (e) {
      alert(t.error_generic);
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
        title={t.confirm_delete_title}
        message={t.confirm_delete_msg}
        confirmLabel={t.confirm_yes}
        cancelLabel={t.confirm_no}
        variant="danger"
        onConfirm={() => { setConfirmOpen(false); handleDelete(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
