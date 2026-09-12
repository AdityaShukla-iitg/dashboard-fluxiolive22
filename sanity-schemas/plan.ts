import { defineField, defineType } from "sanity";

export const planType = defineType({
  name: "plan",
  title: "Plan",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Plan Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "price", title: "Price Display (e.g. ₹6,000)", type: "string" }),
    defineField({ name: "postersIncluded", title: "Posters Included", type: "number", initialValue: 4 }),
    defineField({ name: "videosIncluded", title: "Videos Included", type: "number", initialValue: 1 }),
    defineField({ name: "revisionsIncluded", title: "Rounds of Revision", type: "number", initialValue: 2 }),
    defineField({
      name: "features",
      title: "Feature Bullet Points",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});
