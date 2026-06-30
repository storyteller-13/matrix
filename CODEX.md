# CODEX.md

This file provides guidance to Codex when working with this repository.

## Project

marina OS — a personal website styled as a desktop operating system. Vanilla JS (no frameworks), single `index.html` page with modular application scripts. Deployed on Vercel.

## Installation

Clone the repo, then run `make install` (or `npm install`). This installs dependencies and sets up the Git pre-commit hook (Husky) so `npm test` runs before every commit. Skip hook: `git commit --no-verify`.

## Commands

- `make install` — npm install; also configures pre-commit to run tests
- `make server` — local dev server at http://localhost:8088 (python3 http.server)
- `make test` — run tests once (vitest)
- `make test-watch` — vitest in watch mode
- `make test-ui` — vitest with UI
- `make test-coverage` — vitest with coverage

## Architecture

### Desktop OS Pattern

Everything runs inside a single `index.html`. The page renders a desktop with a top panel (clock, app menu), draggable windows, and a dock. Each "application" is a JS class that manages its own window.

### Core System (`core/`)

- **env.js** — `window.Env`: `isLocalhost()`, `getApiBase(path)`.
- **base-app.js** — `BaseApp` class: shared window/dock open, close, fallback.
- **window-manager.js** — `WindowManager` class: window lifecycle + z-index + drag.
- **panel.js** — `Panel` class: top bar clock and applications menu.
- **protection.js** — IIFE that blocks right-click, dev-tool shortcuts, and image dragging (client-side only).

### API Layer (`api/`)

Vercel serverless functions with CORS + cache:

- `apod.js` — NASA APOD proxy
- `chess.js` — Chess.com daily puzzle proxy
- `xkcd.js` — XKCD comic proxy
- `ollama/[...path].js` — catch-all proxy to local Ollama

## Security missions

When making changes, preserve and improve these security goals:

1. **Keep strict response headers in place** (`Content-Security-Policy`, `Strict-Transport-Security`, `Permissions-Policy`, etc.) via `vercel.json`.
2. **Avoid exposing secrets in client-side code**. API keys must stay in server-side environment variables.
3. **Prefer same-origin API access in production** through `/api/*` proxies to reduce CORS and token leakage risks.
4. **Validate any new external script or iframe source** against CSP and limit origins to only what is required.
5. **Maintain test coverage for security behavior**, especially `tests/vercel-security-headers.test.js` and related config tests.

## File layout

- `index.html` — single page shell that loads styles and scripts in order.
- `core/` — env, base app, window manager, panel, protection.
- `applications/` — one folder per app.
- `styles/` — split CSS files.
- `api/` — Vercel serverless proxies.
- `tests/` — Vitest tests.
