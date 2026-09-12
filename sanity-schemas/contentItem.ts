import { defineField, defineType } from "sanity";

export const contentItemType = defineType({
  name: "contentItem",
  title: "Content Item",
  type: "document",
  fields: [
    defineField({ name: "client", title: "Client", type: "reference", to: [{ type: "client" }] }),
    defineField({ name: "month", title: "Month (YYYY-MM)", type: "string" }),
    defineField({ name: "date", title: "Date", type: "date" }),
    defineField({
      name: "assetType",
      title: "Asset Type",
      type: "string",
      options: { list: ["poster", "reel"] }
    }),
    defineField({ name: "driveLink", title: "Drive Link", type: "url" }),
    defineField({ name: "thumbnail", title: "Thumbnail Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "thumbnailLink", title: "Thumbnail Link (External fallback)", type: "url" }),
    defineField({ name: "caption", title: "Caption", type: "text" }),
    defineField({ name: "isPosted", title: "Marked as Posted", type: "boolean", initialValue: false })
  ]
});
