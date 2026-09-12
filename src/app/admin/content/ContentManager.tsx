"use client";

import { useState } from "react";
import { ClientDoc, ContentItem } from "@/lib/sanity";
import { upsertContentItem, deleteContentItem } from "@/app/actions/adminContent";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import ToastNotification, { ToastMessage } from "@/components/ToastNotification";

import { useRouter } from "next/navigation";

function safeFormatDate(dateStr?: string, fallback?: string) {
  if (!dateStr) return fallback || "";
  try {
    const parsed = parseISO(dateStr);
    if (isNaN(parsed.getTime())) return fallback || dateStr;
    return format(parsed, "MMM d, yyyy");
  } catch {
    return fallback || dateStr;
  }
}

export default function ContentManager({ 
  clients, 
  initialContent 
}: { 
  clients: ClientDoc[], 
  initialContent: ContentItem[] 
}) {
  const router = useRouter();
  const [contentItems, setContentItems] = useState(initialContent);
  const [selectedClient, setSelectedClient] = useState(clients[0]?._id || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const filteredContent = contentItems.filter(c => c.client?._ref === selectedClient);
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentDateStr = format(now, 'yyyy-MM-dd');

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const targetId = itemToDelete._id;
    await deleteContentItem(targetId);
    setContentItems(prev => prev.filter(c => c._id !== targetId));
    setIsDeleting(false);
    setItemToDelete(null);
    setToast({
      id: Date.now().toString(),
      type: "delete",
      title: "ASSET DELETED",
      message: "Deliverable item has been permanently removed.",
    });
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const isEditing = Boolean(editingItem);
    const res = await upsertContentItem(formData);
    setLoading(false);
    setModalOpen(false);

    if (res?.item) {
      const saved = res.item as unknown as ContentItem;
      setContentItems(prev => {
        const idx = prev.findIndex(c => c._id === saved._id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...prev[idx], ...saved };
          return next;
        }
        return [saved, ...prev];
      });

      setToast({
        id: Date.now().toString(),
        type: "success",
        title: isEditing ? "ASSET UPDATED" : "ASSET ADDED",
        message: "Deliverable item has been saved successfully.",
      });
    }
    router.refresh();
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
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display uppercase tracking-widest">Content</h1>
          <p className="text-zinc-500 font-sans text-xs uppercase tracking-wider mt-1 md:hidden">
            Manage assets and deliveries
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <select 
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full sm:w-64 bg-zinc-900 border border-zinc-800 p-2.5 text-sm text-white focus:ring-0 focus:border-brand-green min-h-[44px]"
          >
            {clients.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <button 
            onClick={openNew} 
            className="bg-brand-red text-white px-4 py-2.5 uppercase font-mono text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-colors whitespace-nowrap min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredContent.map(item => (
          <div key={item._id} className="bg-zinc-900 border border-zinc-800 flex flex-col">
            <div className="aspect-video w-full bg-zinc-950 border-b border-zinc-800 relative">
              {(item.thumbnail?.asset?.url || item.thumbnailLink) ? (
                <img 
                  src={item.thumbnail?.asset?.url || item.thumbnailLink} 
                  alt="Thumb" 
                  className="w-full h-full object-cover" 
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
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono text-zinc-400">
                  {safeFormatDate(item.date, item.month)}
                </span>

                {/* Touch friendly edit & delete action triggers */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => openEdit(item)} 
                    className="p-2 text-zinc-400 hover:text-white bg-zinc-950 border border-zinc-800 transition-colors"
                    title="Edit Asset"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setItemToDelete(item)} 
                    className="p-2 text-zinc-400 hover:text-brand-red bg-zinc-950 border border-zinc-800 transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border-t sm:border border-zinc-800 w-full sm:max-w-xl p-5 sm:p-6 relative shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Mobile Grab Bar */}
            <div className="w-12 h-1 bg-zinc-800 mx-auto mb-4 sm:hidden" />

            <button type="button" onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl sm:text-2xl font-display uppercase tracking-widest mb-6">
              {editingItem ? "Edit Asset" : "Add Asset"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="_id" value={editingItem?._id || ""} />
              <input type="hidden" name="client" value={selectedClient} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Month (YYYY-MM)</label>
                  <input name="month" required defaultValue={editingItem?.month || currentMonthStr} pattern="\d{4}-\d{2}" className="w-full bg-zinc-900 border border-zinc-800 p-3 sm:p-2 font-sans text-base sm:text-sm text-white placeholder:text-zinc-700" placeholder="2023-11" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Delivery Date</label>
                  <input name="date" type="date" required defaultValue={editingItem?.date || currentDateStr} className="w-full bg-zinc-900 border border-zinc-800 p-3 sm:p-2 font-sans text-base sm:text-sm text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-zinc-400">Asset Type</label>
                <select name="assetType" required defaultValue={editingItem?.assetType || "poster"} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-base sm:text-sm text-white h-[44px] sm:h-[38px]">
                  <option value="poster">Poster</option>
                  <option value="reel">Reel</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-zinc-400">Google Drive Link</label>
                <input name="driveLink" type="url" required defaultValue={editingItem?.driveLink} className="w-full bg-zinc-900 border border-zinc-800 p-3 sm:p-2 font-sans text-base sm:text-sm text-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-zinc-400">Upload Thumbnail Image (Sanity CDN)</label>
                <input 
                  type="file" 
                  name="thumbnailFile" 
                  accept="image/*" 
                  className="w-full bg-zinc-900 border border-zinc-800 p-3 sm:p-2 font-sans text-xs text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-mono file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-zinc-400">Or External Thumbnail Link (Fallback)</label>
                <input name="thumbnailLink" type="url" defaultValue={editingItem?.thumbnailLink} className="w-full bg-zinc-900 border border-zinc-800 p-3 sm:p-2 font-sans text-base sm:text-sm text-white" placeholder="https://..." />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-zinc-400">Caption</label>
                <textarea name="caption" rows={4} defaultValue={editingItem?.caption} className="w-full bg-zinc-900 border border-zinc-800 p-3 sm:p-2 font-sans text-base sm:text-sm text-white resize-none" />
              </div>

              <button type="submit" disabled={loading} className="w-full mt-6 bg-brand-green hover:bg-brand-green-light text-white font-display uppercase tracking-widest py-3 min-h-[48px] transition-colors flex items-center justify-center">
                {loading ? "Saving..." : "Save Asset"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="DELETE CONTENT ASSET"
        itemName={
          itemToDelete?.caption 
            ? (itemToDelete.caption.slice(0, 40) + (itemToDelete.caption.length > 40 ? "..." : ""))
            : `${itemToDelete?.assetType?.toUpperCase() || "ASSET"} (${itemToDelete?.date || itemToDelete?.month || ""})`
        }
        itemType="content deliverable"
        description="Are you sure you want to permanently delete this deliverable asset? It will be permanently removed from the client portal and Sanity database."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Floating Notification Toast UI */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
