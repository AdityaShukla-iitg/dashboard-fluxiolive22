import { getSession, destroySession } from "@/lib/auth";
import { client as sanityClient, ClientDoc, ContentItem } from "@/lib/sanity";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function ClientDashboard({ params }: { params: { slug: string } }) {
  const session = await getSession();
  
  const isAuthorizedClient =
    session?.type === "client" &&
    session?.slug?.toLowerCase() === params.slug?.toLowerCase();
  const isAuthorizedAdmin = session?.type === "admin";

  if (!session || (!isAuthorizedClient && !isAuthorizedAdmin)) {
    redirect(`/${params.slug}`);
  }

  // Fetch client data and their content case-insensitively
  const cleanSlug = params.slug.trim();
  const lowerSlug = cleanSlug.toLowerCase();
  const compactSlug = lowerSlug.replace(/[\s-_]+/g, "");
  const hyphenSlug = lowerSlug.replace(/[\s_]+/g, "-");

  const clientQuery = `*[_type == "client" && (
    slug.current == $cleanSlug ||
    lower(slug.current) == $lowerSlug ||
    lower(slug.current) == $hyphenSlug ||
    lower(slug.current) == $compactSlug ||
    lower(name) == $lowerSlug
  )][0]`;

  const clientData = await sanityClient.fetch<ClientDoc | null>(clientQuery, {
    cleanSlug,
    lowerSlug,
    hyphenSlug,
    compactSlug,
  });

  if (!clientData) {
    redirect("/");
  }

  if (clientData.status === "paused" && !isAuthorizedAdmin) {
    redirect(`/${params.slug}`);
  }

  // If the URL slug does not match canonical slug, redirect to canonical slug
  if (params.slug !== clientData.slug.current) {
    redirect(`/${clientData.slug.current}/dashboard`);
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
    redirect("/");
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
        isAdmin={isAuthorizedAdmin}
        logoutAction={handleLogout}
      />
    </div>
  );
}
