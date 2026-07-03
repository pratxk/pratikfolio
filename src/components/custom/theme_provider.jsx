/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation.
 */

"use client";

import { useEffect } from "react";
import { useConfig } from "@/context/config-context.jsx";

export default function ThemeProvider({ children }) {
  const config = useConfig();
  useEffect(() => {
    const colors = config.global.colors || {};

    const root = document.documentElement;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, []);

  return <>{children}</>;
}
