import { client, ClientDoc } from "@/lib/sanity";
import ClientManager from "./ClientManager";

export const dynamic = "force-dynamic";

export default async function AdminClients() {
  const query = `*[_type == "client"] | order(name asc)`;
  const clients = await client.fetch<ClientDoc[]>(query);

  return <ClientManager initialClients={clients} />;
}
