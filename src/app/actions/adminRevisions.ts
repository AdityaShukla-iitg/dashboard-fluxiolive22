"use server";

import { client } from "@/lib/sanity";
import { revalidatePath } from "next/cache";

export async function toggleRevisionStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === "open" ? "resolved" : "open";
  await client.patch(id).set({ status: newStatus }).commit();
  revalidatePath("/admin/revisions");
}

export async function deleteRevision(id: string) {
  try {
    await client.delete(id);
    revalidatePath("/admin/revisions");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete revision:", err);
    return { error: "Failed to delete revision." };
  }
}

export async function clearAllResolvedRevisions() {
  try {
    const resolvedIds = await client.fetch<string[]>(
      `*[_type == "revisionRequest" && status == "resolved"]._id`
    );
    for (const id of resolvedIds) {
      await client.delete(id);
    }
    revalidatePath("/admin/revisions");
    return { success: true, count: resolvedIds.length };
  } catch (err) {
    console.error("Failed to clear resolved revisions:", err);
    return { error: "Failed to clear resolved revisions." };
  }
}


