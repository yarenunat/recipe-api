"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Evet, Devam Et",
  cancelLabel = "İptal",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-4 right-4 bottom-1/3 z-[210] bg-white rounded-[2rem] shadow-2xl p-6 mx-auto max-w-sm"
          >
            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto ${variant === "danger" ? "bg-rose-100" : "bg-amber-100"}`}>
              <AlertTriangle
                size={28}
                className={variant === "danger" ? "text-rose-500" : "text-amber-500"}
              />
            </div>

            {/* Text */}
            <h3 className="text-xl font-black text-slate-800 text-center mb-2">{title}</h3>
            <p className="text-sm text-slate-500 text-center font-medium leading-relaxed mb-6">{message}</p>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={onConfirm}
                className={`w-full py-3.5 rounded-2xl font-black text-white text-sm transition-opacity hover:opacity-90 ${
                  variant === "danger" ? "bg-rose-500 shadow-lg shadow-rose-500/20" : "bg-amber-500 shadow-lg shadow-amber-500/20"
                }`}
              >
                {confirmLabel}
              </button>
              <button
                onClick={onCancel}
                className="w-full py-3.5 rounded-2xl font-bold text-slate-500 text-sm bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
