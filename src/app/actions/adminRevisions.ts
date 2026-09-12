"use server";

import { client } from "@/lib/sanity";
import { revalidatePath } from "next/cache";

export async function toggleRevisionStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === "open" ? "resolved" : "open";
  await client.patch(id).set({ status: newStatus }).commit();
  revalidatePath("/admin/revisions");
}
