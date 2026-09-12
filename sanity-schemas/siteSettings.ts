import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Website Content",
  type: "document",
  fields: [
    defineField({
      name: "heroHeading",
      title: "Hero Heading",
      type: "string",
      initialValue: "We make creatives, posts, videos.",
    }),
    defineField({
      name: "heroSubheading",
      title: "Hero Subheading",
      type: "string",
      initialValue: "Use them however you want.",
    }),
    defineField({
      name: "heroCtaText",
      title: "Hero Button Text",
      type: "string",
      initialValue: "Get your creatives.",
    }),
    defineField({
      name: "problemBadge",
      title: "Problem Section Badge",
      type: "string",
      initialValue: "The Problem",
    }),
    defineField({
      name: "problemHeading",
      title: "Problem Section Heading",
      type: "string",
      initialValue: "NOBODY WHO RUNS A SHOP HAS TIME FOR THIS.",
    }),
    defineField({
      name: "problemDescription",
      title: "Problem Section Subtext",
      type: "text",
      initialValue: "Cafe, restaurant, jewellery store, doesn't matter. You're too busy running the place to also run the Instagram.",
    }),
    defineField({
      name: "contactHeading",
      title: "Contact Section Heading",
      type: "string",
      initialValue: "Let's Talk",
    }),
    defineField({
      name: "contactSubheading",
      title: "Contact Section Subheading",
      type: "string",
      initialValue: "Serious enquiries get a creative review.",
    }),
    defineField({
      name: "contactEmail",
      title: "Primary Contact Email",
      type: "string",
      initialValue: "adityashukla@fluxio.live",
    }),
    defineField({
      name: "footerTagline",
      title: "Footer Tagline",
      type: "string",
      initialValue: "Based in India. Operating globally.",
    }),
  ],
});
