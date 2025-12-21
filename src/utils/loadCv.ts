// src/utils/loadCv.ts
import type { CV } from '../schemas/cv';
import { config } from '@/utils/config';
import { getEntry } from 'astro:content';

// ------------------------------------------------------------------
// 1. HELPERS (Validation, Translation, Security)
// ------------------------------------------------------------------

/**
 * Validates that configured languages exist in CV data.
 * Executed AFTER loading collection data.
 */
function validateLocales(cvData: CV) {
  const { locales, defaultLocale } = config.i18n;

  // Assume 'en' (or your JSON base language) is available
  const availableInJson = ['en'];

  // Look for translations in 'basics' section
  // Note: Using 'any' here temporarily because Zod makes i18n optional
  // and TypeScript can be very strict with deep access.
  const basics = cvData.basics as any;

  if (basics.i18n) {
    availableInJson.push(...Object.keys(basics.i18n));
  }

  const missingLocales = locales.filter(lang =>
    !availableInJson.includes(lang) && lang !== defaultLocale
  );

  if (missingLocales.length > 0) {
    console.error(`❌ CRITICAL CONFIG ERROR: Locales defined in config but missing in CV data: [ ${missingLocales.join(', ')} ]`);
    // We don't throw error to not break full build, but warn loudly.
    // If you prefer strict, uncomment next line:
    // throw new Error("Configuration mismatch: Missing translations in CV.");
  }
}

/**
 * Recursive function to apply translations.
 * Removes 'i18n' key after processing to clean final object.
 */
function translateObject(obj: unknown, lang: string): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => translateObject(item, lang));
  }

  if (typeof obj === 'object' && obj !== null) {
    // Shallow copy
    const result = { ...obj } as Record<string, unknown>;

    // Language replacement logic
    if ('i18n' in result && typeof result.i18n === 'object' && result.i18n !== null) {
      const i18nMap = result.i18n as Record<string, unknown>;
      if (lang in i18nMap) {
        Object.assign(result, i18nMap[lang]);
      }
      delete result.i18n; // Cleanup
    }

    // Recursion
    Object.keys(result).forEach(key => {
      result[key] = translateObject(result[key], lang);
    });

    return result;
  }
  return obj;
}

/**
 * Checks if a URL is in the whitelist of allowed domains.
 */
function isUrlAllowed(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return config.features.security.allowedImagesDomains.includes(url.hostname);
  } catch (e) {
    return false;
  }
}

/**
 * Traverses object and removes unauthorized images.
 */
function sanitizeCvData(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeCvData);
  }

  if (typeof obj === 'object' && obj !== null) {
    const result = { ...obj };

    Object.keys(result).forEach(key => {
      const value = result[key];

      // Image detection (keys containing 'image', 'img', 'avatar', 'cover')
      const isImageKey = key === 'image' || key.includes('img') || key === 'avatar' || key === 'cover';

      if (isImageKey && typeof value === 'string' && value.startsWith('http')) {
        if (!isUrlAllowed(value)) {
          console.warn(`⚠️ SECURITY ALERT: Blocked unauthorized image from: ${value}`);
          result[key] = undefined; // Remove value
        }
      } else {
        result[key] = sanitizeCvData(value); // Recursion
      }
    });
    return result;
  }
  return obj;
}

// ------------------------------------------------------------------
// 2. MAIN FUNCTION (Exported)
// ------------------------------------------------------------------

export async function loadCv(lang: string = config.i18n.defaultLocale): Promise<CV> {
  // 1. ASYNC Data Load from Astro Content Collections
  // Make sure your file is named 'src/content/cv/me.json' (or change 'me' to real name)
  const fileId = config.data.cvFile; // e.g., "alex"

  // 2. LOAD THAT SPECIFIC FILE
  const entry = await getEntry('cv', fileId);

  if (!entry) {
    throw new Error(`❌ CRITICAL: CV file not found. Looked for: 'src/content/cv/${fileId}.json'`);
  }

  const rawCv = entry.data; // Here Astro already validated schema with Zod

  // 2. Integrity Validation (Now that we have data, validate locales)
  validateLocales(rawCv);

  // 3. Processing (Translation and Sanitization)
  const translatedCv = translateObject(rawCv, lang);
  const sanitizedCv = sanitizeCvData(translatedCv);

  // Force CV type because recursion returns 'unknown' or 'any'
  return sanitizedCv as CV;
}