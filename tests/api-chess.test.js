/**
 * Chess.com puzzle proxy – method handling, random flag, and error paths
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import handler from '../api/chess.js';

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

describe('api/chess', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('handles OPTIONS preflight', async () => {
        const res = mockRes();
        await handler({ method: 'OPTIONS', query: {} }, res);
        expect(res.statusCode).toBe(200);
        expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('rejects non-GET methods', async () => {
        const res = mockRes();
        await handler({ method: 'POST', query: {} }, res);
        expect(res.statusCode).toBe(405);
        expect(res.body.error).toMatch(/method not allowed/i);
    });

    it('returns the daily puzzle', async () => {
        const puzzle = { title: 'Mate in 2', fen: '8/8/8/8/8/8/8/8' };
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => puzzle,
        }));
        const res = mockRes();
        await handler({ method: 'GET', query: {} }, res);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(puzzle);
        expect(String(fetch.mock.calls[0][0])).toMatch(/\/puzzle$/);
    });

    it('requests a random puzzle when random=1', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ title: 'random' }),
        }));
        const res = mockRes();
        await handler({ method: 'GET', query: { random: '1' } }, res);
        expect(res.statusCode).toBe(200);
        expect(String(fetch.mock.calls[0][0])).toMatch(/\/puzzle\/random$/);
    });

    it('returns 500 when Chess.com is unavailable', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 503,
            statusText: 'Unavailable',
        }));
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const res = mockRes();
        await handler({ method: 'GET', query: {} }, res);
        errorSpy.mockRestore();
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toMatch(/failed to fetch puzzle/i);
    });

    it('uses a fallback message when the thrown error has no message', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('')));
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const res = mockRes();
        await handler({ method: 'GET', query: {} }, res);
        errorSpy.mockRestore();
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toMatch(/unexpected error/i);
    });
});
