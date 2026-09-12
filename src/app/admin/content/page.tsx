import { client, ClientDoc, ContentItem } from "@/lib/sanity";
import ContentManager from "./ContentManager";

export const dynamic = "force-dynamic";

export default async function AdminContent() {
  const clientsQuery = `*[_type == "client"] | order(name asc)`;
  const clients = await client.fetch<ClientDoc[]>(clientsQuery);

  const contentQuery = `*[_type == "contentItem"] | order(date desc) {
    ...,
    thumbnail {
      asset-> {
        url
      }
    }
  }`;
  const allContent = await client.fetch<ContentItem[]>(contentQuery);

  return <ContentManager clients={clients} initialContent={allContent} />;
}
