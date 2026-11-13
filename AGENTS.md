# Agent guide

## Start here

Read `README.md` for setup and the project map. This is a static browser app with native ES modules, not a bundled frontend. There is no build command.

## Change conventions

- Keep runtime imports in `main.js` complete and ordered: shared core first, then data/storage before dependent apps. `tests/main-entry.test.js` checks completeness and ordering.
- Follow the neighboring app's structure and tests before introducing a new pattern. Shared browser classes and modules are often exposed on `window` because the static HTML wires them together.
- Keep `service-worker.js`'s `APP_SHELL` list aligned with local runtime assets. Do not cache `/api/` responses there; app-level code owns freshness and stale-data behavior.
- Preserve existing local-storage keys and serialized shapes unless deliberately migrating user data.
- Use relative URLs for same-origin site assets and keep Vercel route behavior consistent with `vercel.json`.

## Validation

- Run a focused test with `npx vitest run tests/<file>.test.js` after a behavior change.
- Run `npm run lint` and `npm test` before handing off broad changes when practical.
- `npm test` includes coverage and can take several seconds. No external network is required.
- For HTML-only changes, inspect the affected markup and verify referenced IDs against the relevant app module/tests.

## Boundaries

- Avoid adding dependencies or build tooling for changes that native modules can handle.
- Do not reformat the large `index.html` wholesale; make localized edits.
- Do not change deployment, API contracts, or persisted user data formats without explaining the impact.
