# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A personal website styled as a desktop operating system. Vanilla JS (no frameworks), single `index.html` page with modular application scripts. Deployed on Vercel.

## Installation

Clone the repo, then run `make install` (or `npm install`). This installs dependencies and sets up the Git pre-commit hook (Husky) so `npm test` runs before every commit. Skip hook: `git commit --no-verify`.

## Commands

- `make install` — npm install; also configures pre-commit to run tests
- `make server` — local dev server at http://localhost:8088 (python3 http.server)
- `make test` — run tests once (vitest)
- `make test-watch` — vitest in watch mode
- `make test-ui` — vitest with UI
- `make test-coverage` — vitest with coverage

Tests: `tests/` (e.g. `window-manager.test.js`, `notes-storage.test.js`). Setup: `tests/setup.js`. Config: `vitest.config.js`. Pre-commit hook: `.husky/pre-commit` runs `npm test`.

## Architecture

### Desktop OS Pattern

Everything runs inside a single `index.html` (60KB). The page renders a desktop with a top panel (clock, app menu), draggable windows, and a dock. Each "application" is a JS class that manages its own window.

### Core System (`core/`)

- **env.js** — `window.Env`: `isLocalhost()`, `getApiBase(path)`. Central place for local vs production API choice. Load before apps.
- **base-app.js** — `BaseApp` class: shared window/dock open, close, fallback. Dock apps (home, notes, todo, artwork) extend it; tray/terminal do not.
- **window-manager.js** — `WindowManager` class: window lifecycle (open/close/minimize), z-index stacking, drag-by-header. Exposes `window.WindowManager` and `window.bringToFront`.
- **panel.js** — `Panel` class: top bar clock (HH:MM:SS), applications dropdown menu.
- **protection.js** — IIFE that blocks right-click, dev-tool shortcuts, and image dragging (client-side only).

### Applications (`applications/`)

12 self-contained app modules, each a class with `init()`, `open()`, `close()`, and `render()` methods. Classes are exposed on `window` for both global access and testing (e.g., `window.APODPanelClass`).

Apps with external data: **apod** (NASA API), **chess** (Chess.com), **xkcd** (XKCD), **music-player** (YouTube IFrame API).

Apps with local storage: **notes** (notes-storage.js), **todo** (todo-storage.js), **music-player** (music-player-storage.js). Storage modules expose `load()`, `save()`, `generateId()`, `getDefaultData()`. **Email** uses email-data.js only (in-memory, no persistence).

Simple apps: **home** (iframe wrapper), **artwork** (image lightbox), **quotes** (random quote display), **terminal** (simulated filesystem with ls/cd/cat/view commands).

### API Layer (`api/`)

Vercel serverless functions — all are CORS-enabled GET proxies with 1-hour cache + 24-hour stale-while-revalidate:

- `apod.js` — NASA APOD proxy. Uses `NASA_API_KEY` env var (falls back to DEMO_KEY).
- `chess.js` — Chess.com daily puzzle proxy.
- `xkcd.js` — XKCD comic proxy.
- `ollama/[...path].js` — Catch-all proxy to local Ollama server (`OLLAMA_URL` env var). Supports streaming NDJSON for model pulls and chat.

### Key Patterns

- **Environment-aware fetching**: Use `window.Env.isLocalhost()` (from env.js); localhost hits APIs directly, production uses `/api/` proxies to avoid CORS.
- **Resilient fetching**: XKCD tries 3 fallback CORS proxies; APOD serves stale cache on failure with background refresh.
- **24-hour localStorage caching** with timestamp validation (APOD, XKCD).
- **No build step**: all JS loads via `<script>` tags directly. No bundler, no transpiler.
- **Split CSS**: `styles/` has `base.css`, `panel.css`, `tray-boxes.css`, `music.css`, `desktop-icons.css`, `windows.css`, `dock.css`, `responsive.css`. Original single file kept as `styles.css` for reference.
- **Script load order** (in `index.html`): YouTube iframe API → `protection.js` → `env.js` → `base-app.js` → `window-manager.js` → `panel.js` → then app scripts (music-player-storage, music-player; todo-storage, todo; notes-storage, notes; quotes-data, quotes; xkcd; apod; chess; home; artwork; terminal-app, terminal). Env and BaseApp must load before any app that uses them.

## Styles

Styling is split under `styles/`. The visual theme is a dark desktop OS with neon green accents (#39ff14). Windows have macOS-style traffic light controls (close/minimize/maximize circles).

## File layout

- `index.html` — single page; links split CSS and loads all scripts in order.
- `core/` — env, base-app, window-manager, panel, protection.
- `applications/` — one folder per app (e.g. `notes/notes.js`, `notes/notes-storage.js`).
- `styles/` — split CSS files; `styles.css` is the legacy single file.
- `api/` — Vercel serverless proxies (apod, chess, xkcd, ollama).
- `tests/` — Vitest tests; run with `make test` or `npm run test:coverage`.
