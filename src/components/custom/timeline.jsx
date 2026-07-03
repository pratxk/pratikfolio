/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation.
 */

"use client";

import { motion } from "framer-motion";
import { useConfig } from "@/context/config-context.jsx";
import { useRef, useEffect, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import { parseText } from "@/lib/parse_links";

const TimelineItem = ({ experience, animationDelay, isInView }) => {
  const config = useConfig();
  const [isMobile, setIsMobile] = useState(false);
  const isLeft = experience.side === "left";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        position: "relative",
        flexDirection: isMobile ? "column" : isLeft ? "row" : "row-reverse",
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: isLeft ? 50 : -50 }}
        animate={
          isInView
            ? {
                opacity: 1,
                x: 0,
                transition: { delay: animationDelay + 1, duration: 0.6 },
              }
            : {}
        }
        style={{
          width: isMobile ? "100%" : "50%",
          zIndex: 20,
          position: "relative",
          marginBottom: isMobile ? "2rem" : 0,
          ...(isMobile
            ? {}
            : isLeft
            ? {
                paddingRight: "2rem",
                textAlign: "left",
              }
            : {
                paddingLeft: "2rem",
                textAlign: "right",
              }),
        }}
      >
        <div
          className="group"
          style={{
            position: "relative",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            padding: isMobile ? "1rem" : "1.5rem",
            borderRadius: "0.5rem",
            transition: "all 500ms",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = `0 25px 50px -12px ${config.global.colors["color-1"]}33`;
            e.currentTarget.querySelector(".hover-gradient").style.opacity =
              "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.querySelector(".hover-gradient").style.opacity =
              "0";
          }}
        >
          <div
            className="hover-gradient"
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to bottom right, ${config.global.colors["color-1"]}1A, transparent, ${config.global.colors["color-3"]}1A)`,
              opacity: 0,
              transition: "opacity 500ms",
            }}
          />

          <div style={{ position: "relative", zIndex: 10 }}>
            <p
              className="c-cursor-text"
              style={{
                fontSize: "0.875rem",
                fontWeight: "normal",
                color: "rgb(156 163 175)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {experience.date}
            </p>
            <h4
              className="c-cursor-text"
              style={{
                fontSize: isMobile ? "1rem" : "1.125rem",
                color: "rgb(209 213 219)",
                marginBottom: "0.5rem",
              }}
            >
              {parseText(experience.company, config.global.gradient)}
            </h4>
            <h3
              className="c-cursor-text g"
              style={{
                fontSize: isMobile ? "1.25rem" : "1.5rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: "white",
              }}
            >
              {parseText(experience.title, config.global.gradient)}
            </h3>
            <p
              className="c-cursor-text"
              style={{
                color: "rgb(209 213 219)",
                lineHeight: "1.625",
              }}
            >
              {parseText(experience.description, config.global.gradient)}
            </p>
          </div>
        </div>
      </motion.div>

      {!isMobile && (
        <motion.div
          initial={{ width: 0 }}
          animate={
            isInView
              ? {
                  width: "2rem",
                  transition: { duration: 0.5, delay: animationDelay + 0.5 },
                }
              : {}
          }
          style={{
            position: "absolute",
            zIndex: 0,
            height: "4px",
            background: !isLeft
              ? `linear-gradient(to right, ${config.global.colors["color-1"]}, transparent)`
              : `linear-gradient(to right, transparent, ${config.global.colors["color-1"]})`,
            ...(isLeft ? { right: "50%" } : { left: "50%" }),
            boxShadow: `0 0 20px ${config.global.colors["color-1"]}80`,
          }}
        />
      )}
    </div>
  );
};

const Timeline = () => {
  const config = useConfig();
  const [isInView, setIsInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const element = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <TypeAnimation
        sequence={[100, config.pages.home.experience.title]}
        wrapper="h2"
        className="c-cursor-text"
        style={{
          fontSize: isMobile ? "2.25rem" : "3rem",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "5rem",
          background: "linear-gradient(to right, white, rgb(209 213 219))",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
        cursor={false}
        speed={1}
      />
      <div
        ref={ref}
        style={{
          position: "relative",
          maxWidth: "56rem",
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        {isInView && !isMobile && (
          <motion.div
            initial={{ height: 0 }}
            animate={{
              height: "calc(100% + 6.25rem)",
              transition: { duration: 2, delay: 0 },
            }}
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              width: "4px",
              borderRadius: "9999px",
              background: `linear-gradient(to bottom, ${config.global.colors["color-1"]}, ${config.global.colors["color-1"]})`,
              height: "calc(100% + 6.25rem)",
              top: "-3.125rem",
              boxShadow: `0 0 20px ${config.global.colors["color-1"]}80, 0 0 40px ${config.global.colors["color-3"]}4D`,
            }}
          />
        )}

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {config.pages.home.experience.list.map((experience, index) => (
            <TimelineItem
              key={index}
              experience={experience}
              animationDelay={index * 0.3}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
