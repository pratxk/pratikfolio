/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation.
 */
import localFont from "next/font/local";
import Navbar from "@/components/custom/navbar";
import "@/app/styles/globals.css";
import "@/app/styles/card.css";
import "@/app/styles/blurred-img.css";
import { getConfig } from "@/lib/config-service.js";
import { ConfigProvider } from "@/context/config-context.jsx";
import Script from "next/script";

import CustomCursor from "@/components/custom/cursor";
import Footer from "@/components/custom/footer";
import Background from "@/components/custom/background";
import { Spotlight } from "@/components/ui/spotlight-new";
import ThemeProvider from "@/components/custom/theme_provider";

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
        <link rel="preconnect" href="https://img.shields.io"></link>
        <ConfigProvider value={config}>
          <Background />
        <div className="h-[60rem] w-full absolute overflow-hidden z-[-1] top-0 left-0 right-0 mt-0 pointer-events-none">
          <Spotlight />
        </div>
        {config.global.custom_cursor.enabled && <CustomCursor />}
        <Navbar />
        <main className="flex-1">
          <ThemeProvider>{children}</ThemeProvider>
        </main>
          <Footer config={config} />
        </ConfigProvider>
        <Script src="scripts/hover.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
