"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Trash2, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "delete" | "info";
  title: string;
  message: string;
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isDelete = toast.type === "delete";
  const isError = toast.type === "error";

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className={`p-4 border shadow-2xl backdrop-blur-md flex items-start gap-3 relative ${
        isError 
          ? "bg-zinc-950/95 border-brand-red text-white" 
          : isDelete 
          ? "bg-zinc-950/95 border-brand-red/80 text-white shadow-[0_0_30px_rgba(220,38,38,0.25)]"
          : "bg-zinc-950/95 border-brand-green-light/80 text-white shadow-[0_0_30px_rgba(10,46,22,0.5)]"
      }`}>
        {/* Icon */}
        <div className="mt-0.5 flex-shrink-0">
          {isDelete && <Trash2 className="w-5 h-5 text-brand-red" />}
          {isError && <AlertCircle className="w-5 h-5 text-brand-red" />}
          {!isDelete && !isError && <CheckCircle2 className="w-5 h-5 text-brand-green-light" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="font-display uppercase tracking-widest text-sm text-white">
            {toast.title}
          </h4>
          <p className="font-sans text-xs text-zinc-300 mt-1 leading-normal break-words">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white p-1 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-800 overflow-hidden">
          <div className={`h-full animate-toast-progress ${
            isError || isDelete ? "bg-brand-red" : "bg-brand-green-light"
          }`} />
        </div>
      </div>
    </div>
  );
}
