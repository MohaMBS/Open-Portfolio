import { z } from 'zod';

/**
 * I18N HELPER
 * Wraps any schema to add nested translation support.
 * Allows each object to have an optional 'i18n' field with partial overrides.
 */
function withI18n<T extends z.ZodRawShape>(schemaObj: T) {
  const schema = z.object(schemaObj);
  return schema.extend({
    i18n: z.record(
      z.string(), // Language key (e.g., "es", "en")
      schema.partial() // Allows defining only changed fields (e.g., only translate summary)
    ).optional(),
  });
}

// --- SUB-SCHEMAS ---
const LocationSchema = z.object({
  city: z.string().optional(),
  countryCode: z.string().optional(),
  region: z.string().optional(),
});

const ProfileSchema = z.object({
  network: z.string(),
  username: z.string(),
  url: z.url().optional(),
  icon: z.string().optional(), // For custom icon mapping
});

// --- MAIN SECTIONS ---
const BasicsSchema = withI18n({
  name: z.string(),
  label: z.string(), // "Full Stack Developer"
  image: z.string().optional(),
  email: z.email(),
  phone: z.string().optional(),
  url: z.url().optional(),
  summary: z.string().optional(),
  location: LocationSchema.optional(),
  profiles: z.array(ProfileSchema).optional(),
});

const WorkSchema = withI18n({
  name: z.string(),
  position: z.string(),
  url: z.url().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"), // Strict date validation
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD").optional().nullable(), // Null for "Present"
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(), // List of achievements
});

const EducationSchema = withI18n({
  institution: z.string(),
  url: z.url().optional(),
  area: z.string(),
  studyType: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  score: z.string().optional(),
  courses: z.array(z.string()).optional(),
});

const SkillsSchema = withI18n({
  name: z.string(), // E.g., "Frontend"
  level: z.string().optional(), // E.g., "Master"
  keywords: z.array(z.string()), // E.g., ["React", "Astro", "Tailwind"]
});

const ProjectsSchema = withI18n({
  name: z.string(),
  isActive: z.boolean().default(true),
  description: z.string(),
  highlights: z.array(z.string()).optional(),
  url: z.url().optional(),
  github: z.url().optional(), // Developer specific field
  roles: z.array(z.string()).optional(), // What you did there
  entity: z.string().optional(), // If it was for a company or hackathon
  keywords: z.array(z.string()).optional(),
});

// --- MASTER SCHEMA ---

export const cvSchema = z.object({
  basics: BasicsSchema,
  work: z.array(WorkSchema).optional(),
  education: z.array(EducationSchema).optional(),
  projects: z.array(ProjectsSchema).optional(),
  skills: z.array(SkillsSchema).optional(),
  languages: z.array(withI18n({
    language: z.string(),
    fluency: z.string(),
  })).optional(),
  // Internal framework metadata
  meta: z.object({
    version: z.string().default("1.0.0"),
    lastModified: z.string().optional(),
  }).optional()
});

// Automatically inferred TypeScript types for use in components
export type CV = z.infer<typeof cvSchema>;