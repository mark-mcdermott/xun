# Xun Notes

> A lightweight desktop app for note-taking and blog publishing, inspired by Obsidian.

## What is Xun Notes?

A small Electron app that looks like Obsidian and has core note-taking functionality, without all the extra stuff Obsidian has. And it has a few nice extra features.

## Special Features

- A quick publish to blog post feature (for static site blogs with GitHub repos where the site is on Cloudflare Pages):
  - Even if you mix everything into daily notes, you can still quickly make a blog post in the middle and publish just the post, without publishing the rest of the note.
  - Can handle multiple blogs and let's you select which blog you want to publish each post to.
  - Shows a nice progress bar and publish status so you know if the build is still running and if it succeeds or not.
- New blogpost template macro
  - typing `===` and then pressing enter will create a blank blog post template where your cursor is. This includes frontmatter for post meta-information.
  - See [Blog Publishing Guide](#blog-publishing-guide) below for details.
- A delete all content under a single tag feature
  - You can mix all your work and personal notes into daily notes using tags to track of the different content types.
  - You can later easily delete all content from one tag. Handy if you ever leave your current job and need to quickly delete all work notes without losing any of your personal notes.

### Core Note Taking Features

- Daily notes (auto-created with YYYY-MM-DD format)
- Optional tag-based content blocks (opened by `#<topic>`, closed by `---`)
- Tag views (both editable and read-only aggregated views of all content under a tag)
- File tree sidebar
- Markdown editor with live rendering
- Split pane support for editing and previewing markdown at the same time

### Possible Future Features

- Custom emoji support
- More CMS feautres like list all posts and post edit/delete functionality
- Smoother UX with micro-interaction focus

## Blog Publishing Guide

Xun can publish blog posts directly to static site blogs hosted on GitHub with Cloudflare Pages deployment.

### Creating a Blog Post

Type `===` and press Enter to insert a blog post template:

```markdown
===
---
blog: ""
title: ""
description: ""
publishDate: "2026-01-03"
tags: [""]
---

Your blog content here...
===
```

### Frontmatter Fields

| Field | Description |
|-------|-------------|
| `blog` | Name of the blog to publish to (must match a blog configured in Settings) |
| `title` | Post title - also determines the filename (e.g., "My Post" → `my-post.md`) |
| `description` | Short description for SEO/previews |
| `publishDate` | Publication date in YYYY-MM-DD format (auto-filled with today's date) |
| `tags` | Array of tags for the post |
| `published` | Auto-set to `true` after successful publish |

### Tag Format

Tags use YAML array format with quoted strings:

```yaml
tags: ["javascript"]              # one tag
tags: ["js", "react"]             # two tags
tags: ["web development"]         # one multi-word tag
tags: ["how to", "tutorial"]      # two tags, first has a space
```

- Each quoted string is one tag
- Commas separate tags (spaces after commas are optional)
- Quotes preserve spaces for multi-word tags

### Publishing Workflow

1. **Write your post** inside the `=== ... ===` block
2. **Fill in the frontmatter** (blog name, title, etc.)
3. **Click the rocket icon** next to "blog post" header
4. **Watch the progress popup** - shows preparing, pushing, building, deploying
5. **Green checkmark appears** when published successfully

### Republishing

To update an already-published post:

1. Make your edits to the content
2. Click the **green checkmark** - it switches to a rocket icon
3. Click the **rocket** to republish
4. The post overwrites the previous version (same filename if title unchanged)

**Note:** If you change the title, a new file is created (old one remains).

### Two Publishing Methods

#### 1. Direct Publishing (Blog Block)

- Write a standalone post in a `=== ... ===` block
- Publish that exact content
- Best for: writing a complete blog post from scratch

#### 2. Tag-Based Publishing

- Tag sections across multiple daily notes with `#my-topic`
- Go to Tags sidebar → click the tag → click Publish
- All content tagged with `#my-topic` gets aggregated into one post
- Best for: collecting scattered notes/thoughts into a cohesive post

Example of tagged sections in daily notes:

```markdown
// In 2026-01-01.md
#my-project
Started building the authentication system today...
---

// In 2026-01-02.md
#my-project
Added OAuth support and fixed the login bug...
---

// In 2026-01-03.md
#my-project
Finished testing, ready for deployment.
---
```

Then publish all `#my-project` content as a single blog post from the tag view.

### Tag Section Format

For tag-based publishing, sections are delimited by:

- **Opening:** `#tag-name` on its own line
- **Closing:** `---` (three dashes) OR another `#tag` OR end of file

The `---` separator is optional if the tagged content goes to the end of the file.

## Tech Stack

- **Electron 39** - Desktop app framework
- **React 19** - UI components and state management
- **CodeMirror 6** - Markdown editor with live preview
- **Vite 7** - Build tool and dev server
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling (mixed with inline styles)
- **Playwright** - E2E testing

## Project Structure

```
xun-notes/
├── src/
│   ├── main/              # Electron main process
│   ├── renderer/          # React UI
│   └── preload/           # IPC bridge
├── tests/
│   └── e2e/               # E2E tests
├── .llm/                  # AI assistant context
└── dist/                  # Build output
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Package for macOS
npm run package
```

## AI Assistant Integration

This project includes LLM documentation in `.llm/` for AI coding assistants like Claude Code, GitHub Copilot, and Cursor.

Entry points (symlinks):

- `CLAUDE.md` - Claude Code
- `AGENTS.md` - GitHub Copilot

These files provide context about the project architecture, coding standards, and development workflows.

## Dev Process

I vibe-coded this in Claude Code in about a week's worth of evenings/weekends, using the Playwright MPC server to have Claude check its own work.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Status

Currently in a beta release phase. I want the UX "micro-interactions" to be cleaner before proper release.
