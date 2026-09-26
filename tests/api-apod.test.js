/**
 * NASA APOD proxy – method handling, date fallback, rate limit, and success
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
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
    afterEach(() => {
        vi.unstubAllGlobals();
        delete process.env.NASA_API_KEY;
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

    it('returns APOD JSON on success', async () => {
        const payload = { title: 'Saturn', media_type: 'image', url: 'https://example.com/s.jpg' };
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => payload,
        }));
        const res = mockRes();
        await handler({ method: 'GET', query: {} }, res);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(payload);
        expect(res.headers['Cache-Control']).toMatch(/s-maxage=3600/);
        expect(fetch).toHaveBeenCalled();
    });

    it('tries a requested date then falls back', async () => {
        const fallback = { title: 'fallback', date: '2026-09-10' };
        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => fallback,
            }));
        const res = mockRes();
        await handler({ method: 'GET', query: { date: ['2026-09-11'] } }, res);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(fallback);
        expect(fetch.mock.calls.length).toBeGreaterThan(1);
    });

    it('returns 429 when NASA rate-limits', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 429,
            headers: { get: () => '120' },
        }));
        const res = mockRes();
        await handler({ method: 'GET', query: { date: '2026-09-11' } }, res);
        expect(res.statusCode).toBe(429);
        expect(res.body.error).toMatch(/rate limit/i);
        expect(res.body.retryAfter).toBe(120);
    });

    it('uses a default retryAfter when the header is missing', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 429,
            headers: { get: () => null },
        }));
        const res = mockRes();
        await handler({ method: 'GET', query: {} }, res);
        expect(res.statusCode).toBe(429);
        expect(res.body.retryAfter).toBe(3600);
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

    it('uses a fallback message when the thrown error has no message', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('')));
        const res = mockRes();
        await handler({ method: 'GET', query: {} }, res);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toMatch(/unexpected error/i);
    });
});
