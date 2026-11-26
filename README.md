# Personal portfolio website

A static portfolio site built with [Astro](https://astro.build), hosted free on GitHub Pages.

- **Home:** intro, photo, project cards, latest blog posts, contact details and CV download
- **Projects:** one page per project, written as a Markdown file
- **Blog:** one page per post, written as a Markdown file

## Quick start

```
npm install
npm run dev
```

Then open the address it prints (usually `http://localhost:4321`). The page updates as you edit files.

To check the production build: `npm run build`.

## Where things are

| What you want to change | File or folder |
|---|---|
| Name, intro, LinkedIn, email, GitHub username | `src/config.ts` |
| Photo | `public/photo.jpg` |
| CV | `public/cv.pdf` |
| A project | `src/content/projects/` (one `.md` file each) |
| A blog post | `src/content/blog/` (one `.md` file each) |
| Colours and fonts | `src/styles/global.css` |

Full instructions, including publishing, are in [`docs/GUIDE.md`](docs/GUIDE.md).
