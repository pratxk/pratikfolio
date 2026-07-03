/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation.
 */

"use client";

import { Card } from "@/components/custom/card/card";
import { useState, useEffect, useMemo } from "react";
import { useConfig } from "@/context/config-context.jsx";
import { TextAnimate } from "@/components/magicui/text-animate";

export default function Projects() {
  const config = useConfig();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const headerText = config.pages.projects.header;
  const cards = useMemo(() => config.cards, []);

  return (
    <div className="container mx-auto px-4 py-4">
      <TextAnimate
        animation="blurInUp"
        by="character"
        duration={1.5}
        className="c-cursor-text text-4xl font-bold text-center uppercase mb-[2.5rem]"
      >
        {headerText}
      </TextAnimate>

      <div className="flex flex-wrap justify-center items-start gap-5 mb-[2.5rem]">
        {cards.map(
          (
            { title, description, imageSRC, buttonText, buttonURL, badges },
            index,
          ) => (
            <div
              key={title ?? index}
              className={`backdrop-blur-[1px] opacity-0 ${
                isMounted ? "animate-pop_in" : ""
              }`}
              style={{
                animationDelay: `${index * 200}ms`,
                animationFillMode: "forwards",
              }}
            >
              <Card
                title={title}
                description={description}
                imageSRC={imageSRC}
                buttonText={buttonText}
                buttonURL={buttonURL}
                badges={badges}
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}
