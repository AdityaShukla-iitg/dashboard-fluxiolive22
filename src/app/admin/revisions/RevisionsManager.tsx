"use client";

import { useState } from "react";
import { toggleRevisionStatus } from "@/app/actions/adminRevisions";
import { format, parseISO } from "date-fns";
import { ExternalLink, CheckCircle, Circle, Paperclip, LayoutDashboard, HardDrive } from "lucide-react";
import Link from "next/link";

export interface RevisionItem {
  _id: string;
  message: string;
  status: "open" | "resolved";
  createdAt: string;
  client?: {
    _id: string;
    name: string;
    slug?: { current: string };
  };
  contentItem?: {
    _id: string;
    assetType?: string;
    date?: string;
    month?: string;
    caption?: string;
    driveLink?: string;
    thumbnailLink?: string;
    thumbnail?: { asset?: { url?: string } };
  };
  attachmentAsset?: {
    asset?: {
      url: string;
      originalFilename?: string;
    };
  };
}

export default function RevisionsManager({ initialRevisions }: { initialRevisions: RevisionItem[] }) {
  const [revisions, setRevisions] = useState<RevisionItem[]>(initialRevisions);

  const handleToggle = async (id: string, currentStatus: string) => {
    setRevisions(prev =>
      prev.map(r => (r._id === id ? { ...r, status: currentStatus === "open" ? "resolved" : "open" } : r))
    );
    await toggleRevisionStatus(id, currentStatus);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest">Revisions</h1>
          <p className="text-zinc-500 font-sans text-xs uppercase tracking-wider mt-1">
            Incoming revision notes with asset preview, client portal links, and Drive URLs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {revisions.map((r) => {
          const clientSlug = r.client?.slug?.current;
          const previewImage = r.contentItem?.thumbnail?.asset?.url || r.contentItem?.thumbnailLink;

          return (
            <div
              key={r._id}
              className={`p-6 border flex flex-col gap-6 transition-colors ${
                r.status === "resolved"
                  ? "bg-zinc-950/60 border-zinc-900 opacity-75"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              {/* Card Header: Client name and resolved toggle */}
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-display uppercase tracking-wider text-white">
                      {r.client?.name || "Unknown Client"}
                    </h3>
                    {clientSlug && (
                      <Link
                        href={`/${clientSlug}/dashboard`}
                        target="_blank"
                        className="text-xs font-mono uppercase text-brand-green-light hover:underline flex items-center gap-1 bg-zinc-950 px-2 py-0.5 border border-zinc-800"
                        title="View on Client Dashboard"
                      >
                        <LayoutDashboard className="w-3 h-3" />
                        /{clientSlug}
                      </Link>
                    )}
                  </div>
                  <p className="text-xs font-mono text-zinc-500 mt-1">
                    Requested on {format(parseISO(r.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>

                <button
                  onClick={() => handleToggle(r._id, r.status)}
                  className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-3 py-1.5 border transition-colors ${
                    r.status === "resolved"
                      ? "border-brand-green text-brand-green-light bg-brand-green/20"
                      : "border-zinc-700 text-zinc-300 hover:text-white hover:border-white bg-zinc-950"
                  }`}
                >
                  {r.status === "resolved" ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> Resolved
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5" /> Mark Resolved
                    </>
                  )}
                </button>
              </div>

              {/* Target Asset Information Box */}
              {r.contentItem ? (
                <div className="bg-zinc-950 border border-zinc-800/90 p-4 flex flex-col md:flex-row gap-5">
                  {/* Thumbnail / Image Preview */}
                  <div className="w-full md:w-44 h-28 bg-black border border-zinc-900 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Target Asset"
                        className="w-full h-full object-cover opacity-85"
                      />
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                        No Preview
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1 bg-black/90 px-1.5 py-0.5 text-[9px] font-mono uppercase border border-zinc-800 text-zinc-300">
                      {r.contentItem.assetType || "Asset"}
                    </span>
                  </div>

                  {/* Asset Details & Quick Links */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400 mb-2">
                        <span className="text-white font-bold uppercase">
                          {r.contentItem.assetType || "Asset"}
                        </span>
                        {r.contentItem.date && (
                          <span>• Delivery: {format(parseISO(r.contentItem.date), "MMM d, yyyy")}</span>
                        )}
                        {r.contentItem.month && <span>• Month: {r.contentItem.month}</span>}
                      </div>

                      {r.contentItem.caption && (
                        <p className="text-xs font-sans text-zinc-400 line-clamp-2 italic mb-3">
                          &ldquo;{r.contentItem.caption}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Direct Links to Drive and Client View */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-900">
                      {r.contentItem.driveLink && (
                        <a
                          href={r.contentItem.driveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white hover:text-brand-green-light bg-zinc-900 px-3 py-1.5 border border-zinc-800 transition-colors"
                        >
                          <HardDrive className="w-3.5 h-3.5" />
                          View in Google Drive
                        </a>
                      )}

                      {clientSlug && (
                        <Link
                          href={`/${clientSlug}/dashboard`}
                          target="_blank"
                          className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white bg-zinc-900 px-3 py-1.5 border border-zinc-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View on Client Page
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950 border border-zinc-900 p-3 text-xs font-mono text-zinc-500 uppercase">
                  General Client Request (No specific asset linked)
                </div>
              )}

              {/* Client Revision Message */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                  Client Revision Notes
                </span>
                <div className="bg-black p-4 text-sm font-sans text-zinc-200 border border-zinc-800 leading-relaxed whitespace-pre-wrap">
                  {r.message}
                </div>
              </div>

              {/* Client Attachment Link (if uploaded) */}
              {r.attachmentAsset?.asset?.url && (
                <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between">
                  <a
                    href={r.attachmentAsset.asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand-green-light hover:underline"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    Download Client Reference Attachment
                  </a>
                </div>
              )}
            </div>
          );
        })}

        {revisions.length === 0 && (
          <div className="p-16 text-center border border-zinc-800 bg-zinc-900/50">
            <p className="text-zinc-500 font-sans text-sm">No revision requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
