import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { describe, it, expect, vi } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(root, 'service-worker.js'), 'utf8');
const appShell = [...source.matchAll(/^\s{4}'(\/[^']+)',?$/gm)].map((match) => match[1]);

function createWorker(cachesApi = {}) {
    const listeners = {};
    const worker = {
        location: { origin: 'https://matrix.test' },
        clients: { claim: vi.fn() },
        skipWaiting: vi.fn(),
        addEventListener: (name, listener) => { listeners[name] = listener; },
    };
    const sandbox = {
        self: worker,
        caches: { open: vi.fn(), keys: vi.fn(), match: vi.fn(), delete: vi.fn(), ...cachesApi },
        fetch: vi.fn(),
        URL,
    };
    vm.runInNewContext(source, sandbox, { filename: 'service-worker.js' });
    return { listeners, worker, sandbox };
}

describe('service worker', () => {
    it('precaches every local runtime asset and no APIs', () => {
        const required = ['core', 'applications', 'styles', 'assets', 'pages'].flatMap((directory) => {
            const absolute = join(root, directory);
            return readdirSync(absolute, { recursive: true })
                .filter((file) => /\.(js|css|svg|jpe?g|png|webp)$/i.test(file))
                .map((file) => `/${directory}/${file}`);
        });

        for (const path of required) expect(appShell, `Precache missing ${path}`).toContain(path);
        for (const path of appShell) {
            if (path !== '/') expect(existsSync(join(root, path.slice(1))), `Missing ${path}`).toBe(true);
            expect(path).not.toMatch(/^\/api\//);
        }
    });

    it('falls back to the cached app page when navigation is offline', async () => {
        const cachedPage = { source: 'cached page' };
        const { listeners, sandbox } = createWorker({
            match: vi.fn().mockImplementation((request) => request === '/index.html' ? cachedPage : null),
        });
        sandbox.fetch.mockRejectedValue(new Error('offline'));
        let response;
        const request = { method: 'GET', mode: 'navigate', url: 'https://matrix.test/' };
        listeners.fetch({
            request,
            respondWith: (promise) => { response = promise; },
            waitUntil: vi.fn(),
        });

        await expect(response).resolves.toBe(cachedPage);
        expect(sandbox.caches.match).toHaveBeenCalledWith(request);
        expect(sandbox.caches.match).toHaveBeenCalledWith('/index.html');
    });

    it('does not intercept API requests', () => {
        const { listeners } = createWorker();
        const respondWith = vi.fn();
        listeners.fetch({
            request: { method: 'GET', mode: 'cors', url: 'https://matrix.test/api/sky' },
            respondWith,
        });

        expect(respondWith).not.toHaveBeenCalled();
    });

    it('tries the network first for same-origin assets so deploys reach visitors', async () => {
        const freshAsset = { ok: true, clone: () => ({ copy: true }) };
        const put = vi.fn();
        const cachedAsset = { source: 'cached script' };
        const { listeners, sandbox } = createWorker({
            match: vi.fn().mockResolvedValue(cachedAsset),
            open: vi.fn().mockResolvedValue({ put }),
        });
        sandbox.fetch.mockResolvedValue(freshAsset);
        let response;
        const waitUntil = vi.fn();
        listeners.fetch({
            request: { method: 'GET', mode: 'same-origin', url: 'https://matrix.test/main.js' },
            respondWith: (promise) => { response = promise; },
            waitUntil,
        });

        await expect(response).resolves.toBe(freshAsset);
        expect(sandbox.fetch).toHaveBeenCalled();
        expect(sandbox.caches.match).not.toHaveBeenCalled();
        expect(waitUntil).toHaveBeenCalledTimes(1);
        await waitUntil.mock.calls[0][0];
        expect(put).toHaveBeenCalled();
    });

    it('falls back to the cached copy of an asset when offline', async () => {
        const cachedAsset = { source: 'cached script' };
        const { listeners, sandbox } = createWorker({ match: vi.fn().mockResolvedValue(cachedAsset) });
        sandbox.fetch.mockRejectedValue(new Error('offline'));
        let response;
        listeners.fetch({
            request: { method: 'GET', mode: 'same-origin', url: 'https://matrix.test/main.js' },
            respondWith: (promise) => { response = promise; },
            waitUntil: vi.fn(),
        });

        await expect(response).resolves.toBe(cachedAsset);
    });

    it('uses a new cache name so the stale v1 cache is removed on activate', () => {
        expect(source).toMatch(/CACHE_NAME = 'matrix-shell-v2'/);
    });
});
