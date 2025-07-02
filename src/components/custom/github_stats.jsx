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
import config from "/CONFIG.json";
import { useRef, useEffect, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import GitHubCalendar from "react-github-calendar";

const StatCard = ({ title, children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="group relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 p-4 md:p-6 rounded-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <h3 className="text-lg md:text-xl font-bold mb-4 text-white c-cursor-text">
          {title}
        </h3>
        {children}
      </div>
    </motion.div>
  );
};

const GitHubStats = () => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);
  const { github_stats } = config.pages.home;

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

  if (!github_stats.enabled) return null;

  return (
    <div className="py-12" ref={ref}>
      <TypeAnimation
        sequence={[100, github_stats.title]}
        wrapper="h2"
        className="text-4xl md:text-5xl c-cursor-text font-bold text-center mb-12 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
        cursor={false}
        speed={1}
      />

      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <StatCard delay={0.6} title="GitHub Stats">
            <img
              src="https://github-readme-stats.vercel.app/api?username=pratxk&theme=default&hide_border=false&include_all_commits=true&count_private=true"
              alt="GitHub Stats"
              className="w-full rounded-lg"
              loading="lazy"
            />
          </StatCard>

          <StatCard delay={0.8} title="Top Languages">
            <img
              src="https://github-readme-stats.vercel.app/api/top-langs/?username=pratxk&theme=default&hide_border=false&include_all_commits=true&count_private=true&layout=compact"
              alt="Top Languages"
              className="w-full rounded-lg"
              loading="lazy"
            />
          </StatCard>

          <StatCard delay={1.0} title="GitHub Streak">
            <img
              src="https://github-readme-streak-stats.herokuapp.com/?user=pratxk&theme=default&hide_border=false"
              alt="GitHub Streak"
              className="w-full rounded-lg"
              loading="lazy"
            />
          </StatCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <StatCard delay={1.2} title="GitHub Activity">
            <div className="flex justify-center">
              {/* Outer fixed-size wrapper with overflow hidden to avoid scrollbars */}
              <div className="w-full max-w-4xl overflow-hidden">
                <div className="transition-transform duration-300 group-hover:scale-105">
                  {/* <img
                    src={`https://github-readme-activity-graph.vercel.app/graph?username=${github_stats.username}&theme=github-dark&bg_color=00000000&color=ffffff&line=8b5cf6&point=a855f7&area=true&hide_border=true`}
                    alt="GitHub Activity Graph"
                    className="w-full rounded-lg"
                    loading="lazy"
                  /> */}
                  <GitHubCalendar username={github_stats.username}/>
                </div>
              </div>
            </div>
          </StatCard>
        </motion.div>
      </div>
    </div>
  );
};

export default GitHubStats;
