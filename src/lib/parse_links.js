/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation.
 */

import { LinkPreview } from "@/components/ui/link-preview";

export function parseText(text, gradient = "#a27aff:#ff73d7") {
  const defaultGradient = gradient || "#a27aff:#ff73d7";
  const gradientColors = defaultGradient.split(":");

  const createGradientStyle = (colors) => ({
    background: `linear-gradient(to right, ${colors.join(", ")})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  });

  const parseSegment = (segment, keyPrefix = "") => {
    const parts = [];
    let currentIndex = 0;

    const patterns = [
      { regex: /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, type: "link" },

      { regex: /<gradient:([^>]+)>(.*?)<\/gradient>/g, type: "customGradient" },
      { regex: /<gradient>(.*?)<\/gradient>/g, type: "gradient" },
      {
        regex:
          /<(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|red|blue|green|yellow|purple|orange|pink|cyan|gray|black|white)>(.*?)<\/\1>/g,
        type: "color",
      },

      { regex: /<br\s*\/?>/g, type: "lineBreak" },

      { regex: /\*\*\*(.*?)\*\*\*/g, type: "boldItalic" },
      { regex: /\*\*(.*?)\*\*/g, type: "bold" },
      { regex: /\*(.*?)\*/g, type: "italic" },
      { regex: /__(.*?)__/g, type: "underline" },
      { regex: /~~(.*?)~~/g, type: "strikethrough" },
      { regex: /`([^`]+)`/g, type: "code" },
    ];

    const matches = [];
    patterns.forEach((pattern) => {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      while ((match = regex.exec(segment)) !== null) {
        matches.push({
          ...match,
          type: pattern.type,
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    });

    matches.sort((a, b) => a.start - b.start);

    const filteredMatches = [];
    let lastEnd = 0;
    matches.forEach((match) => {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    });

    filteredMatches.forEach((match, matchIdx) => {
      if (match.start > currentIndex) {
        const textBefore = segment.substring(currentIndex, match.start);
        if (textBefore) parts.push(textBefore);
      }

      const key = `${keyPrefix}-${match.type}-${matchIdx}`;

      switch (match.type) {
        case "link":
          parts.push(
            <LinkPreview
              className="text-white hover:text-violet-400 transition-colors"
              key={key}
              url={match[2]}
              newTab
            >
              {match[1]}
            </LinkPreview>,
          );
          break;

        case "lineBreak":
          parts.push(<br key={key} />);
          break;

        case "gradient":
          parts.push(
            <span key={key} style={createGradientStyle(gradientColors)}>
              {parseSegment(match[1], key)} {}
            </span>,
          );
          break;

        case "customGradient":
          const customColors = match[1].split(":");
          parts.push(
            <span key={key} style={createGradientStyle(customColors)}>
              {parseSegment(match[2], key)}
            </span>,
          );
          break;

        case "color":
          parts.push(
            <span key={key} style={{ color: match[1] }}>
              {parseSegment(match[2], key)}
            </span>,
          );
          break;

        case "boldItalic":
          parts.push(
            <strong key={key} style={{ fontStyle: "italic" }}>
              {parseSegment(match[1], key)}
            </strong>,
          );
          break;

        case "bold":
          parts.push(<strong key={key}>{parseSegment(match[1], key)}</strong>);
          break;

        case "italic":
          parts.push(<em key={key}>{parseSegment(match[1], key)}</em>);
          break;

        case "underline":
          parts.push(
            <span key={key} style={{ textDecoration: "underline" }}>
              {parseSegment(match[1], key)}
            </span>,
          );
          break;

        case "strikethrough":
          parts.push(
            <span key={key} style={{ textDecoration: "line-through" }}>
              {parseSegment(match[1], key)}
            </span>,
          );
          break;

        case "code":
          parts.push(
            <code
              key={key}
              className="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
            >
              {match[1]}
            </code>,
          );
          break;
      }

      currentIndex = match.end;
    });

    if (currentIndex < segment.length) {
      const remainingText = segment.substring(currentIndex);
      if (remainingText) parts.push(remainingText);
    }

    return parts.length === 1 && typeof parts[0] === "string"
      ? parts[0]
      : parts;
  };

  return parseSegment(text);
}

function parseAboutMe(text, gradientColors) {
  const [start, end] = gradientColors;
  return text.split("~~~").map((segment, idx) => {
    if (idx % 2 === 1) {
      return (
        <span
          key={idx}
          style={{
            background: `linear-gradient(to right, ${start}, ${end})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {segment}
        </span>
      );
    }
    return segment;
  });
}
