"use server";

import { client } from "@/lib/sanity";
import { revalidatePath } from "next/cache";

export async function deleteContentItem(id: string) {
  await client.delete(id);
  revalidatePath("/admin/content");
}

export async function upsertContentItem(formData: FormData) {
  const _id = formData.get("_id") as string;
  const clientId = formData.get("client") as string;
  const month = formData.get("month") as string;
  const date = formData.get("date") as string;
  const assetType = formData.get("assetType") as string;
  const driveLink = formData.get("driveLink") as string;
  const thumbnailLink = formData.get("thumbnailLink") as string;
  const caption = formData.get("caption") as string;

  const doc = {
    _type: "contentItem",
    client: { _type: "reference", _ref: clientId },
    month,
    date,
    assetType,
    driveLink,
    thumbnailLink,
    caption,
  };

  if (_id) {
    await client.patch(_id).set(doc).commit();
  } else {
    await client.create(doc);
  }

  revalidatePath("/admin/content");
}
