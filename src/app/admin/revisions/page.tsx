import { client } from "@/lib/sanity";
import RevisionsManager from "./RevisionsManager";

export const dynamic = "force-dynamic";

export default async function AdminRevisions() {
  const query = `*[_type == "revisionRequest"] | order(createdAt desc) {
    _id,
    message,
    status,
    createdAt,
    client->{name},
    contentItem->{driveLink},
    attachmentAsset{asset->{url}}
  }`;
  
  const revisions = await client.fetch(query);

  return <RevisionsManager initialRevisions={revisions} />;
}
