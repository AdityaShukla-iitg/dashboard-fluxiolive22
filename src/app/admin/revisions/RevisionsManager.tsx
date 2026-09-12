"use client";

import { useState } from "react";
import { toggleRevisionStatus } from "@/app/actions/adminRevisions";
import { format, parseISO } from "date-fns";
import { ExternalLink, CheckCircle, Circle } from "lucide-react";

export interface RevisionItem {
  _id: string;
  message: string;
  status: "open" | "resolved";
  createdAt: string;
  client?: { name: string };
  contentItem?: { driveLink: string };
  attachmentAsset?: { asset: { url: string } };
}

export default function RevisionsManager({ initialRevisions }: { initialRevisions: RevisionItem[] }) {
  const [revisions, setRevisions] = useState<RevisionItem[]>(initialRevisions);

  const handleToggle = async (id: string, currentStatus: string) => {
    setRevisions(prev => prev.map(r => r._id === id ? { ...r, status: currentStatus === "open" ? "resolved" : "open" } : r));
    await toggleRevisionStatus(id, currentStatus);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-display uppercase tracking-widest mb-8">Revisions</h1>

      <div className="grid grid-cols-1 gap-4">
        {revisions.map(r => (
          <div key={r._id} className={`p-6 border flex flex-col gap-4 ${r.status === 'resolved' ? 'bg-zinc-950 border-zinc-900 opacity-70' : 'bg-zinc-900 border-zinc-800'}`}>
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-display uppercase tracking-wider text-brand-red">{r.client?.name || 'Unknown Client'}</h3>
                <p className="text-xs font-mono text-zinc-500 mt-1">{format(parseISO(r.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
              </div>
              <button 
                onClick={() => handleToggle(r._id, r.status)}
                className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-3 py-1 border transition-colors ${r.status === 'resolved' ? 'border-brand-green text-brand-green' : 'border-zinc-700 text-zinc-400 hover:text-white'}`}
              >
                {r.status === 'resolved' ? <><CheckCircle className="w-3 h-3"/> Resolved</> : <><Circle className="w-3 h-3"/> Mark Resolved</>}
              </button>
            </div>

            <div className="bg-black p-4 text-sm font-sans text-zinc-300 border border-zinc-800">
              {r.message}
            </div>

            <div className="flex gap-6 mt-2">
              {r.contentItem && (
                <a href={r.contentItem.driveLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                  <ExternalLink className="w-3 h-3" /> Original Asset
                </a>
              )}
              {r.attachmentAsset && (
                <a href={r.attachmentAsset.asset.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand-green hover:text-brand-green-light transition-colors">
                  <ExternalLink className="w-3 h-3" /> Client Attachment
                </a>
              )}
            </div>

          </div>
        ))}

        {revisions.length === 0 && (
          <div className="p-12 text-center border border-zinc-800 bg-zinc-900/50">
            <p className="text-zinc-500 font-sans">No revision requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
