import { getSession, destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, FileImage, MessageSquare } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (session?.type !== "admin") {
    // If we're not inside the login page itself
    // middleware handles the strict redirect, but layout is a double-check
    // Not doing a strict redirect here if it's the login page being rendered
  }

  // If there's no session, it means it's the login page rendering the layout
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950">
      <aside className="w-full md:w-64 bg-black border-r border-zinc-900 md:min-h-screen flex flex-col">
        <div className="p-6 border-b border-zinc-900">
          <h1 className="font-display text-2xl uppercase tracking-widest text-white">Fluxio Admin</h1>
        </div>
        
        <nav className="p-4 flex-grow space-y-2">
          <Link href="/admin/clients" className="flex items-center gap-3 px-4 py-3 text-sm font-sans uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
            <Users className="w-4 h-4" /> Clients
          </Link>
          <Link href="/admin/content" className="flex items-center gap-3 px-4 py-3 text-sm font-sans uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
            <FileImage className="w-4 h-4" /> Content
          </Link>
          <Link href="/admin/revisions" className="flex items-center gap-3 px-4 py-3 text-sm font-sans uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
            <MessageSquare className="w-4 h-4" /> Revisions
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <form action={async () => {
            "use server";
            await destroySession();
            redirect("/admin/login");
          }}>
            <button type="submit" className="w-full text-left px-4 py-3 text-xs font-mono uppercase tracking-widest text-brand-red hover:text-red-400 transition-colors">
              [ Logout ]
            </button>
          </form>
        </div>
      </aside>
      
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
