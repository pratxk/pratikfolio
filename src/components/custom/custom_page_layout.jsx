/**
 * Portfolio
 * Copyright (C) 2025 Maxim (https://github.com/maximjsx/portfolio)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { parseText } from "@/lib/parse_links";
import { useConfig } from "@/context/config-context.jsx";
import {
  X,
  Download,
  Server,
  Globe,
  Users,
  Activity,
  MessageCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import Button from "./button";
import { TextAnimate } from "@/components/magicui/text-animate";
import { useEffect } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const imagePreviewVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

const imageSlideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  }),
};

const statisticVariants = {
  hidden: { opacity: 0 },
  visible: (i) => ({
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 0.61, 0.36, 1],
      delay: 0.1 + i * 0.08,
    },
  }),
};

export default function CustomPageLayout({ page }) {
  const config = useConfig();
  const {
    title,
    description,
    images = [],
    content = [],
    tags = [],
    buttons = [],
    statistics,
    layout = "default",
  } = page;

  const [selectedImage, setSelectedImage] = useState(null);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return;

      if (e.key === "ArrowLeft") {
        goToPreviousImage();
      } else if (e.key === "ArrowRight") {
        goToNextImage();
      } else if (e.key === "Escape") {
        closeImagePreview();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedImage]);

  const openImagePreview = (image, index) => {
    setSelectedImage({ src: image, index });
  };

  const closeImagePreview = () => {
    setSelectedImage(null);
  };

  const goToPreviousImage = () => {
    if (selectedImage && selectedImage.index > 0) {
      setDirection(-1);
      setSelectedImage({
        src: images[selectedImage.index - 1],
        index: selectedImage.index - 1,
      });
    }
  };

  const goToNextImage = () => {
    if (selectedImage && selectedImage.index < images.length - 1) {
      setDirection(1);
      setSelectedImage({
        src: images[selectedImage.index + 1],
        index: selectedImage.index + 1,
      });
    }
  };

  const getStatIcon = (key, iconName) => {
    const iconMap = {
      servers_using: Server,
      servers: Server,
      downloads: Download,
      platforms: Globe,
      registered: Users,
      peak: TrendingUp,
      discord: MessageCircle,
      activity: Activity,
      users: Users,
      members: Users,
      clock: Clock
    };

    const IconComponent = iconName
      ? iconMap[iconName] || iconMap[key] || Activity
      : iconMap[key] || Activity;

    return <IconComponent className="w-5 h-5" />;
  };

  const isNewFormat = (stats) => {
    return (
      stats &&
      Object.values(stats).some(
        (stat) => typeof stat === "object" && stat.title && stat.value,
      )
    );
  };

  const renderStatistics = () => {
    if (!statistics) return null;

    const statsEntries = Object.entries(statistics);
    const newFormat = isNewFormat(statistics);
    const statsCount = statsEntries.length;

    const getGridCols = (count) => {
      if (count === 1) return "grid-cols-1";
      if (count === 2) return "grid-cols-1 sm:grid-cols-2";
      if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    };

    return (
      <motion.div variants={itemVariants} className="mb-10">
        <div className={cn("grid gap-4", getGridCols(statsCount))}>
          {statsEntries.map(([key, stat], index) => {
            if (newFormat) {
              const { title, description, value, icon, color } = stat;

              return (
                <motion.div
                  key={key}
                  custom={index}
                  variants={statisticVariants}
                  className="group relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-white/8 to-white/4 border border-white/10 backdrop-blur-sm hover:from-white/12 hover:to-white/6 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={cn(
                        "flex-shrink-0 p-2 rounded-lg transition-colors duration-300",
                        color === "blue"
                          ? "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30"
                          : color === "green"
                          ? "bg-green-500/20 text-green-400 group-hover:bg-green-500/30"
                          : color === "purple"
                          ? "bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30"
                          : color === "orange"
                          ? "bg-orange-500/20 text-orange-400 group-hover:bg-orange-500/30"
                          : "bg-secondary/20 text-secondary group-hover:bg-secondary/30",
                      )}
                    >
                      {getStatIcon(key, icon)}
                    </div>
                    <div className="c-cursor-text text-right">
                      <p className="text-xl sm:text-2xl font-bold text-white group-hover:text-white/90 transition-colors duration-300">
                        {value}
                      </p>
                    </div>
                  </div>

                  <div className="c-cursor-text space-y-1">
                    <h4 className="font-semibold text-white text-sm group-hover:text-white/90 transition-colors duration-300">
                      {title}
                    </h4>
                    {description && (
                      <p className="text-xs text-muted-foreground leading-relaxed group-hover:text-muted-foreground/80 transition-colors duration-300">
                        {description}
                      </p>
                    )}
                  </div>

                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full group-hover:from-white/10 transition-all duration-300" />

                  {/* Bottom accent line */}
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      color === "blue"
                        ? "bg-blue-400"
                        : color === "green"
                        ? "bg-green-400"
                        : color === "purple"
                        ? "bg-purple-400"
                        : color === "orange"
                        ? "bg-orange-400"
                        : "bg-secondary",
                    )}
                  />
                </motion.div>
              );
            }
          })}
        </div>
      </motion.div>
    );
  };

  const renderContent = (contentItem, index) => {
    switch (contentItem.type) {
      case "text":
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            className="c-cursor-text prose prose-lg prose-invert max-w-none"
          >
            <p className="text-muted-foreground leading-relaxed">
              {parseText(contentItem.content, config.global.gradient)}
            </p>
          </motion.div>
        );

      case "features":
        return (
          <motion.div key={index} variants={itemVariants} className="space-y-4">
            <h3 className="c-cursor-text text-2xl font-bold text-white">
              {contentItem.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentItem.items.map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="c-cursor-text p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/8 transition-all duration-300"
                >
                  <p className="text-white font-medium">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case "posts":
        return (
          <motion.div key={index} variants={itemVariants} className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Recent Posts</h3>
            <div className="grid gap-6">
              {contentItem.posts.map((post, idx) => (
                <motion.article
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  className="p-6 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <h4 className="text-xl font-semibold text-white">
                      {post.title}
                    </h4>
                    <p className="text-muted-foreground">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <time className="text-sm text-muted-foreground">
                        {new Date(post.date).toLocaleDateString()}
                      </time>
                      <div className="flex gap-2">
                        {post.tags.map((tag, tagIdx) => (
                          <span
                            key={tagIdx}
                            className="px-2 py-1 text-xs rounded-full bg-secondary/20 text-secondary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <motion.div
        className="container mx-auto px-4 lg:px-8 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <TextAnimate
              animation="blurInUp"
              by="character"
              duration={1.5}
              className="c-cursor-text text-4xl font-bold text-center uppercase glow mb-[2.5rem]"
            >
              {title}
            </TextAnimate>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {parseText(description, config.global.gradient)}
            </p>
          </motion.div>

          {renderStatistics()}

          {/* Images Grid */}
          {images.length > 0 && (
            <motion.div variants={itemVariants} className="mb-12">
              <div
                className={cn(
                  "grid gap-4",
                  images.length === 1
                    ? "grid-cols-1"
                    : images.length === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                )}
              >
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-white/5 c-cursor-pointer group"
                    onClick={() => openImagePreview(image, index)}
                  >
                    <Image
                      src={image}
                      alt={`${title} image ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/40 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="p-2 rounded-full bg-white/20">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {buttons && buttons.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  href={button.route || button.link}
                  variant={button.style === "primary" ? "primary" : "secondary"}
                  className="font-medium px-4 py-2 md:text-lg md:px-5 md:py-2.5 xl:px-6 xl:py-3"
                >
                  {button.label}
                </Button>
              ))}
            </motion.div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="flex justify-center mb-12"
            >
              <div className="flex flex-wrap gap-2 justify-center">
                {tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-medium c-cursor-text"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Content Sections */}
          <motion.div variants={containerVariants} className="space-y-12">
            {content.map(renderContent)}
          </motion.div>
        </div>
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence mode="wait">
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={closeImagePreview}
            />

            {/* Close Button */}
            <button
              onClick={closeImagePreview}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Arrow */}
            {images.length > 1 && (
              <button
                onClick={goToPreviousImage}
                disabled={selectedImage.index === 0}
                className={cn(
                  "absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full transition-all duration-200",
                  selectedImage.index === 0
                    ? "bg-white/5 text-white/30 c-cursor-default"
                    : "bg-white/10 text-white hover:bg-white/20 hover:scale-110 c-cursor-pointer",
                )}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Arrow */}
            {images.length > 1 && (
              <button
                onClick={goToNextImage}
                disabled={selectedImage.index === images.length - 1}
                className={cn(
                  "absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full transition-all duration-200",
                  selectedImage.index === images.length - 1
                    ? "bg-white/5 text-white/30 c-cursor-default"
                    : "bg-white/10 text-white hover:bg-white/20 hover:scale-110 c-cursor-pointer",
                )}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image Container */}
            <motion.div
              className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center"
              variants={imagePreviewVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="relative max-w-full max-h-full overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={selectedImage.index}
                    custom={direction}
                    variants={imageSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="relative"
                  >
                    <Image
                      src={selectedImage.src}
                      alt={`${title} preview ${selectedImage.index + 1}`}
                      width={1920}
                      height={1080}
                      className="max-w-full max-h-[90vh] object-contain rounded-lg"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-sm backdrop-blur-sm">
                {selectedImage.index + 1} / {images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
