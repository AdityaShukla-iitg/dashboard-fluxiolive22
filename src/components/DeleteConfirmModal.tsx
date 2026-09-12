"use client";

import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { useEffect } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  itemName: string;
  itemType?: string;
  description?: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title = "Confirm Deletion",
  itemName,
  itemType = "item",
  description,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-zinc-950 border-2 border-brand-red/50 w-full max-w-md p-6 relative shadow-[0_0_50px_rgba(220,38,38,0.2)]"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
          aria-label="Cancel deletion"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-12 h-12 bg-brand-red/10 border border-brand-red/40 flex items-center justify-center text-brand-red mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        {/* Modal Title */}
        <h2 className="text-2xl font-display uppercase tracking-widest text-white mb-2">
          {title}
        </h2>

        {/* Warning Details */}
        <p className="text-zinc-400 font-sans text-sm mb-4 leading-relaxed">
          {description || (
            <>
              Are you sure you want to permanently delete this {itemType}? This action cannot be undone.
            </>
          )}
        </p>

        {/* Target Item Name Highlight */}
        <div className="bg-zinc-900 border border-zinc-800 p-3 mb-6 flex items-center gap-3">
          <Trash2 className="w-4 h-4 text-brand-red flex-shrink-0" />
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-200 truncate">
            {itemName}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="min-h-[44px] h-12 px-4 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="min-h-[44px] h-12 px-4 bg-brand-red hover:bg-red-700 text-white font-display uppercase tracking-widest text-base transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Permanently</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
