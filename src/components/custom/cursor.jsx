/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation.
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { useConfig } from "@/context/config-context.jsx";

const CustomCursor = () => {
  const config = useConfig();
  const [cursorType, setCursorType] = useState("default");
  const [isClicking, setIsClicking] = useState(false);
  const [cursorSize, setCursorSize] = useState(10);
  const isMobile = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(Date.now());
  const observerRef = useRef(null);
  const initRef = useRef(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const sparkleRef = useRef(null);

  const cursorMap = {
    default: "/cursor/normal.png",
    pointer: "/cursor/pointer.png",
    text: "/cursor/text.png",
  };

  const cursorClasses = {
    "c-cursor-pointer": "pointer",
    "c-cursor-text": "text",
    "c-cursor-custom": "custom",
  };

  useEffect(() => {
    const onResize = () => {
      isMobile.current = window.innerWidth <= 768;
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handleMove = (e) => {
      const newPos = { x: e.clientX, y: e.clientY };
      const now = Date.now();
      const dx = newPos.x - lastPosRef.current.x;
      const dy = newPos.y - lastPosRef.current.y;
      const dt = now - lastTimeRef.current;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;
      const base = 40,
        max = 100,
        min = 25,
        mul = 8;
      const size = Math.max(
        min,
        Math.min(max, base + Math.min(speed * mul, max - base)),
      );
      setCursorSize(size);

      mousePosRef.current = newPos;
      lastPosRef.current = newPos;
      positionRef.current = newPos;
      lastTimeRef.current = now;

      if (!initRef.current) {
        const style = document.createElement("style");
        style.innerHTML = `* { cursor: none !important; }`;
        document.head.appendChild(style);
        initRef.current = true;
      }
    };

    const handleClick = (e) => {
      if (config.global.custom_cursor.sparkles)
        createSparkle(e.clientX, e.clientY);
      setIsClicking(true);
      setTimeout(() => setIsClicking(false), 200);
    };

    const addListeners = () => {
      observerRef.current?.disconnect();
      const obs = new MutationObserver(() => {
        document.querySelectorAll("*").forEach((el) => {
          const cls = Object.keys(cursorClasses).find((c) =>
            el.classList.contains(c),
          );
          if (cls) {
            el.onmouseenter = () => setCursorType(cursorClasses[cls]);
            el.onmouseleave = () => setCursorType("default");
          }
        });
      });
      obs.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
      observerRef.current = obs;
    };

    if (typeof window !== "undefined" && !isMobile.current) {
      const init = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      mousePosRef.current = init;
      lastPosRef.current = init;
      positionRef.current = init;

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("click", handleClick);
      addListeners();
    }

    return () => {
      document.body.style.cursor = "default";
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("click", handleClick);
      observerRef.current?.disconnect();
    };
  }, []);

  const createSparkle = (x, y) => {
    if (!sparkleRef.current) return;
    const count = 6 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      const sp = document.createElement("div");
      sp.classList.add("sparkle");
      const s = 1 + Math.random() * 8;
      sp.style.width = `${s}px`;
      sp.style.height = `${s}px`;
      const ang = Math.random() * 2 * Math.PI;
      const d = 10 + Math.random() * 30;
      sp.style.setProperty("--translate-x", `${d * Math.cos(ang)}px`);
      sp.style.setProperty("--translate-y", `${d * Math.sin(ang)}px`);
      sp.style.left = `${x - s / 2}px`;
      sp.style.top = `${y - s / 2 + window.scrollY}px`;
      sparkleRef.current.appendChild(sp);
      setTimeout(() => sp.remove(), 1000);
    }
  };

  const wrapperStyle = {
    position: "fixed",
    left: `${positionRef.current.x - cursorSize / 2}px`,
    top: `${positionRef.current.y - cursorSize / 2}px`,
    width: `${cursorSize}px`,
    height: `${cursorSize}px`,
    pointerEvents: "none",
    zIndex: 9999,
    overflow: "visible",
  };

  const innerStyle = {
    width: "100%",
    height: "100%",
    backgroundImage: `url(${cursorMap[cursorType]})`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };

  const keyframes = `
    @keyframes cursor-click { 50% { transform: scale(0.8); } }
    @keyframes sparkle-move { to { transform: translate(var(--translate-x), var(--translate-y)); } }
    @keyframes sparkle-fade { to { opacity: 0; } }

    .cursor-inner.clicking { animation: cursor-click 0.2s ease-out; transform-origin: center; }
    .sparkle { position: absolute; background: white; border-radius: 50%; box-shadow: 0 0 8px rgba(255,255,255,0.8);
      animation: sparkle-move 0.6s ease-out forwards, sparkle-fade 0.6s ease-out forwards;
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={wrapperStyle}>
        <div
          className={`cursor-inner ${isClicking ? "clicking" : ""}`}
          style={innerStyle}
        />
      </div>
      <div ref={sparkleRef} className="sparkles-container" />
    </>
  );
};

export default CustomCursor;
