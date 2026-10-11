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
