/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation.
 */

"use client";

import { useConfig } from "@/context/config-context.jsx";
import Scroller from "@/components/custom/scroller";

export default function TechScroller() {
  const config = useConfig();
  const homeConfig = config.pages.home;

  return (
    <div className="w-full">
      <div className="grid place-content-center h-20">
        <Scroller
          items={[...homeConfig.languages, ...homeConfig.tools]}
          direction="left"
          speed="fast"
          className="max-w-lg"
          itemClasses="bg-white/10"
        />
      </div>
    </div>
  );
}
