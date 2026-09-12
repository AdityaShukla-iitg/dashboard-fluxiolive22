"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ContentItem } from "@/lib/sanity";
import { Copy, ExternalLink, MessageSquareWarning } from "lucide-react";
import RevisionModal from "./RevisionModal";

export default function DashboardClient({ content, clientId }: { content: ContentItem[], clientId: string }) {
  // Extract unique months
  const months = Array.from(new Set(content.map(c => c.month))).sort().reverse();
  const [selectedMonth, setSelectedMonth] = useState(months[0] || "");
  const [isClient, setIsClient] = useState(false);
  
  // Animation delay trick
  useEffect(() => { setIsClient(true); }, []);

  const monthContent = content.filter(c => c.month === selectedMonth);
  
  // Group by date
  const groupedByDate = monthContent.reduce((acc, curr) => {
    if (!acc[curr.date]) acc[curr.date] = [];
    acc[curr.date].push(curr);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  const dates = Object.keys(groupedByDate).sort().reverse();

  const handleCopy = async (text: string, e: React.MouseEvent<HTMLButtonElement>) => {
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

  const [revisionItem, setRevisionItem] = useState<ContentItem | null>(null);

  return (
    <div>
      {/* Month Selector */}
      {months.length > 0 && (
        <div className="mb-12">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent border-none text-xl md:text-2xl font-display uppercase tracking-widest text-zinc-400 hover:text-white focus:ring-0 cursor-pointer p-0"
          >
            {months.map(m => (
              <option key={m} value={m} className="bg-zinc-900 text-sm font-sans">{m}</option>
            ))}
          </select>
        </div>
      )}

      {!months.length && (
        <div className="py-24 text-center">
          <p className="font-display text-3xl uppercase text-zinc-600">No deliveries yet.</p>
          <p className="font-sans text-zinc-500 mt-2">Check back soon.</p>
        </div>
      )}

      {/* Content Blocks */}
      <div className={`space-y-16 transition-opacity duration-700 ${isClient ? 'opacity-100' : 'opacity-0'}`}>
        {dates.map((date, dayIndex) => (
          <div key={date} className="relative pl-4 md:pl-8 border-l border-zinc-800">
            <div className="absolute w-2 h-2 bg-brand-red -left-[4px] top-2" />
            
            <h2 className="text-2xl font-display uppercase tracking-widest text-zinc-300 mb-8 flex items-center gap-4">
              {format(parseISO(date), "MMMM do, yyyy")}
              <span className="text-xs font-mono text-zinc-600 bg-zinc-900 px-2 py-1">[ 0{dayIndex + 1} ]</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {groupedByDate[date].map(item => (
                <div key={item._id} className="bg-zinc-900/50 border border-zinc-800 flex flex-col">
                  
                  {/* Media Area */}
                  <div className="aspect-[4/5] md:aspect-video w-full bg-zinc-950 relative border-b border-zinc-800 flex items-center justify-center overflow-hidden">
                    {item.thumbnailLink ? (
                      <img src={item.thumbnailLink} alt="Thumbnail" className="object-cover w-full h-full opacity-80" />
                    ) : (
                      <div className="text-zinc-700 font-mono text-sm uppercase tracking-widest">No Preview</div>
                    )}
                    <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 font-mono text-xs uppercase tracking-widest border border-zinc-800 text-zinc-300">
                      {item.assetType}
                    </div>
                  </div>

                  {/* Details Area */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-6">
                      <a 
                        href={item.driveLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-2 text-sm font-sans uppercase tracking-widest text-white hover:text-brand-green-light transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" /> View in Drive
                      </a>
                      
                      <button 
                        onClick={() => setRevisionItem(item)}
                        className="flex items-center gap-2 text-sm font-sans uppercase tracking-widest text-brand-red hover:text-red-400 transition-colors"
                      >
                        <MessageSquareWarning className="w-4 h-4" /> Ask for revision
                      </button>
                    </div>

                    <div className="flex-grow flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-mono uppercase text-zinc-500">Caption</span>
                        <button 
                          onClick={(e) => handleCopy(item.caption, e)}
                          className="text-xs font-mono uppercase text-brand-green hover:text-brand-green-light transition-colors flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      </div>
                      <div className="bg-black p-4 border border-zinc-800 font-sans text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap flex-grow">
                        {item.caption || "No caption provided."}
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {revisionItem && (
        <RevisionModal 
          item={revisionItem} 
          clientId={clientId}
          onClose={() => setRevisionItem(null)} 
        />
      )}
    </div>
  );
}
