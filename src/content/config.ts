import { defineCollection } from 'astro:content';
import { cvSchema } from '../schemas/cv'; // Reuse your master schema

const cvCollection = defineCollection({
    type: 'data', // Indicate it is JSON/YAML, not Markdown
    schema: () => cvSchema, // Astro will automatically validate this on build
});

export const collections = {
    'cv': cvCollection,
};