---
name: Auto-Documentation Tracker
description: MANDATORY BEHAVIORAL MANDATE. Automatically maintain system overview documentation and bug tracking protocols. Trigger on: any bug fix, new feature, architectural change, or repository initialization.
---

# Auto-Documentation Tracker

When working in a repository that contains documentation tracking (like `docs/bug_tracker.md` or `docs/system_overview.md`), you are explicitly required to act as the primary documentarian and technical writer. 

## Operational Mandates

1. **Self-Documenting Code Tasks:**
   - At the successful conclusion of ANY task where you fix a complex bug, you MUST autonomously open `docs/bug_tracker.md` and append a structured log.
   - You do NOT require the USER to ask you to do this. Consider it a strict `post-commit` hook of your own thought process.

2. **Format of Bug Entries:**
   - `Status`: ✅ Resolved / ⚠️ Won't Fix
   - `Date Recorded`: YYYY-MM-DD
   - `Description`: The visceral behavior the user reported.
   - `Root Cause`: Why the runtime failed.
   - `Fix Implemented`: The exact files touched and architectural approach.

3. **System Overviews:**
   - If your newly implemented feature shifts the macro-architecture of the system (e.g., migrating from one-off `setTimeout` intervals to a continuous native `setInterval` loop), you MUST natively navigate to `docs/system_overview.md` (or the `README.md` fallback) and rewrite the corresponding sections so the documentation exactly matches your codebase state.

4. **Bootstrapping Docs:**
   - If the user instructs you to initialize a brand new repo, autonomously generate the `docs/` folder alongside the `src/` folder, pre-populating a `bug_tracker.md` and `system_overview.md` to establish world-class engineering hygiene instantly.
