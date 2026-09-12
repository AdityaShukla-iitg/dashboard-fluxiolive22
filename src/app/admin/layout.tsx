import { getSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, FileImage, MessageSquare, LogOut, BarChart3 } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // If there's no session, it means it's the login page rendering the layout
  if (!session) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    "use server";
    await destroySession();
    redirect("/admin/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-white">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex md:w-64 bg-black border-r border-zinc-900 min-h-screen flex-col flex-shrink-0">
        <div className="p-6 border-b border-zinc-900">
          <h1 className="font-display text-2xl uppercase tracking-widest text-white">Fluxio Admin</h1>
        </div>
        
        <nav className="p-4 flex-grow space-y-2">
          <Link
            href="/admin/clients"
            className="flex items-center gap-3 px-4 py-3 text-sm font-sans uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <Users className="w-4 h-4" /> Clients
          </Link>
          <Link
            href="/admin/content"
            className="flex items-center gap-3 px-4 py-3 text-sm font-sans uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <FileImage className="w-4 h-4" /> Content
          </Link>
          <Link
            href="/admin/revisions"
            className="flex items-center gap-3 px-4 py-3 text-sm font-sans uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <MessageSquare className="w-4 h-4" /> Revisions
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-sans uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <BarChart3 className="w-4 h-4" /> Statistics
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <form action={handleLogout}>
            <button
              type="submit"
              className="w-full text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-brand-red hover:text-red-400 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Smartphone Top Bar */}
      <div className="md:hidden bg-black border-b border-zinc-900 p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="font-display text-xl uppercase tracking-widest text-white">Fluxio Admin</h1>
        <form action={handleLogout}>
          <button
            type="submit"
            className="text-xs font-mono uppercase tracking-wider text-brand-red px-2 py-1 border border-zinc-800"
          >
            Logout
          </button>
        </form>
      </div>

      {/* Main Content View with mobile bottom padding for bottom nav */}
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Smartphone Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-t border-zinc-900 flex items-center justify-around py-2.5 px-2">
        <Link
          href="/admin/clients"
          className="flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white focus:text-white transition-colors"
        >
          <Users className="w-5 h-5" />
          <span>Clients</span>
        </Link>
        <Link
          href="/admin/content"
          className="flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white focus:text-white transition-colors"
        >
          <FileImage className="w-5 h-5" />
          <span>Content</span>
        </Link>
        <Link
          href="/admin/revisions"
          className="flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white focus:text-white transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Revisions</span>
        </Link>
        <Link
          href="/admin/dashboard"
          className="flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white focus:text-white transition-colors"
        >
          <BarChart3 className="w-5 h-5" />
          <span>Stats</span>
        </Link>
      </nav>
    </div>
  );
}
