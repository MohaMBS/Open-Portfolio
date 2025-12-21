// src/schemas/config.ts
import { z } from 'zod';

export const configSchema = z.object({
  site: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string(),
    url: z.url("Must be a valid URL (https://...)"),
    author: z.string(),
  }),

  data: z.object({
    cvFile: z.string().default("me"),
  }).default({
    cvFile: "me",
  }),

  i18n: z.object({
    defaultLocale: z.string().default("es"),
    locales: z.array(
      z.string().regex(/^[a-z]{2,3}(-[A-Z]{2,4})?$/, {
        message: "Must be a valid ISO code (e.g., 'en', 'es-ES', 'fr')"
      })
    ).min(1, "You must define at least one locale"),
    routing: z.object({
      prefixDefaultLocale: z.boolean().default(false),
    }),
  }),

  theme: z.object({
    name: z.string().min(1, "You must specify the theme name").default('minimal'),
    font: z.object({
      heading: z.string(),
      body: z.string(),
    }).optional(),
    colors: z.object({
      primary: z.string().regex(/^#/, "Must be a Hex code (e.g., #000000)"),
    }).optional(),
  }),

  features: z.object({
    enablePdfDownload: z.boolean().default(true),
    enableThemeSwitcher: z.boolean().default(true),
    security: z.object({
      restrictExternalScripts: z.boolean().default(true),
      allowedImagesDomains: z.array(z.string()).default([]),
    }),
  }),

  ui: z.object({
    fonts: z.object({
      googleFontsUrl: z.string().optional(),
      body: z.string().optional(),
      heading: z.string().optional(),
      mono: z.string().optional(),
    }).default({}),
  }),
});

//We create the TypeScript type based on the schema
export type PortfolioConfig = z.infer<typeof configSchema>;