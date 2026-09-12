import { defineField, defineType } from "sanity";

export const faqType = defineType({
  name: "faq",
  title: "FAQ Item",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Question", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "answer", title: "Answer", type: "text", validation: (rule) => rule.required() }),
    defineField({ name: "order", title: "Sort Order", type: "number", initialValue: 0 }),
  ],
});
