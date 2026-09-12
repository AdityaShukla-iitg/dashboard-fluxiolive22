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

  const contentQuery = `*[_type == "contentItem" && client._ref == $clientId] | order(date desc) {
    ...,
    _createdAt,
    thumbnail {
      asset-> {
        url
      }
    },
    "activeRevision": *[_type == "revisionRequest" && contentItem._ref == ^._id] | order(createdAt desc)[0] {
      _id,
      status,
      createdAt,
      message
    }
  }`;
  const allContent = await sanityClient.fetch<ContentItem[]>(contentQuery, { clientId: clientData._id });

  // Fetch count of revisions used
  const revisionsQuery = `count(*[_type == "revisionRequest" && client._ref == $clientId])`;
  const revisionsUsed = await sanityClient.fetch<number>(revisionsQuery, { 
    clientId: clientData._id
  });

  const handleLogout = async () => {
    "use server";
    await destroySession();
    redirect(`/${params.slug}`);
  };

  return (
    <div className="min-h-screen pb-24">
      <DashboardClient 
        content={allContent} 
        clientId={clientData._id}
        clientName={clientData.name}
        clientSlug={clientData.slug.current}
        plan={clientData.plan}
        postersIncluded={clientData.postersIncluded}
        videosIncluded={clientData.videosIncluded}
        revisionsIncluded={clientData.revisionsIncluded}
        revisionsUsed={revisionsUsed}
        logoutAction={handleLogout}
      />
    </div>
  );
}
