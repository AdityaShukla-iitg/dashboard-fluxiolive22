"use client";

import { useState } from "react";
import { ClientDoc } from "@/lib/sanity";
import { toggleClientStatus, upsertClient, deleteClient } from "@/app/actions/adminClients";
import { Plus, Edit2, PauseCircle, PlayCircle, X, Trash2 } from "lucide-react";

export default function ClientManager({ initialClients }: { initialClients: ClientDoc[] }) {
  const [clients, setClients] = useState(initialClients);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDoc | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (id: string, currentStatus: string) => {
    // Optimistic update
    setClients(prev => prev.map(c => c._id === id ? { ...c, status: currentStatus === "active" ? "paused" : "active" } : c));
    await toggleClientStatus(id, currentStatus);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" and all associated deliverables?`)) {
      return;
    }
    setClients(prev => prev.filter(c => c._id !== id));
    await deleteClient(id);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await upsertClient(formData);
    setLoading(false);
    setModalOpen(false);
    // Ideally we re-fetch or rely on Server Actions revalidatePath to refresh the page.
    window.location.reload();
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

      <div className="grid grid-cols-1 gap-4">
        {clients.map(c => (
          <div key={c._id} className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-display uppercase tracking-wider">{c.name}</h2>
              <p className="text-zinc-500 font-mono text-xs mt-1">/{c.slug.current}</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-sans text-zinc-400">
              <span className="bg-zinc-950 px-2 py-1 border border-zinc-800">{c.plan}</span>
              <span>{c.postersIncluded}P / {c.videosIncluded}V</span>
              <span className={`px-2 py-1 ${c.status === 'active' ? 'text-brand-green-light' : 'text-zinc-500'}`}>
                {c.status.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => handleToggle(c._id, c.status)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Toggle Status">
                {c.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
              </button>
              <button onClick={() => openEdit(c)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors" title="Edit">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(c._id, c.name)} className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-brand-red transition-colors" title="Delete Client">
                <Trash2 className="w-4 h-4" />
              </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-display uppercase tracking-widest mb-6">
              {editingClient ? "Edit Client" : "New Client"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="_id" value={editingClient?._id || ""} />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Name</label>
                  <input name="name" required defaultValue={editingClient?.name} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-sm text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Slug</label>
                  <input name="slug" required defaultValue={editingClient?.slug.current} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-sm text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Plan</label>
                  <select name="plan" required defaultValue={editingClient?.plan || "Silver"} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-sm text-white h-[38px]">
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Premium">Premium</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Password {editingClient ? "(leave blank to keep)" : ""}</label>
                  <input name="password" type="password" required={!editingClient} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-sm text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Posters</label>
                  <input name="postersIncluded" type="number" required defaultValue={editingClient?.postersIncluded || 4} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-sm text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Videos</label>
                  <input name="videosIncluded" type="number" required defaultValue={editingClient?.videosIncluded || 1} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-sm text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-zinc-400">Revisions</label>
                  <input name="revisionsIncluded" type="number" required defaultValue={editingClient?.revisionsIncluded || 2} className="w-full bg-zinc-900 border border-zinc-800 p-2 font-sans text-sm text-white" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full mt-6 bg-brand-green hover:bg-brand-green-light text-white font-display uppercase tracking-widest py-3 transition-colors">
                {loading ? "Saving..." : "Save Client"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
