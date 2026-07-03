/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */

// Each section: { key (url slug), label, fields: [ fieldSpec ] }.
// fieldSpec.type ∈ text | textarea | color | toggle | image | stringArray | array | json
// array fields carry itemFields: [{ key, type, label }] and an optional newItem().

export const SECTIONS = [
  {
    key: "site-metadata",
    label: "Site Metadata & SEO",
    fields: [
      { path: ["siteMetadata", "title"], type: "text", label: "Title" },
      { path: ["siteMetadata", "description"], type: "textarea", label: "Description" },
      { path: ["siteMetadata", "embeds", "color"], type: "color", label: "Embed color" },
      { path: ["siteMetadata", "embeds", "image"], type: "image", label: "Embed image" },
    ],
  },
  {
    key: "theme",
    label: "Global Theme",
    fields: [
      { path: ["global", "font"], type: "text", label: "Font (delius/roboto/audiowide/geist)" },
      { path: ["global", "gradient"], type: "text", label: "Gradient (hexA:hexB)" },
      { path: ["global", "background_image"], type: "image", label: "Background image" },
      { path: ["global", "background_image_secondary"], type: "image", label: "Background image (small)" },
      { path: ["global", "colors", "color-1"], type: "color", label: "Color 1" },
      { path: ["global", "colors", "color-2"], type: "color", label: "Color 2" },
      { path: ["global", "colors", "color-3"], type: "color", label: "Color 3" },
      { path: ["global", "colors", "color-4"], type: "color", label: "Color 4" },
      { path: ["global", "colors", "color-5"], type: "color", label: "Color 5" },
      { path: ["global", "custom_cursor", "enabled"], type: "toggle", label: "Custom cursor" },
      { path: ["global", "custom_cursor", "sparkles"], type: "toggle", label: "Cursor sparkles" },
    ],
  },
  {
    key: "resume",
    label: "Resume Button",
    fields: [
      { path: ["resume_button", "enabled"], type: "toggle", label: "Enabled" },
      { path: ["resume_button", "label"], type: "text", label: "Label" },
      { path: ["resume_button", "route"], type: "text", label: "Link (URL)" },
      { path: ["resume_button", "file"], type: "text", label: "File path" },
    ],
  },
  {
    key: "home",
    label: "Home",
    fields: [
      { path: ["pages", "home", "profile_image"], type: "image", label: "Profile image" },
      { path: ["pages", "home", "about_me"], type: "text", label: "Heading (about_me)" },
      { path: ["pages", "home", "description"], type: "textarea", label: "Description" },
      { path: ["pages", "home", "languages"], type: "stringArray", label: "Languages" },
      { path: ["pages", "home", "tools"], type: "stringArray", label: "Tools" },
      {
        path: ["pages", "home", "experience", "list"],
        type: "array",
        label: "Experience",
        newItem: () => ({ title: "", company: "", date: "", description: "", side: "left" }),
        itemFields: [
          { key: "title", type: "text", label: "Role title" },
          { key: "company", type: "text", label: "Company" },
          { key: "date", type: "text", label: "Date range" },
          { key: "description", type: "textarea", label: "Description" },
          { key: "side", type: "text", label: "Side (left/right)" },
        ],
      },
      { path: ["pages", "home", "aboutMe", "content"], type: "textarea", label: "About Me (long)" },
      { path: ["pages", "home", "github_stats", "enabled"], type: "toggle", label: "GitHub stats enabled" },
      { path: ["pages", "home", "github_stats", "username"], type: "text", label: "GitHub username" },
    ],
  },
  {
    key: "projects",
    label: "Project Cards",
    fields: [
      {
        path: ["cards"],
        type: "array",
        label: "Cards",
        newItem: () => ({ title: "", description: "", imageSRC: "", buttonText: "", buttonURL: "", badges: [] }),
        itemFields: [
          { key: "title", type: "text", label: "Title" },
          { key: "description", type: "textarea", label: "Description" },
          { key: "imageSRC", type: "image", label: "Image" },
          { key: "buttonText", type: "text", label: "Button text" },
          { key: "buttonURL", type: "text", label: "Button URL" },
          { key: "badges", type: "stringArray", label: "Badges" },
        ],
      },
    ],
  },
  {
    key: "project-pages",
    label: "Project Detail Pages",
    fields: [
      {
        path: ["pages", "custom"],
        type: "json",
        label:
          "Project detail pages (structured JSON: keyed by project, with content blocks, statistics, buttons)",
      },
    ],
  },
  {
    key: "contact",
    label: "Contact & Socials",
    fields: [
      { path: ["pages", "contact", "email"], type: "text", label: "Contact email" },
      {
        path: ["pages", "contact", "social_links"],
        type: "array",
        label: "Social links",
        newItem: () => ({ name: "", url: "", icon: "" }),
        itemFields: [
          { key: "name", type: "text", label: "Name" },
          { key: "url", type: "text", label: "URL" },
          { key: "icon", type: "text", label: "Icon (github/linkedin/twitter/instagram)" },
        ],
      },
      { path: ["pages", "contact", "legal", "name"], type: "text", label: "Legal name" },
      { path: ["pages", "contact", "legal", "address"], type: "text", label: "Legal address" },
      { path: ["pages", "contact", "legal", "email"], type: "text", label: "Legal email" },
      { path: ["pages", "contact", "legal", "phone"], type: "text", label: "Legal phone" },
    ],
  },
  {
    key: "connect",
    label: "Connect With Me (dropdown)",
    fields: [
      {
        path: ["pages", "Connect With Me", "items"],
        type: "array",
        label: "Links",
        newItem: () => ({ name: "", route: "" }),
        itemFields: [
          { key: "name", type: "text", label: "Name" },
          { key: "route", type: "text", label: "URL" },
        ],
      },
    ],
  },
  {
    key: "footer",
    label: "Footer",
    fields: [
      { path: ["footer", "text"], type: "text", label: "Footer text" },
      {
        path: ["footer", "links"],
        type: "array",
        label: "Footer links",
        newItem: () => ({ label: "", url: "" }),
        itemFields: [
          { key: "label", type: "text", label: "Label" },
          { key: "url", type: "text", label: "URL" },
        ],
      },
    ],
  },
  {
    key: "privacy",
    label: "Privacy Page",
    fields: [
      { path: ["pages", "privacy", "enabled"], type: "toggle", label: "Enabled" },
      { path: ["pages", "privacy", "header"], type: "text", label: "Header" },
      {
        path: ["pages", "privacy", "content", "sections"],
        type: "array",
        label: "Sections",
        newItem: () => ({ title: "", description: "", details: [] }),
        itemFields: [
          { key: "title", type: "text", label: "Title" },
          { key: "description", type: "textarea", label: "Description" },
          { key: "details", type: "stringArray", label: "Details" },
        ],
      },
    ],
  },
];

export function sectionByKey(key) {
  return SECTIONS.find((s) => s.key === key);
}
