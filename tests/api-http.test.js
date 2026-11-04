/**
 * Shared API helpers – CORS/method handling, error mapping, upstream fetches, query params.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createHandler, fetchJson, queryParam, HttpError, UpstreamError, USER_AGENT } from '../api/_lib/http.js';

function mockRes() {
    return {
        headers: {},
        statusCode: 200,
        body: undefined,
        ended: false,
        setHeader(key, value) { this.headers[key] = value; return this; },
        status(code) { this.statusCode = code; return this; },
        json(data) { this.body = data; return this; },
        end() { this.ended = true; return this; },
    };
}

describe('api/_lib/http', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('sets CORS on every response and only runs load for GET', async () => {
        const load = vi.fn().mockResolvedValue({ ok: 1 });
        const handler = createHandler({ name: 'thing', load });

        const preflight = mockRes();
        await handler({ method: 'OPTIONS', query: {} }, preflight);
        expect(preflight.statusCode).toBe(200);
        expect(preflight.ended).toBe(true);
        expect(preflight.headers['Access-Control-Allow-Origin']).toBe('*');
        expect(preflight.headers['Access-Control-Allow-Methods']).toBe('GET, OPTIONS');

        const post = mockRes();
        await handler({ method: 'POST', query: {} }, post);
        expect(post.statusCode).toBe(405);
        expect(post.headers['Access-Control-Allow-Origin']).toBe('*');

        expect(load).not.toHaveBeenCalled();

        const get = mockRes();
        await handler({ method: 'GET', query: {} }, get);
        expect(get.statusCode).toBe(200);
        expect(get.body).toEqual({ ok: 1 });
        expect(get.headers['Cache-Control']).toBe('public, s-maxage=3600, stale-while-revalidate=86400');
        expect(get.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('passes HttpError statuses through quietly and turns other errors into logged 500s', async () => {
        const notFound = createHandler({ name: 'thing', load: () => { throw new HttpError(404, 'nope'); } });
        const res404 = mockRes();
        await notFound({ method: 'GET', query: {} }, res404);
        expect(res404.statusCode).toBe(404);
        expect(res404.body).toEqual({ error: 'failed to fetch thing', message: 'nope' });
        expect(res404.headers['Cache-Control']).toBeUndefined();
        expect(console.error).not.toHaveBeenCalled();

        const broken = createHandler({ name: 'thing', load: () => Promise.reject(new Error('')) });
        const res500 = mockRes();
        await broken({ method: 'GET', query: {} }, res500);
        expect(res500.statusCode).toBe(500);
        expect(res500.body).toEqual({ error: 'failed to fetch thing', message: 'an unexpected error occurred' });
        expect(console.error).toHaveBeenCalled();
    });

    it('fetchJson identifies the site, merges headers, and throws UpstreamError on failure', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ a: 1 }) }));
        await expect(fetchJson('https://example.com/x', { headers: { 'User-Agent': 'custom' } })).resolves.toEqual({ a: 1 });
        expect(fetch).toHaveBeenCalledWith('https://example.com/x', {
            headers: { Accept: 'application/json', 'User-Agent': 'custom' },
        });

        await fetchJson('https://example.com/y');
        expect(fetch.mock.calls[1][1].headers['User-Agent']).toBe(USER_AGENT);

        fetch.mockResolvedValue({ ok: false, status: 503, statusText: 'Unavailable' });
        const error = await fetchJson('https://example.com/z').catch((e) => e);
        expect(error).toBeInstanceOf(UpstreamError);
        expect(error.status).toBe(503);
        expect(error.url).toBe('https://example.com/z');
        expect(error.message).toBe('upstream 503: Unavailable');
    });

    it('queryParam returns the first value of repeated params', () => {
        expect(queryParam({ query: { date: '2026-11-04' } }, 'date')).toBe('2026-11-04');
        expect(queryParam({ query: { date: ['a', 'b'] } }, 'date')).toBe('a');
        expect(queryParam({ query: {} }, 'date')).toBeUndefined();
        expect(queryParam({}, 'date')).toBeUndefined();
    });
});
