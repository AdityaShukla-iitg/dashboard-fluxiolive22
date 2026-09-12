"use server";

import { client } from "@/lib/sanity";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy");

export async function submitRevision(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const contentItemId = formData.get("contentItemId") as string;
  const message = formData.get("message") as string;
  const driveLink = formData.get("driveLink") as string;
  const file = formData.get("attachment") as File | null;
  const clientName = formData.get("clientName") as string;

  try {
    let attachmentAssetId = null;

    // 1. Upload attachment to Sanity if present
    if (file && file.size > 0) {
      if (file.size > 15 * 1024 * 1024) {
        return { error: "File exceeds 15MB limit." };
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const asset = await client.assets.upload("file", buffer, {
        filename: file.name,
        contentType: file.type
      });
      attachmentAssetId = asset._id;
    }

    // 2. Create the Revision Request doc
    const revisionDoc = {
      _type: "revisionRequest",
      client: { _type: "reference", _ref: clientId },
      contentItem: { _type: "reference", _ref: contentItemId },
      message,
      createdAt: new Date().toISOString(),
      status: "open",
      ...(attachmentAssetId && {
        attachmentAsset: {
          _type: "file",
          asset: { _type: "reference", _ref: attachmentAssetId }
        }
      })
    };

    await client.create(revisionDoc);

    // 3. Send Email
    // In production, we'll construct a Sanity CDN URL if there's an attachment
    let attachmentUrl = "None";
    if (attachmentAssetId) {
       // Just a fallback string for email since fetching the exact URL requires another query
       attachmentUrl = `Uploaded to Sanity. Check admin panel. (Asset ID: ${attachmentAssetId})`;
    }

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Fluxio Portal <onboarding@resend.dev>",
          to: process.env.RESEND_TO_EMAIL || "adityashukla@fluxio.live",
          subject: `REVISION: ${clientName}`,
          text: `Client requested a revision.\n\nAsset Drive Link: ${driveLink}\n\nMessage:\n${message}\n\nAttachment: ${attachmentUrl}`,
        });
      } catch (emailErr) {
        console.error("Resend email send error:", emailErr);
      }
    } else {
      console.log("No RESEND_API_KEY, skipping email send.", { message, driveLink });
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Revision submission error:", err);
    return { error: "Failed to submit revision. Please try again." };
  }
}
