import { client } from "@/lib/sanity";
import { BarChart3, Users, PlayCircle, PauseCircle, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalClients,
    activeClients,
    pausedClients,
    silverPlans,
    goldPlans,
    premiumPlans,
    totalRevisions,
    openRevisions,
    resolvedRevisions,
  ] = await Promise.all([
    client.fetch<number>(`count(*[_type == "client"])`),
    client.fetch<number>(`count(*[_type == "client" && status == "active"])`),
    client.fetch<number>(`count(*[_type == "client" && status != "active"])`),
    client.fetch<number>(`count(*[_type == "client" && plan == "Silver"])`),
    client.fetch<number>(`count(*[_type == "client" && plan == "Gold"])`),
    client.fetch<number>(`count(*[_type == "client" && plan == "Premium"])`),
    client.fetch<number>(`count(*[_type == "revisionRequest"])`),
    client.fetch<number>(`count(*[_type == "revisionRequest" && status == "open"])`),
    client.fetch<number>(`count(*[_type == "revisionRequest" && status == "resolved"])`),
  ]);

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-display uppercase tracking-widest text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-brand-green-light" />
          Dashboard
        </h1>
        <p className="text-sm font-sans text-zinc-400 mt-2">
          Overview of agency projects and statistics.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Projects Section */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-2">Projects</h2>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 flex items-center gap-2"><Users className="w-4 h-4 text-brand-green-light" /> Total</span>
            <span className="text-2xl font-display text-white">{totalClients}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 flex items-center gap-2"><PlayCircle className="w-4 h-4 text-brand-green-light" /> Ongoing (Active)</span>
            <span className="text-2xl font-display text-white">{activeClients}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 flex items-center gap-2"><PauseCircle className="w-4 h-4 text-zinc-500" /> Completed (Paused)</span>
            <span className="text-2xl font-display text-white">{pausedClients}</span>
          </div>
        </div>

        {/* Plans Section */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-2">Plan Distribution</h2>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-sans">Silver Plan</span>
            <span className="text-2xl font-display text-white">{silverPlans}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-sans">Gold Plan</span>
            <span className="text-2xl font-display text-white">{goldPlans}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-sans">Premium Plan</span>
            <span className="text-2xl font-display text-white">{premiumPlans}</span>
          </div>
        </div>

        {/* Revisions Section */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-2">Revisions</h2>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-sans">Total Requested</span>
            <span className="text-2xl font-display text-white">{totalRevisions}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 flex items-center gap-2"><Clock className="w-4 h-4 text-brand-red" /> Open (Pending)</span>
            <span className="text-2xl font-display text-white">{openRevisions}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-green-light" /> Solved (Resolved)</span>
            <span className="text-2xl font-display text-white">{resolvedRevisions}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
