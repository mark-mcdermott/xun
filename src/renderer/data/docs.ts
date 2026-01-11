// Documentation structure and content for Xun

export interface DocSection {
  id: string;
  title: string;
  children?: DocSection[];
}

export interface DocPage {
  id: string;
  title: string;
  content: string;
}

// Tree structure for navigation
export const docsTree: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    children: [
      { id: 'overview', title: 'Overview' },
      { id: 'quick-start', title: 'Quick Start' },
    ],
  },
  {
    id: 'daily-notes',
    title: 'Daily Notes',
    children: [
      { id: 'daily-notes-intro', title: 'Introduction' },
      { id: 'calendar', title: 'Calendar Navigation' },
      { id: 'daily-shortcuts', title: 'Shortcuts' },
    ],
  },
  {
    id: 'tags',
    title: 'Tags',
    children: [
      { id: 'tag-syntax', title: 'Tag Syntax' },
      { id: 'tag-sections', title: 'Tag Sections' },
      { id: 'viewing-tags', title: 'Viewing Tagged Content' },
      { id: 'deleting-tags', title: 'Deleting Tagged Content' },
    ],
  },
  {
    id: 'blog-publishing',
    title: 'Blog Publishing',
    children: [
      { id: 'blog-overview', title: 'Overview' },
      { id: 'setting-up-blog', title: 'Setting Up a Blog' },
      { id: 'writing-posts', title: 'Writing Blog Posts' },
      { id: 'publishing', title: 'Publishing' },
      { id: 'multiple-blogs', title: 'Multiple Blogs' },
    ],
  },
  {
    id: 'cms',
    title: 'CMS Features',
    children: [
      { id: 'remote-posts', title: 'Remote Post Management' },
      { id: 'editing-posts', title: 'Editing Published Posts' },
      { id: 'drafts', title: 'Draft Management' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    children: [
      { id: 'vault-management', title: 'Vault Management' },
      { id: 'blog-config', title: 'Blog Configuration' },
      { id: 'github-setup', title: 'GitHub Setup' },
      { id: 'cloudflare-setup', title: 'Cloudflare Pages Setup' },
    ],
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    children: [
      { id: 'command-palette', title: 'Command Palette' },
      { id: 'navigation-shortcuts', title: 'Navigation' },
    ],
  },
];

// Documentation content
export const docPages: Record<string, DocPage> = {
  // Getting Started
  overview: {
    id: 'overview',
    title: 'Overview',
    content: `# Welcome to Xun

Xun is a lightweight desktop note-taking and journaling application for macOS. It's designed for a specific workflow: daily notes with tag-based organization and integrated blog publishing.

## Philosophy

Xun is opinionated and streamlined. Rather than trying to be everything to everyone, it focuses on doing a few things well:

- **Daily notes** as the primary way to capture thoughts
- **Tags** to organize and filter content across notes
- **One-click publishing** to your blog hosted on GitHub and Cloudflare Pages

## Key Features

### Mix Work and Personal Notes

Use tags to seamlessly mix different types of content in your daily notes. When you leave a job or finish a project, delete all content for that tag with just a couple of clicks.

### Blog from Your Notes

Write blog posts directly in your daily notes using a simple format. Publish them with one click to any of your configured blogs.

### Multiple Blogs

Xun supports multiple blogs. When you create a blog post, simply select which blog it should be published to.

### GitHub + Cloudflare Pages

Xun is built specifically for blogs hosted on GitHub and deployed via Cloudflare Pages. This opinionated approach means less configuration and a streamlined publishing experience.`,
  },

  'quick-start': {
    id: 'quick-start',
    title: 'Quick Start',
    content: `# Quick Start Guide

Get up and running with Xun in just a few minutes.

## 1. Create Your First Daily Note

Click the calendar icon in the left sidebar or use the "Today" button to create today's daily note. Start writing!

## 2. Add Tags to Organize Content

Add tags to your notes to organize content:

\`\`\`
#work

Meeting notes from standup...

---

#personal

Remember to call mom this weekend.
\`\`\`

## 3. Set Up a Blog (Optional)

If you want to publish blog posts:

1. Go to Settings (gear icon)
2. Click "Add Blog"
3. Enter your GitHub repository details
4. Optionally add Cloudflare Pages configuration

## 4. Write and Publish a Blog Post

In any daily note, create a blog post:

\`\`\`
===
---
title: "My First Post"
subtitle: "Getting started with Xun"
date: "2024-01-15"
tags: ["intro", "xun"]
---

This is my first blog post written in Xun!

===
\`\`\`

Click the publish icon next to the post to send it to your blog.`,
  },

  // Daily Notes
  'daily-notes-intro': {
    id: 'daily-notes-intro',
    title: 'Daily Notes Introduction',
    content: `# Daily Notes

Daily notes are the heart of Xun. Each day gets its own note, automatically named with the date (YYYY-MM-DD format).

## Why Daily Notes?

Daily notes provide a natural way to capture thoughts, tasks, and ideas as they happen. Instead of organizing by topic upfront, you write first and organize later with tags.

## Creating Daily Notes

Daily notes are created automatically when you navigate to a date. The file is saved in the \`daily-notes\` folder of your vault.

## Structure

A typical daily note might look like this:

\`\`\`markdown
# 2024-01-15

#work

- Finished the API refactor
- Code review for PR #123

---

#personal

- Call dentist for appointment
- Pick up groceries

---

#blog

===
---
title: "Working with APIs"
---
Today I learned about...
===
\`\`\`

The \`---\` separators divide content into tagged sections that can be viewed and managed independently.`,
  },

  calendar: {
    id: 'calendar',
    title: 'Calendar Navigation',
    content: `# Calendar Navigation

The calendar in the left sidebar provides quick access to any daily note.

## Using the Calendar

- **Click any date** to open that day's note (creates it if it doesn't exist)
- **Dots** under dates indicate existing notes
- **Today** is highlighted with a ring
- **Selected date** has a filled background

## Month Navigation

Use the arrow buttons at the top of the calendar to move between months. The current month and year are displayed in the header.

## Quick Actions

Below the calendar, you'll find quick action buttons:

- **Today** - Jump to today's note
- **Yesterday** - Open yesterday's note
- **Tomorrow** - Open tomorrow's note

These shortcuts make it easy to navigate between recent days without using the calendar.`,
  },

  'daily-shortcuts': {
    id: 'daily-shortcuts',
    title: 'Daily Note Shortcuts',
    content: `# Daily Note Shortcuts

Xun provides several ways to quickly access daily notes.

## Sidebar Buttons

The left sidebar includes quick access buttons:

- **Today** - Opens today's daily note
- **Yesterday** - Opens yesterday's note
- **Tomorrow** - Opens tomorrow's note

## Command Palette

Press **Cmd+K** (or **Ctrl+K**) to open the command palette, then type:

- "today" - Jump to today's note
- "yesterday" - Open yesterday's note
- "tomorrow" - Open tomorrow's note

## Calendar Icon

Click the calendar icon in the far-left sidebar to show the calendar view with all navigation options.`,
  },

  // Tags
  'tag-syntax': {
    id: 'tag-syntax',
    title: 'Tag Syntax',
    content: `# Tag Syntax

Tags in Xun use a simple format that's easy to type and read.

## Basic Format

Tags start with \`#\` followed by the tag name:

\`\`\`
#work
#personal
#blog
#project-alpha
\`\`\`

## Rules

- Tags must be on their own line
- Tag names can contain letters, numbers, and hyphens
- Tags are case-insensitive (\`#Work\` and \`#work\` are the same)
- Avoid spaces in tag names (use hyphens instead)

## Examples

\`\`\`markdown
#work

Today's tasks:
- Review pull requests
- Update documentation

---

#side-project

Ideas for the weekend project...
\`\`\``,
  },

  'tag-sections': {
    id: 'tag-sections',
    title: 'Tag Sections',
    content: `# Tag Sections

Content in Xun is organized into sections using tags and separators.

## Section Format

A section starts with a tag line and ends at the next separator (\`---\`) or end of file:

\`\`\`markdown
#work

This content belongs to the #work tag.
Multiple paragraphs are fine.

- Lists work too
- Everything until the separator

---

#personal

This is a different section with a different tag.
\`\`\`

## Multiple Tags in One File

You can have as many tagged sections as you want in a single file. This is perfect for daily notes where you mix different types of content.

## Separators

Use three or more hyphens on their own line to separate sections:

\`\`\`
---
\`\`\`

The separator marks the end of one section and prepares for the next.`,
  },

  'viewing-tags': {
    id: 'viewing-tags',
    title: 'Viewing Tagged Content',
    content: `# Viewing Tagged Content

Xun makes it easy to view all content associated with a specific tag across all your notes.

## Tag Browser

Click the Tags icon in the far-left sidebar to open the tag browser. You'll see a list of all tags used in your vault.

## Viewing a Tag

Click any tag to view all content sections tagged with it. The tag view shows:

- All sections from all files with that tag
- The source file path for each section
- Content sorted by date (oldest first)

## Editing in Tag View

You can edit content directly in the tag view. Changes are saved back to the original files.

## Navigation

Use the back and forward arrows to navigate between tag views, just like in a web browser.`,
  },

  'deleting-tags': {
    id: 'deleting-tags',
    title: 'Deleting Tagged Content',
    content: `# Deleting Tagged Content

One of Xun's most powerful features is the ability to delete all content for a tag at once.

## Use Case: Work/Personal Separation

Imagine you mix work notes into your daily notes alongside personal content. When you leave your job, you might want to remove all work-related content while keeping everything else.

With Xun, you can:

1. Open the tag view for \`#work\`
2. Click the delete button
3. Confirm the deletion
4. All work content is removed from all files

## How It Works

When you delete a tag's content:

- All sections tagged with that tag are removed from their files
- The tag line itself is removed
- Separators are cleaned up appropriately
- Other content in the same files is preserved

## Warning

**This action is permanent.** Content is deleted from the files, not moved to a trash folder. Make sure you have backups if you're unsure.

## Confirmation Dialog

Before deletion, you'll see a confirmation dialog showing:

- The number of sections that will be deleted
- The number of files that will be modified

Review this carefully before confirming.`,
  },

  // Blog Publishing
  'blog-overview': {
    id: 'blog-overview',
    title: 'Blog Publishing Overview',
    content: `# Blog Publishing Overview

Xun includes a built-in CMS for publishing blog posts to your GitHub-hosted blog.

## The Xun Approach

Xun is opinionated about blog infrastructure:

- **GitHub** for content storage
- **Cloudflare Pages** for hosting and deployment

This focused approach means less configuration and a streamlined experience.

## How It Works

1. Write blog posts in your daily notes using a special format
2. Click publish to send the post to GitHub
3. Cloudflare Pages automatically deploys your updated site

## Multiple Blogs

Xun supports multiple blogs. Configure each one in Settings, and when you publish a post, select which blog it should go to.

## Why This Approach?

- **No lock-in**: Your content lives in a standard Git repository
- **Version control**: Full history of all changes
- **Free hosting**: GitHub and Cloudflare Pages are free for most use cases
- **Fast**: Cloudflare's edge network delivers your content quickly`,
  },

  'setting-up-blog': {
    id: 'setting-up-blog',
    title: 'Setting Up a Blog',
    content: `# Setting Up a Blog

Before you can publish, you need to configure at least one blog in Xun.

## Prerequisites

You'll need:

1. A GitHub repository for your blog
2. A GitHub Personal Access Token with repo permissions
3. (Optional) A Cloudflare Pages project connected to your repository

## Adding a Blog

1. Open Settings (gear icon in the left sidebar)
2. Scroll to the Blogs section
3. Click "Add Blog"

## Configuration Fields

### Required

- **Blog Name**: A display name for this blog
- **Repository**: Your GitHub repo in \`username/repo\` format
- **Branch**: Usually \`main\`
- **Personal Access Token**: Your GitHub PAT
- **Backend Content Path**: Where posts are stored (e.g., \`src/content/posts/\`)
- **Filename Template**: How files are named (e.g., \`{slug}.md\`)

### Optional

- **Site URL**: Your blog's public URL
- **Live Post Path**: URL path to posts (e.g., \`/posts/\`)

### Cloudflare Pages (Optional)

- **Account ID**: From your Cloudflare dashboard
- **Project Name**: Your Cloudflare Pages project name
- **API Token**: Cloudflare API token

If configured, Xun will show deployment progress after publishing.`,
  },

  'writing-posts': {
    id: 'writing-posts',
    title: 'Writing Blog Posts',
    content: `# Writing Blog Posts

Blog posts in Xun are written using a special block format within your notes.

## Blog Block Format

Wrap your blog post in \`===\` markers with YAML frontmatter:

\`\`\`markdown
===
---
title: "Your Post Title"
subtitle: "An optional subtitle"
date: "2024-01-15"
tags: ["tag1", "tag2"]
---

Your post content goes here.

You can use **Markdown** formatting, including:

- Lists
- Links
- Images
- Code blocks

===
\`\`\`

## Frontmatter Fields

- **title** (required): The post title
- **subtitle** (optional): A subtitle or description
- **date** (optional): Publication date in YYYY-MM-DD format (defaults to today)
- **tags** (optional): An array of tags for the post

## Writing Tips

- Write your posts directly in daily notes
- The blog block can appear anywhere in your note
- Mix blog content with other tagged sections
- Preview your markdown formatting before publishing`,
  },

  publishing: {
    id: 'publishing',
    title: 'Publishing',
    content: `# Publishing Blog Posts

Once you've written a blog post, publishing is just one click away.

## Publishing a Post

1. Write your blog post using the \`===\` block format
2. Click the publish icon that appears next to the block
3. Select which blog to publish to (if you have multiple)
4. Watch the progress as your post is published

## What Happens During Publishing

1. **Content Preparation**: Your post is formatted with proper frontmatter
2. **GitHub Push**: The post is committed to your repository
3. **Deployment** (if configured): Cloudflare Pages builds and deploys your site

## Progress Tracking

During publishing, you'll see:

- A progress bar
- Status for each step
- The final URL of your published post

## Updating Posts

To update a published post:

1. Edit the blog block in your notes
2. Publish again
3. The existing file will be updated (not duplicated)

The slug (URL path) is generated from the post date and title. If you change the title, a new file will be created.`,
  },

  'multiple-blogs': {
    id: 'multiple-blogs',
    title: 'Multiple Blogs',
    content: `# Managing Multiple Blogs

Xun supports publishing to multiple blogs from the same vault.

## Adding Multiple Blogs

In Settings, you can add as many blogs as you need. Each blog has its own:

- GitHub repository
- Content path configuration
- Cloudflare Pages project (optional)

## Publishing to Different Blogs

When you publish a post, you'll be prompted to select which blog it should go to. This happens each time you publish, so you can direct different posts to different blogs.

## Use Cases

- **Personal and professional**: Separate blogs for different audiences
- **Different topics**: A tech blog and a personal blog
- **Multiple sites**: Manage content for several websites

## Tips

- Give your blogs clear, descriptive names
- Keep your access tokens organized
- Remember that each blog can have different frontmatter requirements`,
  },

  // CMS Features
  'remote-posts': {
    id: 'remote-posts',
    title: 'Remote Post Management',
    content: `# Remote Post Management

Xun can display and manage posts that are already published to your blogs.

## Viewing Remote Posts

In the file tree, you'll see a section for each configured blog showing its published posts. These are fetched from GitHub and cached locally.

## Refresh

Posts are automatically refreshed periodically. You can also manually refresh to see the latest content from GitHub.

## Organization

Remote posts are organized by blog, making it easy to see what's published where. Click any remote post to view and edit its content.`,
  },

  'editing-posts': {
    id: 'editing-posts',
    title: 'Editing Published Posts',
    content: `# Editing Published Posts

You can edit published posts directly in Xun without leaving the app.

## Opening a Published Post

Click any post in the remote posts section of the file tree. The content will be loaded from GitHub and displayed in the editor.

## Making Changes

Edit the content just like any other file. Your changes are saved locally as a draft until you publish.

## Publishing Updates

After editing, click the publish button to push your changes to GitHub. Xun tracks the file's SHA to ensure safe updates without conflicts.

## Conflict Detection

If someone else has modified the file on GitHub since you loaded it, Xun will warn you before overwriting their changes.`,
  },

  drafts: {
    id: 'drafts',
    title: 'Draft Management',
    content: `# Draft Management

When you edit a remote post, your changes are saved as a draft until published.

## How Drafts Work

- Drafts are stored in memory while the app is running
- The original content from GitHub is preserved
- You can see which posts have unsaved changes

## Important Note

**Drafts are not persisted.** If you close Xun before publishing, your draft changes will be lost. This is by design to keep the local/remote distinction clear.

## Best Practice

When editing remote posts:

1. Make your changes
2. Review them carefully
3. Publish immediately when ready
4. Don't leave unpublished drafts overnight`,
  },

  // Settings
  'vault-management': {
    id: 'vault-management',
    title: 'Vault Management',
    content: `# Vault Management

A vault is a folder on your computer where Xun stores your notes.

## Multiple Vaults

Xun supports multiple vaults, allowing you to:

- Separate work and personal notes completely
- Have different vaults for different projects
- Switch between contexts easily

## Adding a Vault

1. Open Settings
2. Click "Add Vault"
3. Select a folder on your computer

## Switching Vaults

Click on any vault in the list to switch to it. The app will reload with the new vault's content.

## Vault Contents

Each vault contains:

- \`daily-notes/\` - Your daily notes
- \`notes/\` - Other markdown files
- Configuration is stored separately (not in the vault)`,
  },

  'blog-config': {
    id: 'blog-config',
    title: 'Blog Configuration',
    content: `# Blog Configuration

Each blog in Xun needs to be configured with details about where and how to publish.

## Required Settings

### Blog Name
A friendly name for the blog, shown in the UI.

### Repository
Your GitHub repository in \`username/repo\` format.

### Branch
The branch to publish to (usually \`main\`).

### Personal Access Token
A GitHub PAT with \`repo\` scope. Keep this secret!

### Backend Content Path
Where in your repository blog posts are stored. For example:
- \`src/content/posts/\`
- \`content/blog/\`
- \`_posts/\`

### Filename Template
How post files are named. Use \`{slug}\` as a placeholder:
- \`{slug}.md\`
- \`{slug}/index.md\`

## Optional Settings

### Site URL
Your blog's public URL (e.g., \`https://myblog.com\`)

### Live Post Path
The URL path where posts appear (e.g., \`/posts/\` or \`/blog/\`)`,
  },

  'github-setup': {
    id: 'github-setup',
    title: 'GitHub Setup',
    content: `# GitHub Setup

Xun publishes to GitHub repositories. Here's how to set up the connection.

## Creating a Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Xun Blog Publishing")
4. Select the \`repo\` scope (full control of repositories)
5. Click "Generate token"
6. Copy the token immediately (you won't see it again!)

## Security Tips

- Never share your Personal Access Token
- Use a token specifically for Xun
- Consider using fine-grained tokens for better security
- Revoke tokens you no longer use

## Repository Setup

Your blog repository should:

- Have a content folder for posts
- Be connected to Cloudflare Pages (optional but recommended)
- Have your static site generator configured`,
  },

  'cloudflare-setup': {
    id: 'cloudflare-setup',
    title: 'Cloudflare Pages Setup',
    content: `# Cloudflare Pages Setup

Cloudflare Pages integration is optional but recommended for tracking deployments.

## Why Cloudflare Pages?

- Automatic deployments on push
- Global CDN for fast loading
- Free for most personal blogs
- Easy custom domain setup

## Configuration

To enable deployment tracking, you need:

### Account ID
Found in your Cloudflare dashboard URL or account settings.

### Project Name
The name of your Cloudflare Pages project (not your domain).

### API Token
A Cloudflare API token with Pages permissions.

## Creating an API Token

1. Go to Cloudflare Dashboard → My Profile → API Tokens
2. Click "Create Token"
3. Use the "Edit Cloudflare Pages" template or create custom
4. Select the specific account and project
5. Copy the token

## What This Enables

With Cloudflare configured, after publishing you'll see:

- Deployment status in real-time
- Build progress
- The final live URL of your post`,
  },

  // Keyboard Shortcuts
  'command-palette': {
    id: 'command-palette',
    title: 'Command Palette',
    content: `# Command Palette

The command palette provides quick access to files, tags, and actions.

## Opening the Palette

Press **Cmd+K** (macOS) or **Ctrl+K** (Windows/Linux) to open the command palette.

## Searching

Start typing to filter results. The palette searches:

- **Files**: All markdown files in your vault
- **Tags**: All tags with section counts
- **Actions**: New file, new folder, daily note shortcuts

## Navigation

- **Arrow keys**: Move selection up/down
- **Enter**: Open selected item
- **Escape**: Close the palette

## Categories

Results are grouped by category:

- **Daily**: Today, Yesterday, Tomorrow shortcuts
- **Files**: Your markdown files
- **Tags**: Available tags
- **Actions**: Create new items`,
  },

  'navigation-shortcuts': {
    id: 'navigation-shortcuts',
    title: 'Navigation Shortcuts',
    content: `# Navigation Shortcuts

Xun provides keyboard shortcuts for common navigation tasks.

## Global Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+K | Open command palette |
| Cmd+S | Save current file |
| Cmd+W | Close current tab |

## Editor Shortcuts

Standard text editing shortcuts work in the editor:

| Shortcut | Action |
|----------|--------|
| Cmd+B | Bold |
| Cmd+I | Italic |
| Cmd+Z | Undo |
| Cmd+Shift+Z | Redo |

## Navigation

- Click the **back arrow** to go to the previous view
- Click the **forward arrow** to go forward in history
- Use the **sidebar** to navigate between files and tags`,
  },
};

// Helper function to get all doc IDs for navigation
export function getAllDocIds(): string[] {
  const ids: string[] = [];

  function traverse(sections: DocSection[]) {
    for (const section of sections) {
      if (section.children) {
        traverse(section.children);
      } else {
        ids.push(section.id);
      }
    }
  }

  traverse(docsTree);
  return ids;
}

// Helper to find a doc's parent section
export function findParentSection(docId: string): string | null {
  for (const section of docsTree) {
    if (section.children?.some(child => child.id === docId)) {
      return section.id;
    }
  }
  return null;
}
