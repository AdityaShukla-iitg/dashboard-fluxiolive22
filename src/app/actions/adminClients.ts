"use server";

import { client } from "@/lib/sanity";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function toggleClientStatus(clientId: string, currentStatus: string) {
  const newStatus = currentStatus === "active" ? "paused" : "active";
  await client.patch(clientId).set({ status: newStatus }).commit();
  revalidatePath("/admin/clients");
}

export async function upsertClient(formData: FormData) {
  const _id = formData.get("_id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const plan = formData.get("plan") as string;
  const postersIncluded = parseInt(formData.get("postersIncluded") as string) || 0;
  const videosIncluded = parseInt(formData.get("videosIncluded") as string) || 0;
  const revisionsIncluded = parseInt(formData.get("revisionsIncluded") as string) || 0;
  const password = formData.get("password") as string;

  const doc: { _type: string; [key: string]: unknown } = {
    _type: "client",
    name,
    slug: { _type: "slug", current: slug },
    plan,
    postersIncluded,
    videosIncluded,
    revisionsIncluded,
    status: "active",
  };

  if (password) {
    doc.passwordHash = await bcrypt.hash(password, 10);
  }

  if (_id) {
    // Edit existing
    await client.patch(_id).set(doc).commit();
  } else {
    // Create new
    if (!password) throw new Error("Password required for new clients.");
    await client.create(doc);
  }

  revalidatePath("/admin/clients");
}
