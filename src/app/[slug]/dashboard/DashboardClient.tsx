"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ContentItem } from "@/lib/sanity";
import { Copy, ExternalLink, MessageSquareWarning, Check, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import RevisionModal from "./RevisionModal";
import { toggleAssetPosted } from "@/app/actions/clientContent";
import Link from "next/link";

interface DashboardClientProps {
  content: ContentItem[];
  clientId: string;
  clientName: string;
  clientSlug: string;
  plan: string;
  postersIncluded: number;
  videosIncluded: number;
  revisionsIncluded: number;
  revisionsUsed: number;
  isAdmin?: boolean;
  logoutAction: () => Promise<void>;
}

export default function DashboardClient({
  content: initialContent,
  clientId,
  clientName,
  clientSlug,
  plan,
  postersIncluded,
  videosIncluded,
  revisionsIncluded,
  revisionsUsed,
  isAdmin,
  logoutAction,
}: DashboardClientProps) {
  const [content, setContent] = useState<ContentItem[]>(initialContent);
  const months = Array.from(new Set(content.map((c) => c.month))).sort().reverse();
  const [selectedMonth, setSelectedMonth] = useState(months[0] || "");
  const [isClient, setIsClient] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [revisionItem, setRevisionItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const monthContent = content.filter((c) => c.month === selectedMonth);

  // Calculate delivered so far this month
  const postersDelivered = monthContent.filter((c) => c.assetType === "poster").length;
  const videosDelivered = monthContent.filter((c) => c.assetType === "reel").length;

  // Group by date
  const groupedByDate = monthContent.reduce((acc, curr) => {
    if (!acc[curr.date]) acc[curr.date] = [];
    acc[curr.date].push(curr);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  const dates = Object.keys(groupedByDate).sort().reverse();

  const handleCopyCaption = async (text: string, e: React.MouseEvent<HTMLButtonElement>) => {
    await navigator.clipboard.writeText(text);
    const btn = e.currentTarget;
    const originalText = btn.innerText;
    btn.innerText = "COPIED";
    btn.classList.add("text-brand-green-light");
    setTimeout(() => {
      btn.innerText = originalText;
      btn.classList.remove("text-brand-green-light");
    }, 2000);
  };

  const handleCopyPortalLink = async () => {
    if (typeof window !== "undefined") {
      const portalUrl = `${window.location.origin}/${clientSlug}`;
      await navigator.clipboard.writeText(portalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleTogglePosted = async (itemId: string, currentStatus: boolean | undefined) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setContent((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, isPosted: nextStatus } : item
      )
    );
    await toggleAssetPosted(itemId, Boolean(currentStatus), clientSlug);
  };

  // Helper to check if item is recent (added within last 48 hours)
  const isRecentItem = (item: ContentItem) => {
    const timestamp = item._createdAt ? new Date(item._createdAt).getTime() : new Date(item.date).getTime();
    const diffHours = (Date.now() - timestamp) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 48;
  };

  return (
    <div>
      {/* Admin Mode Top Banner */}
      {isAdmin && (
        <div className="bg-brand-green/95 border-b border-brand-green-light px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-white flex flex-wrap items-center justify-between gap-2 sticky top-0 z-50 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-green-light animate-pulse" />
            <span className="text-zinc-200">Admin Master Access • Previewing {clientName}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/content"
              className="text-zinc-300 hover:text-white underline underline-offset-4 transition-colors"
            >
              Edit Content
            </Link>
            <Link
              href="/admin/clients"
              className="bg-black px-3 py-1 border border-zinc-800 hover:border-zinc-600 text-white transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      )}

      {/* Header with delivered-so-far stats and portal link copy */}
      <header className="border-b border-zinc-900 bg-black sticky top-0 z-40 p-4 md:px-8 md:py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-display uppercase tracking-wider">{clientName}</h1>
            
            <div className="mt-3 flex flex-wrap items-center gap-3 font-sans text-xs md:text-sm text-zinc-400">
              <span className="bg-brand-green text-white px-2.5 py-1 uppercase tracking-widest text-xs border border-brand-green-light font-medium">
                {plan} Plan
              </span>

              <button
                onClick={handleCopyPortalLink}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase tracking-wider border transition-colors ${
                  copiedLink
                    ? "border-brand-green-light text-brand-green-light bg-brand-green/30"
                    : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 bg-zinc-900"
                }`}
                title="Copy portal login link"
              >
                {copiedLink ? <Check className="w-3 h-3 text-brand-green-light" /> : <LinkIcon className="w-3 h-3" />}
                {copiedLink ? "COPIED" : "Copy Portal Link"}
              </button>

              <span className="text-zinc-700 hidden sm:inline">•</span>

              <span className="text-zinc-300">
                <strong className="text-white">{postersDelivered}</strong> of {postersIncluded} posters delivered
              </span>

              <span className="text-zinc-700 hidden sm:inline">•</span>

              <span className="text-zinc-300">
                <strong className="text-white">{videosDelivered}</strong> of {videosIncluded} videos delivered
              </span>

              <span className="text-zinc-700 hidden sm:inline">•</span>

              <span className={revisionsUsed > revisionsIncluded ? "text-brand-red font-medium" : "text-zinc-300"}>
                {revisionsUsed} / {revisionsIncluded} Revisions Used
              </span>
            </div>

            {revisionsUsed > revisionsIncluded && (
              <p className="text-xs text-brand-red font-sans mt-1">Outside of included revisions</p>
            )}
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              [ Logout ]
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-4 md:px-8 mt-8">
        {/* Month Selector */}
        {months.length > 0 && (
          <div className="mb-12 flex items-center justify-between">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-xl md:text-2xl font-display uppercase tracking-widest text-zinc-400 hover:text-white focus:ring-0 cursor-pointer p-0"
            >
              {months.map((m) => (
                <option key={m} value={m} className="bg-zinc-900 text-sm font-sans">
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

        {!months.length && (
          <div className="py-24 text-center border border-zinc-900 bg-zinc-950">
            <p className="font-display text-3xl uppercase text-zinc-600">No deliveries yet.</p>
            <p className="font-sans text-zinc-500 mt-2">Check back soon.</p>
          </div>
        )}

        {/* Deliverables Grid */}
        <div className={`space-y-16 transition-opacity duration-700 ${isClient ? "opacity-100" : "opacity-0"}`}>
          {dates.map((date, dayIndex) => (
            <div key={date} className="relative pl-4 md:pl-8 border-l border-zinc-800">
              <div className="absolute w-2 h-2 bg-brand-red -left-[4px] top-2" />

              <h2 className="text-2xl font-display uppercase tracking-widest text-zinc-300 mb-8 flex items-center gap-4">
                {format(parseISO(date), "MMMM do, yyyy")}
                <span className="text-xs font-mono text-zinc-600 bg-zinc-900 px-2 py-1">[ 0{dayIndex + 1} ]</span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {groupedByDate[date].map((item) => {
                  const hasOpenRevision = item.activeRevision?.status === "open";
                  const hasResolvedRevision = item.activeRevision?.status === "resolved";
                  const isNew = isRecentItem(item);
                  const previewImage = item.thumbnail?.asset?.url || item.thumbnailLink;

                  return (
                    <div
                      key={item._id}
                      className={`border transition-all flex flex-col ${
                        item.isPosted
                          ? "bg-zinc-950/70 border-zinc-900 opacity-80"
                          : "bg-zinc-900/50 border-zinc-800"
                      }`}
                    >
                      {/* Media Preview Area */}
                      <div className="aspect-[4/5] md:aspect-video w-full bg-zinc-950 relative border-b border-zinc-800 flex items-center justify-center overflow-hidden">
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt="Thumbnail"
                            className="object-cover w-full h-full opacity-80"
                          />
                        ) : (
                          <div className="text-zinc-700 font-mono text-sm uppercase tracking-widest">
                            No Preview
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          {isNew && (
                            <span className="bg-brand-red text-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest font-bold">
                              NEW
                            </span>
                          )}
                          {hasOpenRevision && (
                            <span className="bg-amber-950/90 border border-amber-600/70 text-amber-300 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest">
                              Revision Requested
                            </span>
                          )}
                          {hasResolvedRevision && (
                            <span className="bg-brand-green/90 border border-brand-green-light text-brand-green-light px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Resolved
                            </span>
                          )}
                        </div>

                        <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 font-mono text-xs uppercase tracking-widest border border-zinc-800 text-zinc-300">
                          {item.assetType}
                        </div>
                      </div>

                      {/* Details Area */}
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                          <a
                            href={item.driveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm font-sans uppercase tracking-widest text-white hover:text-brand-green-light transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" /> View in Drive
                          </a>

                          {hasOpenRevision ? (
                            <span className="text-xs font-mono uppercase tracking-widest text-amber-400/80 bg-amber-950/40 border border-amber-900/60 px-2.5 py-1">
                              Revision in Progress
                            </span>
                          ) : (
                            <button
                              onClick={() => setRevisionItem(item)}
                              className="flex items-center gap-2 text-sm font-sans uppercase tracking-widest text-brand-red hover:text-red-400 transition-colors"
                            >
                              <MessageSquareWarning className="w-4 h-4" /> Ask for revision
                            </button>
                          )}
                        </div>

                        {/* Caption Area */}
                        <div className="flex-grow flex flex-col mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-mono uppercase text-zinc-500">Caption</span>
                            <button
                              onClick={(e) => handleCopyCaption(item.caption, e)}
                              className="text-xs font-mono uppercase text-brand-green hover:text-brand-green-light transition-colors flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <div className="bg-black p-4 border border-zinc-800 font-sans text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap flex-grow">
                            {item.caption || "No caption provided."}
                          </div>
                        </div>

                        {/* Checklist: Mark as posted */}
                        <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                          <label className="flex items-center gap-3 cursor-pointer select-none group">
                            <input
                              type="checkbox"
                              checked={Boolean(item.isPosted)}
                              onChange={() => handleTogglePosted(item._id, item.isPosted)}
                              className="w-4 h-4 accent-brand-green-light cursor-pointer rounded-none border border-zinc-700 bg-zinc-900"
                            />
                            <span
                              className={`text-xs font-mono uppercase tracking-widest transition-colors ${
                                item.isPosted ? "text-brand-green-light line-through" : "text-zinc-400 group-hover:text-zinc-200"
                              }`}
                            >
                              {item.isPosted ? "Posted to Socials" : "Mark as posted"}
                            </span>
                          </label>

                          {item.isPosted && (
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {revisionItem && (
        <RevisionModal
          item={revisionItem}
          clientId={clientId}
          clientName={clientName}
          onClose={() => setRevisionItem(null)}
        />
      )}
    </div>
  );
}
