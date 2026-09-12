import { createClient } from "@sanity/client";
import bcrypt from "bcrypt";

const client = createClient({
  projectId: "6cycexy8",
  dataset: "production",
  apiVersion: "2024-03-01",
  useCdn: false,
  token: "skhI9A4IB9jj8N1ljaD0BtDLNkUTtNO0Js7BLFez9iMYdi2OyZobZHPJKnpS7QbeHOmNcDayUBlNja1Fr42TsS1SqiyejyRlx6FuoG81JHThyPqyayd8sWHKxQxiysmA7a5c3BTRmALkWzC6YzU0DFZTkSafCk8Ubdalfd68E3cllXXuqh8N",
});

async function run() {
  console.log("Hashing client password...");
  const password = "password123";
  const passwordHash = await bcrypt.hash(password, 10);

  console.log("Checking existing client acme...");
  const existing = await client.fetch(`*[_type == "client" && slug.current == "acme"][0]`);
  
  let clientId;
  if (existing) {
    console.log("Updating existing client acme...");
    await client.patch(existing._id).set({
      name: "Acme Studio",
      plan: "Gold",
      postersIncluded: 8,
      videosIncluded: 4,
      revisionsIncluded: 3,
      passwordHash: passwordHash,
      status: "active"
    }).commit();
    clientId = existing._id;
  } else {
    console.log("Creating client acme...");
    const newDoc = await client.create({
      _type: "client",
      name: "Acme Studio",
      slug: { _type: "slug", current: "acme" },
      plan: "Gold",
      postersIncluded: 8,
      videosIncluded: 4,
      revisionsIncluded: 3,
      passwordHash: passwordHash,
      status: "active"
    });
    clientId = newDoc._id;
  }

  console.log("Client created/updated with ID:", clientId);

  // Check if content exists
  const existingContent = await client.fetch(`*[_type == "contentItem" && client._ref == $clientId]`, { clientId });
  if (existingContent.length === 0) {
    console.log("Creating sample deliverables...");
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const dateStr1 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-10`;
    const dateStr2 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-08`;

    await client.create({
      _type: "contentItem",
      client: { _type: "reference", _ref: clientId },
      month: currentMonth,
      date: dateStr1,
      assetType: "poster",
      driveLink: "https://drive.google.com",
      thumbnailLink: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
      caption: "Unveiling the new standard in everyday essentials. Minimal footprint, maximum character. Built for the modern rhythm.\n\nShop the drop at fluxio.live\n#D2C #Minimalism #ModernLiving"
    });

    await client.create({
      _type: "contentItem",
      client: { _type: "reference", _ref: clientId },
      month: currentMonth,
      date: dateStr1,
      assetType: "reel",
      driveLink: "https://drive.google.com",
      thumbnailLink: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80",
      caption: "Motion design snippet for Instagram Reels / TikTok launch. Audio synced to 128 BPM.\n\nTrack: Midnight Pulse\nHook in first 1.2s."
    });

    await client.create({
      _type: "contentItem",
      client: { _type: "reference", _ref: clientId },
      month: currentMonth,
      date: dateStr2,
      assetType: "poster",
      driveLink: "https://drive.google.com",
      thumbnailLink: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
      caption: "Weekend capsule drop. High contrast monochrome typography.\n\nLive on Sunday 6 PM IST."
    });
  }

  console.log("Seeding complete!");
}

run().catch(console.error);
