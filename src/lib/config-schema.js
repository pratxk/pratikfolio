/**
 * Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0).
 */
import { z } from "zod";

const obj = z.object({}).passthrough();

export const configSchema = z
  .object({
    siteMetadata: obj,
    global: obj,
    resume_button: obj,
    footer: obj,
    pages: obj,
    card: obj,
    cards: z.array(obj),
  })
  .passthrough();
