"use client";

import { useState } from "react";
import { ContentItem } from "@/lib/sanity";
import { submitRevision } from "@/app/actions/submitRevision";
import { X } from "lucide-react";

export default function RevisionModal({ 
  item, 
  clientId,
  onClose 
}: { 
  item: ContentItem; 
  clientId: string;
  onClose: () => void; 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("clientId", clientId);
    formData.append("contentItemId", item._id);
    formData.append("driveLink", item.driveLink);
    formData.append("clientName", "Client"); // Ideally passed down, but acceptable

    const res = await submitRevision(formData);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-display uppercase tracking-widest mb-6">Request Revision</h3>

        {success ? (
          <div className="py-12 text-center">
            <p className="text-brand-green-light font-display uppercase text-2xl mb-2">Submitted</p>
            <p className="text-zinc-400 font-sans text-sm">We&apos;ve received your request.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400">Message</label>
              <textarea 
                name="message" 
                required 
                rows={4}
                maxLength={1000}
                placeholder="What needs changing?"
                className="w-full bg-zinc-900 border border-zinc-800 p-4 font-sans text-sm text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-zinc-400">Reference File (Optional, max 15MB)</label>
              <input 
                type="file" 
                name="attachment" 
                accept="image/*,.pdf,video/mp4,video/quicktime"
                className="w-full bg-zinc-900 border border-zinc-800 p-3 font-sans text-xs text-zinc-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
              />
            </div>

            {error && (
              <p className="text-brand-red font-sans text-sm">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-brand-red hover:bg-red-700 text-white font-display uppercase tracking-widest text-lg disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
