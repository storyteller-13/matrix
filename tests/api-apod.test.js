/**
 * NASA APOD proxy – method handling, date fallback, rate limit, and success
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import handler from '../api/apod.js';

function mockRes() {
    return {
        headers: {},
        statusCode: 200,
        body: undefined,
        setHeader(key, value) { this.headers[key] = value; return this; },
        status(code) { this.statusCode = code; return this; },
        json(data) { this.body = data; return this; },
        end() { return this; },
    };
}

describe('api/apod', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('handles OPTIONS preflight', async () => {
        const res = mockRes();
        await handler({ method: 'OPTIONS', query: {} }, res);
        expect(res.statusCode).toBe(200);
        expect(res.headers['Access-Control-Allow-Methods']).toContain('GET');
    });

    it('rejects non-GET methods', async () => {
        const res = mockRes();
        await handler({ method: 'POST', query: {} }, res);
        expect(res.statusCode).toBe(405);
        expect(res.body.error).toMatch(/method not allowed/i);
    });

    it('returns the latest picture, normalized to plain text', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [{
                date: '2026-11-04',
                title: 'M31 &amp; friends',
                explanation: '<p>A galaxy.</p><p>Nearby<br>too.</p>',
                media_type: 'image',
                url: 'https://example.com/m31.jpg',
                credit: '<a href="#">Someone</a>',
                permalink: 'https://science.nasa.gov/apod/261104',
            }],
        }));
        const res = mockRes();
        await handler({ method: 'GET', query: {} }, res);
        expect(res.statusCode).toBe(200);
        expect(res.headers['Cache-Control']).toContain('s-maxage=3600');
        expect(res.body).toEqual({
            date: '2026-11-04',
            title: 'M31 & friends',
            explanation: 'A galaxy.\n\nNearby\ntoo.',
            media_type: 'image',
            url: 'https://example.com/m31.jpg',
            hdurl: 'https://example.com/m31.jpg',
            copyright: 'Someone',
            permalink: 'https://science.nasa.gov/apod/261104',
        });
        const [url, init] = fetch.mock.calls[0];
        expect(url).toMatch(/apod-basic\?per_page=1$/);
        expect(init.headers['User-Agent']).toMatch(/^Mozilla\/5\.0/);
    });

    it('requests a specific day from ?date= and 404s when NASA has none', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' }));
        const res = mockRes();
        await handler({ method: 'GET', query: { date: ['2026-11-04', 'ignored'] } }, res);
        expect(fetch.mock.calls[0][0]).toMatch(/apod-basic\/261104$/);
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toMatch(/failed to fetch apod/i);
        expect(res.body).not.toHaveProperty('upstreamBody');
        expect(console.error).not.toHaveBeenCalled();
    });

    it('404s when NASA returns an empty list', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] }));
        const res = mockRes();
        await handler({ method: 'GET', query: { date: 'not-a-date' } }, res);
        expect(fetch.mock.calls[0][0]).toMatch(/per_page=1$/);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('no apod found');
    });

    it('returns 500 when NASA is unavailable', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Server Error',
        }));
        const res = mockRes();
        await handler({ method: 'GET', query: {} }, res);
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toMatch(/failed to fetch apod/i);
    });
});
