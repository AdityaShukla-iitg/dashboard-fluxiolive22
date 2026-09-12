import { createClient } from "@sanity/client";

// We use the same environment variables as the main project,
// but we pass them explicitly or assume they're in .env.local
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "6cycexy8",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-03-01",
  useCdn: false, // Ensure fresh content updates immediately
  token: process.env.SANITY_API_TOKEN, // Needed for reading drafted/paused clients or executing writes
});

// Types
export interface ClientDoc {
  _id: string;
  name: string;
  slug: { current: string };
  plan: "Silver" | "Gold" | "Premium" | "Custom";
  postersIncluded: number;
  videosIncluded: number;
  revisionsIncluded: number;
  passwordHash: string;
  status: "active" | "paused";
}

export interface ContentItem {
  _id: string;
  _createdAt?: string;
  client?: { _ref: string; _type?: string };
  month: string;
  date: string;
  assetType: "poster" | "reel";
  driveLink: string;
  thumbnailLink?: string;
  thumbnail?: { asset?: { url?: string } };
  caption: string;
  isPosted?: boolean;
  activeRevision?: {
    _id: string;
    status: "open" | "resolved";
    message: string;
    createdAt: string;
  };
}

export interface RevisionRequest {
  _id: string;
  client: { _ref: string; _type: "reference" };
  contentItem?: { _ref: string; _type: "reference" };
  message: string;
  status: "open" | "resolved";
  createdAt: string;
  attachmentAsset?: { asset: { url: string } };
}
