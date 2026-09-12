"use client";

import { useState } from "react";
import { ClientDoc } from "@/lib/sanity";
import { toggleClientStatus, upsertClient, deleteClient } from "@/app/actions/adminClients";
import { Plus, Edit2, PauseCircle, PlayCircle, X, Trash2, Eye, EyeOff } from "lucide-react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import ToastNotification, { ToastMessage } from "@/components/ToastNotification";

import { useRouter } from "next/navigation";

export default function ClientManager({ initialClients }: { initialClients: ClientDoc[] }) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);

  // Delete modal state
  const [clientToDelete, setClientToDelete] = useState<ClientDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleToggle = async (id: string, currentStatus: string) => {
    // Optimistic update
    setClients(prev => prev.map(c => c._id === id ? { ...c, status: currentStatus === "active" ? "paused" : "active" } : c));
    await toggleClientStatus(id, currentStatus);
    setToast({
      id: Date.now().toString(),
      type: "info",
      title: "STATUS UPDATED",
      message: `Client status changed to ${currentStatus === "active" ? "Paused" : "Active"}.`,
    });
    router.refresh();
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    setIsDeleting(true);
    const targetId = clientToDelete._id;
    const targetName = clientToDelete.name;

    const res = await deleteClient(targetId);
    setIsDeleting(false);
    setClientToDelete(null);

    if (res?.error) {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "DELETE FAILED",
        message: res.error,
      });
    } else {
      setClients(prev => prev.filter(c => c._id !== targetId));
      setToast({
        id: Date.now().toString(),
        type: "delete",
        title: "CLIENT DELETED",
        message: `Client "${targetName}" and all associated data have been permanently removed.`,
      });
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const isEditing = Boolean(editingClient);
    const res = await upsertClient(formData);
    setLoading(false);
    setModalOpen(false);

    if (res?.client) {
      const saved = res.client as unknown as ClientDoc;
      setClients(prev => {
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
        title: isEditing ? "CLIENT UPDATED" : "CLIENT CREATED",
        message: `Client "${saved.name}" has been saved successfully.`,
      });
    }
    router.refresh();
  };

  const openNew = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const openEdit = (c: ClientDoc) => {
    setEditingClient(c);
    setModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display uppercase tracking-widest">Clients</h1>
        <button onClick={openNew} className="bg-brand-red text-white px-4 py-2 uppercase font-mono text-xs tracking-widest flex items-center gap-2 hover:bg-red-700 transition-colors">
          <Plus className="w-4 h-4" /> New Client
        </button>
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 gap-4">
        {clients.map(c => (
          <div key={c._id} className="bg-zinc-900 border border-zinc-800 p-4 md:p-6">
            {/* Mobile Smartphone Card (< md) */}
            <div className="md:hidden space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-display uppercase tracking-wider text-white">{c.name}</h2>
                  {c.slug?.current && (
                    <a 
                      href={`/${c.slug.current}/dashboard`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-zinc-500 hover:text-brand-green-light font-mono text-xs mt-0.5 inline-block transition-colors"
                      title="Open Client Dashboard"
                    >
                      /{c.slug.current} ↗
                    </a>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-mono uppercase tracking-wider border ${
                  c.status === 'active' 
                    ? 'text-brand-green-light border-brand-green/40 bg-brand-green/10' 
                    : 'text-zinc-500 border-zinc-800 bg-zinc-950'
                }`}>
                  {c.status || "active"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="bg-zinc-950 px-2.5 py-1 border border-zinc-800 text-zinc-300">{c.plan} Plan</span>
                <span className="bg-zinc-950 px-2.5 py-1 border border-zinc-800">{c.postersIncluded}P / {c.videosIncluded}V</span>
                <span className="bg-zinc-950 px-2.5 py-1 border border-zinc-800">{c.revisionsIncluded} Rev</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80">
                <button 
                  onClick={() => handleToggle(c._id, c.status)} 
                  className="min-h-[44px] flex items-center justify-center gap-1.5 bg-zinc-950 border border-zinc-800 text-zinc-300 active:bg-zinc-800 text-xs font-mono uppercase tracking-wider"
                >
                  {c.status === 'active' ? (
                    <>
                      <PauseCircle className="w-4 h-4" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      <span>Resume</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={() => openEdit(c)} 
                  className="min-h-[44px] flex items-center justify-center gap-1.5 bg-zinc-950 border border-zinc-800 text-zinc-300 active:bg-zinc-800 text-xs font-mono uppercase tracking-wider"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>

                <button 
                  onClick={() => setClientToDelete(c)} 
                  className="min-h-[44px] flex items-center justify-center gap-1.5 bg-zinc-950 border border-brand-red/30 text-brand-red active:bg-brand-red/20 text-xs font-mono uppercase tracking-wider"
                  title="Delete Client"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Desktop Card (md+) */}
            <div className="hidden md:flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-display uppercase tracking-wider">{c.name}</h2>
                {c.slug?.current && (
                  <a 
                    href={`/${c.slug.current}/dashboard`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-zinc-500 hover:text-brand-green-light font-mono text-xs mt-1 inline-block transition-colors"
                    title="Open Client Dashboard"
                  >
                    /{c.slug.current} ↗
                  </a>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm font-sans text-zinc-400">
                <span className="bg-zinc-950 px-2 py-1 border border-zinc-800">{c.plan}</span>
                <span>{c.postersIncluded}P / {c.videosIncluded}V</span>
                <span className={`px-2 py-1 ${c.status === 'active' ? 'text-brand-green-light' : 'text-zinc-500'}`}>
                  {(c.status || "active").toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(c._id, c.status)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Toggle Status">
                  {c.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(c)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setClientToDelete(c)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-brand-red transition-colors" title="Delete Client">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <div className="p-12 text-center border border-zinc-800 bg-zinc-900/50">
            <p className="text-zinc-500 font-sans">No clients configured.</p>
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
              {editingClient ? "Edit Client" : "New Client"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="_id" value={editingClient?._id || ""} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Name</label>
                  <input name="name" required defaultValue={editingClient?.name} className="w-full bg-zinc-900 border border-zinc-800 p-3 sm:p-2 font-sans text-base sm:text-sm text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Slug</label>
                  <input name="slug" required defaultValue={editingClient?.slug?.current || ""} className="w-full bg-zinc-900 border border-zinc-800 p-3 sm:p-2 font-sans text-base sm:text-sm text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Plan</label>
                  <select name="plan" required defaultValue={editingClient?.plan || "Silver"} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-base sm:text-sm text-white h-[44px] sm:h-[38px]">
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Premium">Premium</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Password {editingClient ? "(leave blank to keep)" : ""}</label>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={showModalPassword ? "text" : "password"} 
                      required={!editingClient} 
                      className="w-full bg-zinc-900 border border-zinc-800 p-3 sm:p-2 pr-10 font-sans text-base sm:text-sm text-white" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                      aria-label={showModalPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-mono uppercase text-zinc-400">Posters</label>
                  <input name="postersIncluded" type="number" required defaultValue={editingClient?.postersIncluded || 4} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-base sm:text-sm text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-mono uppercase text-zinc-400">Videos</label>
                  <input name="videosIncluded" type="number" required defaultValue={editingClient?.videosIncluded || 1} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-base sm:text-sm text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-mono uppercase text-zinc-400">Revisions</label>
                  <input name="revisionsIncluded" type="number" required defaultValue={editingClient?.revisionsIncluded || 2} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-base sm:text-sm text-white" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full mt-6 bg-brand-green hover:bg-brand-green-light text-white font-display uppercase tracking-widest py-3 min-h-[48px] transition-colors flex items-center justify-center">
                {loading ? "Saving..." : "Save Client"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(clientToDelete)}
        title="DELETE CLIENT BRAND"
        itemName={clientToDelete?.name || ""}
        itemType="client brand and all deliverables"
        description="Are you sure you want to permanently delete this brand? All portal access, monthly deliveries, and revision records will be permanently removed."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setClientToDelete(null)}
      />

      {/* Floating Notification Toast UI */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
