---
name: user-projects
description: List, connect to, and work with the user's other existing projects. Use when they name a project they already have, want to inspect or open one, or you need a project slug.
---

# User Projects

From this conversation you can find the user's existing projects, show them as cards, and connect into one to inspect or work with it. Scope is personal projects the user owns — org/team projects and projects shared with the user are not included.

Every cross-project callback takes the globally unique `<ownerSlug>/<slug>` form returned by `listProjects`.

## Available Functions

### listProjects({ search?, visibility?, count?, cursor? })

Lists projects the user owns. When the user names one of their projects, find its slug here first. `search` is a case-insensitive substring matched against title and description — prefer it over paging through everything. `visibility` filters to `"public"` or `"private"` (omit for both). `count` is the page size (default 10, max 100); pass a previous response's `nextCursor` back as `cursor` for the next page.

**Returns:** `{ projects, hasNextPage, nextCursor? }` — each project has `title`, `slug`, `ownerSlug`, `description?`, `language`, `isPrivate`, `timeCreated`, `timeUpdated`. `<ownerSlug>/<slug>` is the globally unique project slug every cross-project callback takes (for example the project-task callbacks).

### surfaceProjects({ projectSlugs })

Displays selected projects as cards in the user feed. Pass the globally unique `<ownerSlug>/<slug>` values returned by `listProjects`, in display order. The feed renders at most ten cards and the call rejects more, so curate rather than dump: when more projects match, surface the ten most relevant, mention that more matches exist, and offer to narrow with `search`.

### connectToProject({ slug })

Attaches file and shell tools to that project. Connecting to a different slug switches in one step. `disconnect({})` returns tools to this conversation's own environment.

Connecting surfaces the project's `replit.md` — collaborator-visible instructions and context for that project (and user preferences, when they live there) — in the execution transcript: full contents the first time, a short reminder when it is already in your context. Follow it while working in that project. Private, cross-project personal context belongs in the creator's `profile.md`, not in a project's `replit.md`.

```javascript
const { projects } = await listProjects({ search: "invoice" });
const projectSlug = `${projects[0].ownerSlug}/${projects[0].slug}`;
await surfaceProjects({ projectSlugs: [projectSlug] });
await connectToProject({ slug: projectSlug });
```
