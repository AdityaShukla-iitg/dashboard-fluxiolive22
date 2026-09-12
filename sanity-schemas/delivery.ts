import { defineField, defineType } from "sanity";

export const deliveryType = defineType({
  name: "delivery",
  title: "Delivery / Content",
  type: "document",
  fields: [
    defineField({ name: "client", title: "Client", type: "reference", to: [{ type: "client" }], validation: (rule) => rule.required() }),
    defineField({ name: "month", title: "Month (e.g. 2026-09)", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "date", title: "Delivery Date", type: "date", validation: (rule) => rule.required() }),
    defineField({
      name: "assetType",
      title: "Asset Type",
      type: "string",
      options: { list: [{ title: "Poster", value: "poster" }, { title: "Video", value: "video" }] },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "driveUrl", title: "Google Drive URL", type: "url" }),
    defineField({ name: "thumbnail", title: "Thumbnail", type: "image", options: { hotspot: true } }),
    defineField({ name: "caption", title: "Caption", type: "text" }),
    defineField({ name: "sortOrder", title: "Sort Order", type: "number", initialValue: 0 }),
    defineField({ name: "published", title: "Published to Client", type: "boolean", initialValue: false }),
  ],
});
