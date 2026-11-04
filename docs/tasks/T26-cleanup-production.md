# T26 Code cleanup and production preparation

Goal: remove leftovers and prepare a clean production build.
Read first: AGENTS.md.
Files: any file with verified leftovers; docs/ as needed.
Scope: obsolete implementations, duplicate logic, unused assets, abandoned components, temporary debug code, redundant configuration, unnecessary dependencies, outdated documentation, stale workarounds. Verify references before deleting. No unrelated refactoring.
Done when:
- No known obsolete implementation remains without a documented reason.
- No unnecessary dependencies.
- Documentation matches the implementation.
- npm run check and npm run build pass.
Do not touch: working architecture without cause.
