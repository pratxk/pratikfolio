/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 * Modifications Copyright (C) 2026 Pratik Singh — AGPL-3.0.
 *
 * Chrome for the public site (navbar, background, footer). The /admin routes
 * live outside this group so they render without the portfolio shell.
 */
import Script from "next/script";
import Navbar from "@/components/custom/navbar";
import CustomCursor from "@/components/custom/cursor";
import Footer from "@/components/custom/footer";
import Background from "@/components/custom/background";
import { Spotlight } from "@/components/ui/spotlight-new";
import ThemeProvider from "@/components/custom/theme_provider";
import { getConfig } from "@/lib/config-service.js";

export default async function SiteLayout({ children }) {
  const config = await getConfig();
  return (
    <>
      <link rel="preconnect" href="https://img.shields.io" />
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
      <Script src="scripts/hover.js" strategy="afterInteractive" />
    </>
  );
}
