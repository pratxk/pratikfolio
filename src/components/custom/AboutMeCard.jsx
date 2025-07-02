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

const AboutMeCard = ({ delay = 0 }) => {
  const { aboutMe } = config.pages.home;

  if (!aboutMe?.enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="group relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 p-4 md:p-6 rounded-lg w-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white c-cursor-text text-center">
          {aboutMe.title}
        </h3>
        <p className="text-base md:text-lg text-white/90 text-justify">
          {aboutMe.content}
        </p>
      </div>
    </motion.div>
  );
};

export default AboutMeCard;
