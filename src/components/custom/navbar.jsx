/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import config from "/CONFIG.json";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./button";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const pathname = usePathname();
  const dropdownRefs = useRef({});
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const toggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleMouseEnter = (pageName) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setOpenDropdown(pageName);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleDropdownMouseLeave = () => {
    setOpenDropdown(null);
  };

  const handleResumeDownload = (filePath) => {
    const link = document.createElement("a");
    link.href = filePath;
    link.download = filePath.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCustomNavbarPages = () => {
    const customPages = config.pages.custom || {};
    return Object.entries(customPages)
      .filter(([, pageConfig]) => pageConfig.enabled && pageConfig.navbar)
      .map(([pageName, pageConfig]) => [pageName.toLowerCase(), pageConfig]);
  };

  const enabledPages = [
    ...Object.entries(config.pages).filter(
      ([key, pageConfig]) => key !== "custom" && pageConfig.enabled,
    ),
    ...getCustomNavbarPages(),
  ];

  const isExternalLink = (url) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const isPageActive = (pageConfig) => {
    if (pageConfig.dropdown) {
      return pageConfig.items.some((item) => pathname === item.route);
    }
    return pathname === pageConfig.route;
  };

  const ExternalLinkIcon = () => (
    <svg
      className="inline w-3 h-3 ml-1 opacity-70"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );

  const renderLink = (href, children, className, isDropdownItem = false) => {
    const isExternal = isExternalLink(href);

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {children}
          <ExternalLinkIcon />
        </a>
      );
    }

    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  };

  return (
    <nav
      className={cn(
        "z-50 sticky top-0 transition-all duration-300",
        isScrolled
          ? "md:bg-white/5 md:backdrop-blur-md md:py-5"
          : "md:bg-transparent md:py-5",
        "bg-transparent py-4",
      )}
    >
      <div className="max-w-7xl mx-auto px-[1rem] relative">
        {/* Desktop menu */}
        <ul className="hidden md:flex justify-center items-center">
          {enabledPages.map(([pageName, pageConfig]) => {
            const isActive = isPageActive(pageConfig);

            if (pageConfig.dropdown) {
              return (
                <li
                  key={pageName}
                  className="mx-4 relative"
                  ref={(el) => (dropdownRefs.current[pageName] = el)}
                  onMouseEnter={() => handleMouseEnter(pageName)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={cn(
                      "c-cursor-pointer flex items-center text-center font-medium transition-all duration-300 px-4 py-2 rounded-md",
                      "text-white",
                      isActive || openDropdown === pageName
                        ? "text-secondary brightness-150"
                        : "hover:text-secondary hover:bg-white/5",
                    )}
                  >
                    <motion.span
                      initial={false}
                      animate={{ y: isActive ? -3 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      style={{ display: "inline-block" }}
                    >
                      {pageName.charAt(0).toUpperCase() + pageName.slice(1)}
                    </motion.span>
                    <motion.svg
                      animate={{ rotate: openDropdown === pageName ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-1 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-underline"
                        initial={false}
                        className="absolute bottom-0 left-0 right-0 bg-secondary"
                        style={{ height: "2px" }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {openDropdown === pageName && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-56 dropdown-menu rounded-lg border border-white/10 shadow-lg overflow-hidden"
                        onMouseEnter={handleDropdownMouseEnter}
                        onMouseLeave={handleDropdownMouseLeave}
                      >
                        {pageConfig.items.map((item, index) => (
                          <div key={item.route || item.name}>
                            {renderLink(
                              item.route,
                              item.name,
                              cn(
                                "flex items-center px-4 py-3 text-white font-medium transition-all duration-300 rounded-md",
                                pathname === item.route
                                  ? "brightness-150 bg-white/5 hover:scale-[102%]"
                                  : "hover:bg-white/5 hover:scale-[102%]",
                                index === 0
                                  ? "border-t-0"
                                  : "border-t border-white/5",
                              ),
                              true,
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            }

            return (
              <li key={pageName} className="mx-4 relative">
                {renderLink(
                  pageConfig.route,
                  <>
                    <motion.span
                      initial={false}
                      animate={{ y: isActive ? -3 : 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      style={{ display: "inline-block" }}
                    >
                      {pageConfig.name
                        ? pageConfig.name
                        : pageName.charAt(0).toUpperCase() + pageName.slice(1)}
                    </motion.span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-underline"
                        initial={false}
                        className="absolute bottom-0 left-0 right-0 bg-secondary"
                        style={{ height: "2px" }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </>,
                  cn(
                    "c-cursor-pointer flex items-center text-center font-medium transition-all duration-300 px-4 py-2 rounded-md relative",
                    "text-white",
                    isActive
                      ? "text-secondary brightness-150"
                      : "hover:text-secondary hover:bg-white/5",
                  ),
                )}
              </li>
            );
          })}
        </ul>

        {/* Mobile menu */}
        <div className="md:hidden">
          <div className="fixed top-4 right-4 z-50 rounded-lg bg-black/30 backdrop-blur-[2px] p-2">
            <button
              onClick={toggleMenu}
              className="flex flex-col justify-center items-center w-6 h-6 space-y-1.5 z-60"
            >
              <span
                className={cn(
                  "w-full h-0.5 bg-white transition-all duration-300",
                  isMobileMenuOpen
                    ? "rotate-45 translate-y-2"
                    : "rotate-0 translate-y-0",
                )}
              />
              <span
                className={cn(
                  "w-full h-0.5 bg-white transition-all duration-300",
                  isMobileMenuOpen ? "opacity-0" : "opacity-100",
                )}
              />
              <span
                className={cn(
                  "w-full h-0.5 bg-white transition-all duration-300",
                  isMobileMenuOpen
                    ? "-rotate-45 -translate-y-2"
                    : "rotate-0 translate-y-0",
                )}
              />
            </button>
          </div>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40">
              <div
                className="absolute inset-0 bg-black/90"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="relative flex flex-col justify-center items-center h-full">
                <ul className="space-y-6">
                  {enabledPages.map(([pageName, pageConfig]) => {
                    const isActive = isPageActive(pageConfig);

                    if (pageConfig.dropdown) {
                      return (
                        <li key={pageName} className="w-60">
                          <div className="space-y-2">
                            <div
                              className={cn(
                                "px-4 py-2 rounded-md border border-white/10 bg-white/5 backdrop-blur-xl",
                                "text-white font-medium text-center w-60 text-lg",
                                isActive ? "brightness-150" : "",
                              )}
                            >
                              {pageName.charAt(0).toUpperCase() +
                                pageName.slice(1)}
                            </div>
                            {pageConfig.items.map((item) => (
                              <div key={item.route || item.name}>
                                {renderLink(
                                  item.route,
                                  item.name,
                                  cn(
                                    "flex items-center justify-center px-4 py-2 rounded-md border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300",
                                    "text-white/80 text-center w-60 text-base ml-4 font-medium",
                                    pathname === item.route
                                      ? "brightness-150 bg-white/10"
                                      : "hover:bg-white/10",
                                  ),
                                )}
                              </div>
                            ))}
                          </div>
                        </li>
                      );
                    }

                    return (
                      <li key={pageName} className="w-60">
                        {renderLink(
                          pageConfig.route,
                          pageConfig.name
                            ? pageConfig.name
                            : pageName.charAt(0).toUpperCase() +
                                pageName.slice(1),
                          cn(
                            "c-cursor-pointer flex items-center justify-center px-4 py-2 rounded-md border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300",
                            "text-white font-medium text-center w-60 mb-2 text-lg",
                            isActive ? "brightness-150" : "hover:bg-white/10",
                          ),
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        {config.resume_button?.enabled && (
          <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2">
            <Button
              as="button"
              href={config.resume_button.route}
              onClick={() => handleResumeDownload(config.resume_button.file)}
              variant={
                config.resume_button.style === "primary"
                  ? "primary"
                  : "secondary"
              }
              className="font-medium px-4 py-2 md:text-lg md:px-5 md:py-2.5 xl:px-6 xl:py-3"
            >
              {config.resume_button.label}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
