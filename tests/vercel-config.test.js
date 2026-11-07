/**
 * Vercel config tests – security headers and routing
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '../vercel.json');

describe('vercel.json', () => {
    let config;

    beforeAll(() => {
        const raw = readFileSync(configPath, 'utf8');
        config = JSON.parse(raw);
    });

    it('exists and is valid JSON', () => {
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
    });

    it('applies security headers to all routes', () => {
        expect(config.headers).toBeDefined();
        expect(Array.isArray(config.headers)).toBe(true);
        const catchAll = config.headers.find((h) => h.source === '/(.*)');
        expect(catchAll).toBeDefined();
        const headers = catchAll.headers;
        const keys = headers.map((h) => h.key);
        expect(keys).toContain('X-Content-Type-Options');
        expect(keys).toContain('X-Frame-Options');
        expect(keys).toContain('Referrer-Policy');
        expect(keys).toContain('Permissions-Policy');
        expect(keys).toContain('Strict-Transport-Security');
        expect(keys).toContain('Content-Security-Policy');
        expect(keys).toContain('Cross-Origin-Opener-Policy');
        expect(keys).toContain('Cross-Origin-Resource-Policy');
        expect(keys).toContain('X-Permitted-Cross-Domain-Policies');
    });

    it('sets X-Content-Type-Options to nosniff', () => {
        const catchAll = config.headers.find((h) => h.source === '/(.*)');
        const h = catchAll.headers.find((x) => x.key === 'X-Content-Type-Options');
        expect(h.value).toBe('nosniff');
    });

    it('sets X-Frame-Options to DENY', () => {
        const catchAll = config.headers.find((h) => h.source === '/(.*)');
        const h = catchAll.headers.find((x) => x.key === 'X-Frame-Options');
        expect(h.value).toBe('DENY');
    });

    it('sets a restrictive Content-Security-Policy', () => {
        const catchAll = config.headers.find((h) => h.source === '/(.*)');
        const h = catchAll.headers.find((x) => x.key === 'Content-Security-Policy');
        expect(h.value).toContain("default-src 'self'");
        expect(h.value).toContain("object-src 'none'");
        expect(h.value).toContain("base-uri 'self'");
    });

    it('does not use legacy routes (Vercel ignores headers/redirects alongside them)', () => {
        expect(config.routes).toBeUndefined();
    });

    it('ships a root 404.html for Vercel to serve on misses', () => {
        expect(() => readFileSync(join(__dirname, '../404.html'), 'utf8')).not.toThrow();
    });

    it('allows the third-party origins the page loads', () => {
        const catchAll = config.headers.find((h) => h.source === '/(.*)');
        const csp = catchAll.headers.find((x) => x.key === 'Content-Security-Policy').value;
        const directive = (name) => csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(name + ' '));
        expect(directive('script-src')).toContain('https://www.youtube.com');
        expect(directive('script-src')).not.toContain("'unsafe-inline'");
        expect(directive('frame-src')).toContain('https://www.youtube.com');
        expect(directive('style-src')).toContain('https://fonts.googleapis.com');
        expect(directive('font-src')).toContain('https://fonts.gstatic.com');
    });

    it('redirects /index.html to /', () => {
        expect(config.redirects).toBeDefined();
        const redirect = config.redirects.find(
            (r) => r.source === '/index.html' && r.destination === '/'
        );
        expect(redirect).toBeDefined();
        expect(redirect.permanent).toBe(true);
    });
});
