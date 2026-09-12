import { getSession, destroySession } from "@/lib/auth";
import { client as sanityClient, ClientDoc, ContentItem } from "@/lib/sanity";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function ClientDashboard({ params }: { params: { slug: string } }) {
  const session = await getSession();
  
  if (!session || session.type !== "client" || session.slug !== params.slug) {
    redirect(`/${params.slug}`);
  }

  // Fetch client data and their content
  const clientQuery = `*[_type == "client" && slug.current == $slug][0]`;
  const clientData = await sanityClient.fetch<ClientDoc>(clientQuery, { slug: params.slug });

  if (!clientData || clientData.status === "paused") {
    redirect(`/${params.slug}`);
  }

  const contentQuery = `*[_type == "contentItem" && client._ref == $clientId] | order(date desc)`;
  const allContent = await sanityClient.fetch<ContentItem[]>(contentQuery, { clientId: clientData._id });

  // Fetch count of revisions used
  const revisionsQuery = `count(*[_type == "revisionRequest" && client._ref == $clientId])`;
  const revisionsUsed = await sanityClient.fetch<number>(revisionsQuery, { 
    clientId: clientData._id
  });

  return (
    <div className="min-h-screen pb-24">
      <header className="border-b border-zinc-900 bg-black sticky top-0 z-40 p-4 md:px-8 md:py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-display uppercase tracking-wider">{clientData.name}</h1>
            <div className="mt-2 flex items-center gap-3 font-sans text-sm text-zinc-400">
              <span className="bg-brand-green text-white px-2 py-1 uppercase tracking-widest text-xs border border-brand-green-light">
                {clientData.plan} Plan
              </span>
              <span>{clientData.postersIncluded} Posters</span>
              <span>•</span>
              <span>{clientData.videosIncluded} Videos</span>
              <span>•</span>
              <span className={revisionsUsed > clientData.revisionsIncluded ? "text-brand-red" : ""}>
                {revisionsUsed} / {clientData.revisionsIncluded} Revisions Used
              </span>
            </div>
            {revisionsUsed > clientData.revisionsIncluded && (
              <p className="text-xs text-brand-red font-sans mt-1">Outside of included revisions</p>
            )}
          </div>
          
          <form action={async () => {
            "use server";
            await destroySession();
            redirect(`/${params.slug}`);
          }}>
            <button type="submit" className="text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
              [ Logout ]
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:px-8 mt-8">
        <DashboardClient content={allContent} clientId={clientData._id} />
      </main>
    </div>
  );
}
