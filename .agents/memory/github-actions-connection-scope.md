---
name: GitHub Actions write scope
description: Replit GitHub connections can read and show repo push permissions while rejecting writes that include GitHub workflow files.
---

The Replit GitHub connection may report a healthy account with `repo` OAuth scope and repository-level `push/admin` permissions, while Git and GraphQL writes involving `.github/workflows` are rejected. A connection that exposes the separate `workflow` authorization scope is required before retrying this kind of push.

**Why:** Repeated reconnects changed the error but did not add the missing workflow write authorization; repeated pushes do not repair the credential.

**How to apply:** Before pushing commits that add or edit GitHub Actions workflows, inspect the OAuth scopes and stop if `workflow` is absent. Do not alter Vercel or Supabase as a workaround.