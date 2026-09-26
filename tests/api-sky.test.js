/**
 * CosmyDay transit proxy – method handling and error paths
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import handler from '../api/sky.js';

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

describe('api/sky', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('handles OPTIONS preflight', async () => {
        const res = mockRes();
        await handler({ method: 'OPTIONS' }, res);
        expect(res.statusCode).toBe(200);
        expect(res.headers['Access-Control-Allow-Methods']).toContain('GET');
    });

    it('rejects non-GET methods', async () => {
        const res = mockRes();
        await handler({ method: 'POST' }, res);
        expect(res.statusCode).toBe(405);
        expect(res.body.error).toMatch(/method not allowed/i);
    });

    it('returns transit JSON on success', async () => {
        const payload = { date: '2026-09-11', sky_summary: { sun: { sign: 'Virgo', degree: 18.8 } } };
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => payload,
        }));
        const res = mockRes();
        await handler({ method: 'GET' }, res);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(payload);
        expect(res.headers['Cache-Control']).toMatch(/s-maxage=3600/);
        expect(String(fetch.mock.calls[0][0])).toMatch(/content\/transit$/);
    });

    it('returns 500 when CosmyDay is unavailable', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 503,
            statusText: 'Unavailable',
        }));
        const res = mockRes();
        await handler({ method: 'GET' }, res);
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toMatch(/failed to fetch sky/i);
    });

    it('uses a fallback message when the thrown error has no message', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('')));
        const res = mockRes();
        await handler({ method: 'GET' }, res);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toMatch(/unexpected error/i);
    });
});
