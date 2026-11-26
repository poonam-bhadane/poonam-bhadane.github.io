import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One Markdown file per project in src/content/projects/
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    // live = running and viewable online, prototype = working but local or simulated, design = designed and documented
    status: z.enum(['live', 'prototype', 'design']),
    order: z.number().default(100), // lower numbers appear first
    tags: z.array(z.string()).default([]),
    live: z.string().optional(), // link to the live demo (full URL, or a path like /my-demo/)
    liveLabel: z.string().default('Open live demo'),
    repo: z.string().optional(), // GitHub repository name only, e.g. composable-cdp-prototype
    // true = the tile opens the `live` link directly, with no project page in between
    directLink: z.boolean().default(false),
  }),
});

// One Markdown file per post in src/content/blog/
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false), // draft posts are hidden from the live site
  }),
});

export const collections = { projects, blog };
