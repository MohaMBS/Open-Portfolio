import type { PortfolioConfig } from './src/schemas/config';

/**
 * Main configuration for the portfolio.
 * Validated against the schema defined in src/schemas/config.
 */
export const config: PortfolioConfig = {
  site: {
    title: "Mohamed Developer",
    description: "Portfolio",
    url: "https://moha.dev", // If you put "hello", TS accepts it (it's a string), but the validator will fail
    author: "Mohamed B. S.",
  },
  data: {
    cvFile: "me",
  },
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: { prefixDefaultLocale: false }
  },
  theme: {
    name: "black-mesa", // If you set "futuristic", TS will give an immediate error thanks to the Enum
  },
  features: {
    enablePdfDownload: true,
    enableThemeSwitcher: true,
    security: {
      restrictExternalScripts: true,
      allowedImagesDomains: ["github.com", "upload.wikimedia.org"]
    }
  },
  ui: {
    fonts: {
      googleFontsUrl: "https://fonts.googleapis.com/css2?family=Lobster&family=Roboto:wght@400;700&display=swap",
      body: "'Roboto', sans-serif",
      heading: "'Lobster', cursive",
      mono: "'Fira Code', monospace"
    }
  }
};