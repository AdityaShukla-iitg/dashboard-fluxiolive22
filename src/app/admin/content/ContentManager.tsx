"use client";

import { useState } from "react";
import { ClientDoc, ContentItem } from "@/lib/sanity";
import { upsertContentItem, deleteContentItem } from "@/app/actions/adminContent";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ContentManager({ 
  clients, 
  initialContent 
}: { 
  clients: ClientDoc[], 
  initialContent: ContentItem[] 
}) {
  const [contentItems, setContentItems] = useState(initialContent);
  const [selectedClient, setSelectedClient] = useState(clients[0]?._id || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredContent = contentItems.filter(c => c.client?._ref === selectedClient);
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentDateStr = format(now, 'yyyy-MM-dd');

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content item?")) return;
    setContentItems(prev => prev.filter(c => c._id !== id));
    await deleteContentItem(id);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await upsertContentItem(formData);
    setLoading(false);
    setModalOpen(false);
    window.location.reload();
  };

  const openNew = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEdit = (item: ContentItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-display uppercase tracking-widest">Content</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="flex-grow md:w-64 bg-zinc-900 border border-zinc-800 p-2 text-sm text-white focus:ring-0 focus:border-brand-green"
          >
            {clients.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <button onClick={openNew} className="bg-brand-red text-white px-4 py-2 uppercase font-mono text-xs tracking-widest flex items-center gap-2 hover:bg-red-700 transition-colors whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredContent.map(item => (
          <div key={item._id} className="bg-zinc-900 border border-zinc-800 flex flex-col">
            <div className="aspect-video w-full bg-zinc-950 border-b border-zinc-800 relative">
              {(item.thumbnail?.asset?.url || item.thumbnailLink) ? (
                <img 
                  src={item.thumbnail?.asset?.url || item.thumbnailLink} 
                  alt="Thumb" 
                  className="w-full h-full object-cover opacity-80" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700 font-mono text-xs uppercase tracking-widest">
                  No Preview
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black px-2 py-1 text-[10px] font-mono uppercase border border-zinc-800">
                {item.assetType}
              </div>
            </div>
            
            <div className="p-4 flex-grow flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-zinc-400">
                  {item.date ? format(parseISO(item.date), "MMM d, yyyy") : item.month}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(item)} className="text-zinc-500 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={() => handleDelete(item._id)} className="text-zinc-500 hover:text-brand-red"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              <p className="text-xs font-sans text-zinc-300 line-clamp-3 mb-4">{item.caption || "No caption"}</p>
            </div>
          </div>
        ))}

        {filteredContent.length === 0 && (
          <div className="col-span-full p-12 text-center border border-zinc-800 bg-zinc-900/50">
            <p className="text-zinc-500 font-sans">No content for this client yet.</p>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-display uppercase tracking-widest mb-6">
              {editingItem ? "Edit Asset" : "Add Asset"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="_id" value={editingItem?._id || ""} />
              <input type="hidden" name="client" value={selectedClient} />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Month (YYYY-MM)</label>
                  <input name="month" required defaultValue={editingItem?.month || currentMonthStr} pattern="\d{4}-\d{2}" className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-sm text-white placeholder:text-zinc-700" placeholder="2023-11" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Delivery Date</label>
                  <input name="date" type="date" required defaultValue={editingItem?.date || currentDateStr} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-sm text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-zinc-400">Asset Type</label>
                <select name="assetType" required defaultValue={editingItem?.assetType || "poster"} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-sm text-white h-[38px]">
                  <option value="poster">Poster</option>
                  <option value="reel">Reel</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-zinc-400">Google Drive Link</label>
                <input name="driveLink" type="url" required defaultValue={editingItem?.driveLink} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-sm text-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-zinc-400">Upload Thumbnail Image (Sanity CDN)</label>
                <input 
                  type="file" 
                  name="thumbnailFile" 
                  accept="image/*" 
                  className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-xs text-zinc-300 file:mr-4 file:py-1 file:px-3 file:border-0 file:text-xs file:font-mono file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-zinc-400">Or External Thumbnail Link (Fallback)</label>
                <input name="thumbnailLink" type="url" defaultValue={editingItem?.thumbnailLink} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-sm text-white" placeholder="https://..." />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-zinc-400">Caption</label>
                <textarea name="caption" rows={4} defaultValue={editingItem?.caption} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-sm text-white resize-none" />
              </div>

              <button type="submit" disabled={loading} className="w-full mt-6 bg-brand-green hover:bg-brand-green-light text-white font-display uppercase tracking-widest py-3 transition-colors">
                {loading ? "Saving..." : "Save Asset"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
