# Guide: editing, writing and publishing your website

## Part 1. Fill in your details (do this first)

1. Open `src/config.ts`.
2. Fill in:
   - `githubUser`: your GitHub username (the part after `github.com/`)
   - `linkedin`: your full LinkedIn profile address
   - `email`: the address you want on the site
   - Check that `name`, `role` and `intro` say what you want.
3. Add your **photo**: save a square-ish picture as `public/photo.jpg`. Keep it under 500 KB. If you have no photo yet, an initials circle shows instead.
4. Add your **CV**: export it as a PDF and save it as `public/cv.pdf`. Before you do, check what the CV contains, because everything in it becomes public. Consider removing your home address and phone number.
5. Anything left empty in `config.ts` is simply hidden from the site.

## Part 2. See the site on your computer

In a terminal, in the `personal-website` folder:

```
npm install        # first time only
npm run dev
```

Open `http://localhost:4321`. Leave it running, edit a file, save, and the page refreshes. Press `Ctrl + C` to stop it.

## Part 3. Add or edit a project

Each project is one file in `src/content/projects/`. To add one, copy an existing file, rename it (the file name becomes the web address), and edit the top block and the text below it:

```
---
title: "Project title"
summary: "One or two sentences shown on the card."
status: live          # live, prototype or design
order: 7              # lower numbers appear first
tags: ["tag one", "tag two"]
live: "https://example.com"       # optional: link to the live demo
liveLabel: "Open live demo"       # optional: button text
repo: "my-repo-name"              # optional: GitHub repository name only
---

## Heading
Write the project description here in plain text.
```

Status meanings:
- **live**: running online and viewable
- **prototype**: working, but local or simulated
- **design**: designed and documented, not built

Add `repo:` only after that project's repository is public on GitHub. Otherwise the button would lead to a page that does not exist. The button also needs `githubUser` filled in.

To remove a project, delete its file.

## Part 4. Write a blog post

1. In `src/content/blog/`, copy `_post-template.md` and rename the copy, for example `what-i-learned-about-identity-resolution.md`.
2. Fill in the top block (`title`, `description`, `pubDate` as YYYY-MM-DD, `tags`) and write the post under it.
3. Set `draft: false` when you want it published. While `draft: true`, it stays hidden.
4. Save and check it in `npm run dev`.

Ideas if you do not know what to write:
- A problem you solved and how you approached it
- Something that went wrong and what you learned
- A concept explained simply (identity resolution, consent, RFM, attribution)
- What you built in a project, and the decision you are proudest of
- Short notes from a course, article or a talk

You do not need long posts. 300 to 600 words is enough.

## Part 5. Publish on GitHub Pages (free, no domain needed)

Your address will be `https://YOUR-USERNAME.github.io`.

### 5.1 Create the repository

1. Sign in at https://github.com.
2. Click **+**, then **New repository**.
3. **Repository name:** exactly `YOUR-USERNAME.github.io`, with your real username. A different name will not work for a main site.
4. Choose **Public**. Leave README, .gitignore and license unticked.
5. Click **Create repository**.

### 5.2 Upload the site with GitHub Desktop (recommended)

GitHub Desktop is a free app. It handles hidden files and signs you in safely, so there are no tokens to manage.

1. Install it from https://desktop.github.com and sign in with your GitHub account.
2. Choose **File, Add Local Repository**, and select the `personal-website` folder.
3. If it says the folder is not a repository, click **create a repository**. Keep the name `YOUR-USERNAME.github.io`, leave the rest as it is, and click **Create repository**.
4. In the list of changes, check that you do **not** see `node_modules`, `dist` or `.astro`. They are ignored automatically.
5. Type a summary such as `First version of my website`, click **Commit to main**, then **Publish repository**.
6. In the publish window, **untick** "Keep this code private" and confirm the name is `YOUR-USERNAME.github.io`. Click **Publish repository**.

### 5.3 Turn on GitHub Pages

1. On GitHub, open the repository, then **Settings**, then **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open the **Actions** tab. A run called "Deploy site to GitHub Pages" should be running. Wait for the green tick (about 1 to 2 minutes).
   - If it shows a red cross or did not run, open the run and click **Re-run all jobs**. This usually happens when the first push arrived before Pages was switched on.
4. Open `https://YOUR-USERNAME.github.io`.

### 5.4 Test it

Open the address in a private window and on your phone. Check that the photo, projects, blog, contact links and CV download all work. Click each project and each project's buttons.

## Part 6. Update the site later

Whenever you edit a file (a new blog post, a changed intro):

1. Open GitHub Desktop. It lists your changes.
2. Type a short summary, click **Commit to main**, then **Push origin**.
3. Wait 1 to 2 minutes, then refresh your site (Cmd + Shift + R).

You can also edit directly on GitHub. Open a file in the repository, click the pencil icon, edit, and click **Commit changes**. To add a blog post that way, use **Add file, Create new file** and type `src/content/blog/my-post.md` as the name.

## Part 7. How your other projects link into the site

Your project repositories publish their own pages under the same address. For example, the repository `composable-cdp-prototype` is served at `https://YOUR-USERNAME.github.io/composable-cdp-prototype/`. The composable project page on this site already links to that address, so once you publish that repository, the link works.

Keep each project in its own repository. This website only links to them.

## Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| Site shows a 404 | The repository is not named exactly `YOUR-USERNAME.github.io`, or Pages Source is not set to GitHub Actions. |
| Actions run failed | Open the run, read the error line, then click **Re-run all jobs**. If it still fails, copy the error and ask for help. |
| Old content still shows | Wait a minute, then hard refresh with Cmd + Shift + R. |
| The GitHub button is missing on a project | `githubUser` in `src/config.ts` is empty, or the project has no `repo:` line. |
| A blog post does not appear | It has `draft: true`, the date is wrong, or the file name starts with an underscore. |
| Build fails on your computer | Run `npm install`, then `npm run build`, and read the first error message. |
