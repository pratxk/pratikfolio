/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation.
 */

import { notFound } from "next/navigation";
import { getConfig } from "@/lib/config-service.js";
import CustomPageLayout from "@/components/custom/custom_page_layout";

export async function generateStaticParams() {
  const config = await getConfig();
  const customPages = config.pages.custom || {};
  const params = [];

  Object.entries(customPages).forEach(([key, page]) => {
    if (page.enabled && page.route) {
      const slug = page.route.startsWith("/")
        ? page.route.slice(1).split("/")
        : page.route.split("/");
      params.push({ slug });
    }
  });

  return params;
}

export async function generateMetadata({ params }) {
  const config = await getConfig();
  const { slug } = await params;
  const route = `/${slug.join("/")}`;

  const customPages = config.pages.custom || {};
  const page = Object.values(customPages).find((p) => p.route === route);

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: `${page.title} - ${config.siteMetadata.title}`,
    description: page.description,
    openGraph: {
      title: page.meta_title,
      description: page.meta_description,
      images: page.images?.[0] ? [page.images[0]] : [],
    },
  };
}

export default async function CustomPage({ params }) {
  const config = await getConfig();
  const { slug } = await params;
  const route = `/${slug.join("/")}`;

  const customPages = config.pages.custom || {};
  const page = Object.values(customPages).find((p) => p.route === route);

  if (!page || !page.enabled) {
    notFound();
  }

  return <CustomPageLayout page={page} />;
}
