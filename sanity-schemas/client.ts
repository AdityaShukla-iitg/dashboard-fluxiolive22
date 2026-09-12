import { defineField, defineType } from "sanity";

export const clientType = defineType({
  name: "client",
  title: "Client",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
    defineField({
      name: "plan",
      title: "Plan",
      type: "string",
      options: { list: ["Silver", "Gold", "Premium", "Custom"] }
    }),
    defineField({ name: "postersIncluded", title: "Posters Included", type: "number" }),
    defineField({ name: "videosIncluded", title: "Videos Included", type: "number" }),
    defineField({ name: "revisionsIncluded", title: "Revisions Included", type: "number" }),
    defineField({ name: "passwordHash", title: "Password Hash", type: "string", hidden: true }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["active", "paused"] },
      initialValue: "active"
    })
  ]
});
