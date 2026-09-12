"use server";

import { client } from "@/lib/sanity";
import { revalidatePath } from "next/cache";

export async function toggleAssetPosted(id: string, currentStatus: boolean, slug: string) {
  try {
    await client.patch(id).set({ isPosted: !currentStatus }).commit();
    revalidatePath(`/${slug}/dashboard`);
    return { success: true, isPosted: !currentStatus };
  } catch (err) {
    console.error("Failed to toggle posted status:", err);
    return { error: "Failed to update status." };
  }
}
