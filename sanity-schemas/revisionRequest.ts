import { defineField, defineType } from "sanity";

export const revisionRequestType = defineType({
  name: "revisionRequest",
  title: "Revision Request",
  type: "document",
  fields: [
    defineField({ name: "client", title: "Client", type: "reference", to: [{ type: "client" }] }),
    defineField({ name: "contentItem", title: "Content Item", type: "reference", to: [{ type: "contentItem" }] }),
    defineField({ name: "message", title: "Message", type: "text" }),
    defineField({ name: "attachmentAsset", title: "Attachment", type: "file" }),
    defineField({ name: "createdAt", title: "Created At", type: "datetime" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["open", "resolved"] },
      initialValue: "open"
    })
  ]
});
