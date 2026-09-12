"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ContentItem } from "@/lib/sanity";
import { Copy, MessageSquareWarning, Check, Link as LinkIcon, CheckCircle2, Download } from "lucide-react";
import RevisionModal from "./RevisionModal";
import { toggleAssetPosted } from "@/app/actions/clientContent";

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
  logoutAction,
}: DashboardClientProps) {
  const [content, setContent] = useState<ContentItem[]>(initialContent);
  const rawMonths = Array.from(
    new Set(
      content
        .map((c) => c.month)
        .filter((m): m is string => Boolean(m && typeof m === "string"))
    )
  ).sort().reverse();
  const months = ["All Time", ...rawMonths];
  const [selectedMonth, setSelectedMonth] = useState(months[0] || "");
  const [isClient, setIsClient] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [revisionItem, setRevisionItem] = useState<ContentItem | null>(null);
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});
  const [playingReels, setPlayingReels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  const monthContent = selectedMonth === "All Time" ? content : content.filter((c) => c.month === selectedMonth);

  // Calculate delivered so far this month
  const postersDelivered = monthContent.filter((c) => c.assetType === "poster").length;
  const videosDelivered = monthContent.filter((c) => c.assetType === "reel").length;

  // Group by date
  const groupedByDate = monthContent.reduce((acc, curr) => {
    const rawDate = curr.date || "undated";
    if (!acc[rawDate]) acc[rawDate] = [];
    acc[rawDate].push(curr);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  const dates = Object.keys(groupedByDate).sort().reverse();

  const formatDeliverableDate = (dateStr: string) => {
    try {
      if (!dateStr || dateStr === "undated") return "Deliverables";
      const parsed = parseISO(dateStr);
      if (isNaN(parsed.getTime())) return dateStr;
      return format(parsed, "MMMM do, yyyy");
    } catch {
      return dateStr || "Deliverables";
    }
  };

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
    try {
      const rawDate = item._createdAt || item.date;
      if (!rawDate) return false;
      const timestamp = new Date(rawDate).getTime();
      if (isNaN(timestamp)) return false;
      const diffHours = (Date.now() - timestamp) / (1000 * 60 * 60);
      return diffHours >= 0 && diffHours <= 48;
    } catch {
      return false;
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Responsive Header for Mobile and Desktop */}
      <header className="border-b border-zinc-900 bg-black sticky top-0 z-40 p-4 md:px-8 md:py-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Smartphone Header View (< md) */}
          <div className="md:hidden space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-wider truncate">
                {clientName}
              </h1>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white border border-zinc-800 bg-zinc-900 transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-brand-green text-white px-2.5 py-1.5 uppercase tracking-widest text-xs border border-brand-green-light font-medium">
                {plan} Plan
              </span>

              <button
                onClick={handleCopyPortalLink}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors min-h-[36px] ${
                  copiedLink
                    ? "border-brand-green-light text-brand-green-light bg-brand-green/30"
                    : "border-zinc-800 text-zinc-300 hover:text-white bg-zinc-900"
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-brand-green-light" /> : <LinkIcon className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Link Copied" : "Copy Link"}</span>
              </button>
            </div>

            {/* Mobile Metric Badges Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-zinc-900/80 border border-zinc-800 p-2 text-center">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Posters</span>
                <span className="text-sm font-display uppercase text-white">
                  {postersDelivered} / {postersIncluded}
                </span>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-2 text-center">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Videos</span>
                <span className="text-sm font-display uppercase text-white">
                  {videosDelivered} / {videosIncluded}
                </span>
              </div>

              <div className={`p-2 text-center border ${
                revisionsUsed > revisionsIncluded 
                  ? "bg-brand-red/20 border-brand-red text-brand-red" 
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-300"
              }`}>
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Revisions</span>
                <span className="text-sm font-display uppercase">
                  {revisionsUsed} / {revisionsIncluded}
                </span>
              </div>
            </div>

            {revisionsUsed > revisionsIncluded && (
              <p className="text-[11px] text-brand-red font-sans">Outside of included revisions</p>
            )}
          </div>

          {/* Desktop Header View (md+) */}
          <div className="hidden md:flex justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-display uppercase tracking-wider">{clientName}</h1>
              
              <div className="mt-3 flex flex-wrap items-center gap-3 font-sans text-sm text-zinc-400">
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

                <span className="text-zinc-700">•</span>

                <span className="text-zinc-300">
                  <strong className="text-white">{postersDelivered}</strong> of {postersIncluded} posters delivered
                </span>

                <span className="text-zinc-700">•</span>

                <span className="text-zinc-300">
                  <strong className="text-white">{videosDelivered}</strong> of {videosIncluded} videos delivered
                </span>

                <span className="text-zinc-700">•</span>

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
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto p-4 md:px-8 mt-8">
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
        {!isClient ? (
            <div className="space-y-16 animate-pulse mt-8">
              {[1].map((i) => (
                <div key={i} className="relative pl-4 md:pl-8 border-l border-zinc-800">
                  <div className="absolute w-2 h-2 bg-zinc-800 -left-[4px] top-2" />
                  <div className="h-8 bg-zinc-800 w-48 mb-8" />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {[1, 2].map((j) => (
                      <div key={j} className="border border-zinc-800 flex flex-col bg-zinc-900/50">
                        <div className="w-full aspect-[4/5] bg-zinc-800" />
                        <div className="p-4 space-y-4">
                          <div className="flex justify-between">
                            <div className="w-24 h-4 bg-zinc-800" />
                            <div className="flex gap-2">
                              <div className="w-8 h-8 bg-zinc-800" />
                              <div className="w-8 h-8 bg-zinc-800" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="w-full h-4 bg-zinc-800" />
                            <div className="w-3/4 h-4 bg-zinc-800" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
        ) : (
        <div className="space-y-16 transition-opacity duration-700 opacity-100">
          {dates.map((date, dayIndex) => (
            <div key={date} className="relative pl-4 md:pl-8 border-l border-zinc-800">
              <div className="absolute w-2 h-2 bg-brand-red -left-[4px] top-2" />

              <h2 className="text-2xl font-display uppercase tracking-widest text-zinc-300 mb-8 flex items-center gap-4">
                {formatDeliverableDate(date)}
                <span className="text-xs font-mono text-zinc-600 bg-zinc-900 px-2 py-1">[ 0{dayIndex + 1} ]</span>
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {groupedByDate[date].map((item) => {
                  const hasOpenRevision = item.activeRevision?.status === "open";
                  const hasResolvedRevision = item.activeRevision?.status === "resolved";
                  const isNew = isRecentItem(item);
                  let previewImage = item.thumbnail?.asset?.url || item.thumbnailLink;
                    if (!previewImage && item.driveLink && item.driveLink.includes("drive.google.com")) {
                        const match = item.driveLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
                        if (match) {
                            previewImage = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
                        }
                    }
                  const downloadUrl = item.driveLink || (item.thumbnail?.asset?.url ? (item.thumbnail.asset.url + "?dl=") : "#");

                  return (
                    <div
                      key={item._id}
                      className={`border transition-all flex flex-col ${
                        item.isPosted
                          ? "bg-zinc-950/70 border-zinc-900 opacity-100"
                          : "bg-zinc-900/50 border-zinc-800"
                      }`}
                    >
                      {/* Media Preview Area */}
                        <div className="w-full bg-zinc-950 relative border-b border-zinc-800 flex flex-col items-center justify-center group/preview">
                          {(() => {
                            const isPlaying = playingReels[item._id];

                            if (item.assetType === "reel" && item.driveLink) {
                                // If they provided a thumbnail, use the click-to-play overlay
                                if (previewImage && !isPlaying) {
                                  return (
                                    <div 
                                      className="w-full relative cursor-pointer flex flex-col items-center justify-center bg-zinc-950 overflow-hidden"
                                      onClick={() => setPlayingReels(prev => ({ ...prev, [item._id]: true }))}
                                    >
                                      <img src={previewImage} alt="Thumbnail" className="w-full h-auto object-contain transition-opacity hover:opacity-80 opacity-90" />
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="bg-brand-green text-black rounded-full p-4 transform scale-100 transition-transform shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center justify-center group-hover/preview:scale-110">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }

                              const isDrive = item.driveLink.includes("drive.google.com");
                              if (isDrive) {
                                const embedUrl = item.driveLink.replace(/\/view(\?.*)?$/, "/preview");
                                return (
                                  <iframe src={embedUrl} className="w-full aspect-square md:aspect-video border-none max-h-[70vh]" allow="autoplay" allowFullScreen />
                                );
                              } else if (item.driveLink.endsWith(".mp4") || item.driveLink.includes("mixkit") || item.driveLink.endsWith(".webm") || item.driveLink.endsWith(".webp")) {
                                return (
                                  <video src={item.driveLink} autoPlay controls className="w-full h-auto max-h-[80vh] object-contain" />
                                );
                              }
                            }
                            
                            if (previewImage) {
                              return (
                                <img
                                  src={previewImage}
                                  alt="Thumbnail"
                                  className="w-full h-auto object-contain"
                                />
                              );
                            }
                            
                            return (
                              <div className="aspect-video w-full flex items-center justify-center text-zinc-700 font-mono text-sm uppercase tracking-widest">
                                No Preview
                              </div>
                            );
                          })()}

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
                      <div className="p-4 sm:p-6 flex flex-col flex-grow">
                        {/* Mobile Smartphone Action Buttons (< sm) */}
                        <div className="sm:hidden grid grid-cols-2 gap-2 mb-4">
                          <a
                            href={downloadUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider bg-zinc-950 border border-zinc-800 text-white active:bg-zinc-800 transition-colors text-center"
                          >
                            <Download className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">Download</span>
                          </a>

                          {hasOpenRevision ? (
                            <div className="min-h-[44px] flex items-center justify-center text-[11px] font-mono uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-900/60 px-2 py-2 text-center">
                              <span className="truncate">In Revision</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRevisionItem(item)}
                              className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider bg-brand-red/10 border border-brand-red/40 text-brand-red active:bg-brand-red/20 transition-colors text-center"
                            >
                              <MessageSquareWarning className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">Revision</span>
                            </button>
                          )}
                        </div>

                        {/* Desktop Action Buttons (sm+) */}
                        <div className="hidden sm:flex flex-wrap justify-between items-center gap-4 mb-6">
                          <a
                            href={downloadUrl || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-sans uppercase tracking-widest text-white hover:text-brand-green-light transition-colors"
                          >
                            <Download className="w-4 h-4" /> Download Asset
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
                        <div className="flex-grow flex flex-col mb-4 sm:mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-mono uppercase text-zinc-500">Caption</span>
                            <button
                              onClick={(e) => handleCopyCaption(item.caption, e)}
                              className="text-xs font-mono uppercase text-brand-green hover:text-brand-green-light py-1 px-2 -mr-2 transition-colors flex items-center gap-1 min-h-[32px]"
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <div className="bg-black p-3 sm:p-4 border border-zinc-800 font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed flex-grow">
                              <div className={expandedCaptions[item._id] ? "whitespace-pre-wrap" : "line-clamp-2"}>
                                {item.caption || "No caption provided."}
                              </div>
                              {item.caption && item.caption.length > 80 && (
                                <button
                                  onClick={() => setExpandedCaptions(prev => ({...prev, [item._id]: !prev[item._id]}))}
                                  className="text-brand-green hover:text-brand-green-light font-mono text-[10px] uppercase mt-2 tracking-widest"
                                >
                                  {expandedCaptions[item._id] ? "See Less" : "See More"}
                                </button>
                              )}
                            </div>
                        </div>

                        {/* Checklist: Mark as posted (Generous touch target for phones) */}
                        <div className="pt-3 sm:pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                          <label className="flex items-center gap-3 cursor-pointer select-none group min-h-[44px] py-1">
                            <input
                              type="checkbox"
                              checked={Boolean(item.isPosted)}
                              onChange={() => handleTogglePosted(item._id, item.isPosted)}
                              className="w-5 h-5 sm:w-4 sm:h-4 accent-brand-green-light cursor-pointer rounded-none border border-zinc-700 bg-zinc-900"
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
        )}
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
