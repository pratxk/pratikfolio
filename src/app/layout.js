/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 * Modifications Copyright (C) 2026 Pratik Singh — AGPL-3.0.
 */
import localFont from "next/font/local";
import "@/app/styles/globals.css";
import "@/app/styles/card.css";
import "@/app/styles/blurred-img.css";
import { getConfig } from "@/lib/config-service.js";
import { ConfigProvider } from "@/context/config-context.jsx";

const deliusFont = localFont({
  src: "./fonts/DeliusSwashCaps-Regular.ttf",
  variable: "--font-custom",
  weight: "100 900",
});

const robotoFont = localFont({
  src: "./fonts/Roboto-Medium.ttf",
  variable: "--font-custom",
  weight: "100 900",
});

const audiowideFont = localFont({
  src: "./fonts/Audiowide-Regular.ttf",
  variable: "--font-custom",
  weight: "100 900",
});

const geistFont = localFont({
  src: "./fonts/Geist-VariableFont_wght.ttf",
  variable: "--font-custom",
  weight: "100 900",
});

const fonts = {
  delius: deliusFont,
  roboto: robotoFont,
  audiowide: audiowideFont,
  geist: geistFont,
};

export async function generateMetadata() {
  const config = await getConfig();
  return {
    title: config.siteMetadata.title,
    description: config.siteMetadata.description,
    openGraph: {
      title: config.siteMetadata.title,
      description: config.siteMetadata.description,
      images: [{ url: config.siteMetadata.embeds?.image }],
    },
    twitter: {
      card: config.siteMetadata.embeds?.twitter_card || "summary_large_image",
      title: config.siteMetadata.title,
      description: config.siteMetadata.description,
      images: [config.siteMetadata.embeds?.image],
    },
    other: {
      "theme-color": config.siteMetadata.embeds?.color || "#ce6419",
    },
  };
}

export default async function RootLayout({ children }) {
  const config = await getConfig();
  const selectedFont = fonts[config.global.font] || deliusFont;

  return (
    <html lang="en">
      <body
        className={`${selectedFont.variable} min-h-screen antialiased flex flex-col overflow-x-hidden`}
      >
        <ConfigProvider value={config}>{children}</ConfigProvider>
      </body>
    </html>
  );
}
