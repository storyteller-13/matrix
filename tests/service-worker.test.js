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

    it('serves cached same-origin assets before trying the network', async () => {
        const cachedAsset = { source: 'cached script' };
        const { listeners, sandbox } = createWorker({ match: vi.fn().mockResolvedValue(cachedAsset) });
        let response;
        listeners.fetch({
            request: { method: 'GET', mode: 'same-origin', url: 'https://matrix.test/main.js' },
            respondWith: (promise) => { response = promise; },
        });

        await expect(response).resolves.toBe(cachedAsset);
        expect(sandbox.fetch).not.toHaveBeenCalled();
    });
});
