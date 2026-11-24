/**
 * Date query validation for the APOD and bird proxies: bad or out-of-range dates are rejected before any upstream call.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import apod from '../api/apod.js';
import bird from '../api/bird.js';

function mockRes() {
    const res = {
        headers: {},
        statusCode: 200,
        body: undefined,
        setHeader(key, value) { res.headers[key] = value; },
        status(code) { res.statusCode = code; return res; },
        json(body) { res.body = body; return res; },
        end() { return res; },
    };
    return res;
}

describe('date query validation', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn(() => {
            throw new Error('upstream must not be called for a rejected date');
        }));
    });

    it('rejects impossible calendar dates with 400 and no upstream call', async () => {
        for (const handler of [apod, bird]) {
            const res = mockRes();
            await handler({ method: 'GET', query: { date: '2026-02-31' } }, res);
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/not a real date/);
        }
        expect(fetch).not.toHaveBeenCalled();
    });

    it('rejects dates before the APOD archive and far in the future', async () => {
        const early = mockRes();
        await apod({ method: 'GET', query: { date: '1900-01-01' } }, early);
        expect(early.statusCode).toBe(400);
        expect(early.body.message).toMatch(/outside the supported range/);

        const late = mockRes();
        await bird({ method: 'GET', query: { date: '2999-01-01' } }, late);
        expect(late.statusCode).toBe(400);
        expect(late.body.message).toMatch(/outside the supported range/);
        expect(fetch).not.toHaveBeenCalled();
    });

    it('falls back to the default for malformed values, as before', async () => {
        vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
        const res = mockRes();
        await apod({ method: 'GET', query: { date: 'soon' } }, res);
        expect(res.statusCode).not.toBe(400);
    });
});
