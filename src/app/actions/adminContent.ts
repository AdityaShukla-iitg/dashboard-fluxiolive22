"use server";

import { client } from "@/lib/sanity";
import { revalidatePath } from "next/cache";

export async function deleteContentItem(id: string) {
  await client.delete(id);
  revalidatePath("/admin/content");
}

export async function togglePostedStatus(id: string, currentStatus: boolean) {
  await client.patch(id).set({ isPosted: !currentStatus }).commit();
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
  const thumbnailFile = formData.get("thumbnailFile") as File | null;

  let thumbnailAssetId: string | null = null;
  if (thumbnailFile && thumbnailFile.size > 0) {
    const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
    const asset = await client.assets.upload("image", buffer, {
      filename: thumbnailFile.name,
      contentType: thumbnailFile.type,
    });
    thumbnailAssetId = asset._id;
  }

  const doc: { _type: string; [key: string]: unknown } = {
    _type: "contentItem",
    client: { _type: "reference", _ref: clientId },
    month,
    date,
    assetType,
    driveLink,
    thumbnailLink: thumbnailLink || "",
    caption,
  };

  if (thumbnailAssetId) {
    doc.thumbnail = {
      _type: "image",
      asset: { _type: "reference", _ref: thumbnailAssetId },
    };
  }

      let result;
    if (_id) {
      result = await client.patch(_id).set(doc).commit();
    } else {
      result = await client.create(doc as Parameters<typeof client.create>[0]);
    }
  
    const resolvedDoc = await client.fetch(`*[_id == $id][0] {
      ...,
      thumbnail {
        asset-> { url }
      }
    }`, { id: result._id });

    revalidatePath("/admin/content");
    revalidatePath("/[slug]/dashboard", "page");
    return { success: true, item: resolvedDoc };
}
