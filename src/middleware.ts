// src/middleware.ts
import { defineMiddleware } from "astro/middleware";
import { config } from "../portfolio.config";

export const onRequest = defineMiddleware(async (context, next) => {
    // 1. Execute page rendering
    const response = await next();
    const html = await response.text();

    // 2. Prepare security rules based on your config
    const { allowedImagesDomains, restrictExternalScripts } = config.features.security;

    // Build the list of allowed domains
    const imgDomains = allowedImagesDomains.join(' ');
    const scriptPolicy = restrictExternalScripts
        ? "'self' 'unsafe-inline'" // Local scripts only
        : "'self' 'unsafe-inline' *"; // Dangerous, allows everything

    // Define Content Security Policy (CSP)
    const csp = [
        "default-src 'self'",
        `img-src 'self' data: ${imgDomains}`, // Your allowed domains
        `${scriptPolicy}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow Google Fonts
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self'", // Blocks fetch to weird sites
        "object-src 'none'",  // Blocks <embed> and <object>
        "base-uri 'self'"
    ].join('; ');

    // 3. AUTOMATIC INJECTION
    // As it is a static site (SSG), we inject a <meta> in the HTML
    // If it were SSR, we would use response.headers.set

    const secureHtml = html.replace(
        '<head>',
        `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`
    );

    // Return the modified and secure HTML
    return new Response(secureHtml, {
        status: response.status,
        headers: response.headers
    });
});