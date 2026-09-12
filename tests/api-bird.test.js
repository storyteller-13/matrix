/**
 * Bird of the Day proxy – method handling, enrichment, and failure paths.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import handler from '../api/bird.js';

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

const taxaWithPhoto = {
    results: [{
        id: 123,
        name: 'Actitis hypoleucos',
        preferred_common_name: 'Common Sandpiper',
        wikipedia_url: 'http://en.wikipedia.org/wiki/Common_sandpiper',
        default_photo: {
            medium_url: 'https://example.com/bird.jpg',
            large_url: 'https://example.com/bird-lg.jpg',
        },
    }],
};

const wiki = {
    extract: 'a small shorebird',
    content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Common_sandpiper' } },
};

describe('api/bird', () => {
    afterEach(() => {
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

    it('returns a bird payload on success', async () => {
        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => taxaWithPhoto,
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => wiki,
            }));

        const res = mockRes();
        await handler({ method: 'GET', query: { date: '2026-09-12' } }, res);
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Common Sandpiper');
        expect(res.body.scientific_name).toBe('Actitis hypoleucos');
        expect(res.body.url).toContain('bird-lg.jpg');
        expect(res.body.explanation).toBe('a small shorebird');
        expect(res.body.date).toBe('2026-09-12');
        expect(res.body.avibase_url).toContain('Actitis');
        expect(res.body.inaturalist_url).toContain('/taxa/123');
        expect(res.headers['Cache-Control']).toMatch(/s-maxage=3600/);
    });

    it('accepts date as an array query value', async () => {
        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => taxaWithPhoto })
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => wiki }));

        const res = mockRes();
        await handler({ method: 'GET', query: { date: ['2026-01-02'] } }, res);
        expect(res.statusCode).toBe(200);
        expect(res.body.date).toBe('2026-01-02');
    });

    it('uses Eastern today when date is missing or invalid', async () => {
        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => taxaWithPhoto })
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => wiki }));

        const res = mockRes();
        await handler({ method: 'GET', query: { date: 'not-a-date' } }, res);
        expect(res.statusCode).toBe(200);
        expect(res.body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('skips taxa without photos and falls back to scientific name', async () => {
        const taxa = {
            results: [
                { id: 1, name: 'Ghostus birdus', preferred_common_name: 'Ghost', default_photo: null },
                {
                    id: 2,
                    name: 'Turdus migratorius',
                    default_photo: { url: 'https://example.com/robin.jpg' },
                },
            ],
        };
        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => taxa })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ extract: 'a thrush', content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/American_robin' } } }),
            }));

        const res = mockRes();
        await handler({ method: 'GET', query: { date: '2026-09-12' } }, res);
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Turdus migratorius');
        expect(res.body.url).toContain('robin.jpg');
    });

    it('still returns a bird when Wikipedia enrichment fails', async () => {
        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => taxaWithPhoto })
            .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Unavailable' }));

        const res = mockRes();
        await handler({ method: 'GET', query: { date: '2026-09-12' } }, res);
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Common Sandpiper');
        expect(res.body.explanation).toBe('');
    });

    it('returns 500 when no birds are returned', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ results: [] }),
        }));
        const res = mockRes();
        await handler({ method: 'GET', query: {} }, res);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toMatch(/no birds/i);
    });

    it('returns 500 when no bird has a photo', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                results: [{ id: 1, name: 'Ghostus', default_photo: null }],
            }),
        }));
        const res = mockRes();
        await handler({ method: 'GET', query: { date: '2026-09-12' } }, res);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toMatch(/no bird with photo/i);
    });

    it('returns 500 when upstream fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 503,
            statusText: 'Unavailable',
        }));
        const res = mockRes();
        await handler({ method: 'GET', query: {} }, res);
        expect(res.statusCode).toBe(500);
        expect(res.body.error).toMatch(/failed to fetch bird/i);
    });

    it('uses a fallback message when the thrown error has no message', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('')));
        const res = mockRes();
        await handler({ method: 'GET', query: {} }, res);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toMatch(/unexpected error/i);
    });

    it('tolerates invalid wikipedia urls and sparse taxa fields', async () => {
        const taxa = {
            results: [{
                preferred_common_name: 'Nameless',
                wikipedia_url: 'not a url',
                default_photo: { medium_url: 'https://example.com/n.jpg' },
            }],
        };
        vi.stubGlobal('fetch', vi.fn()
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => taxa })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ extract: '', content_urls: {} }),
            }));

        const res = mockRes();
        await handler({ method: 'GET', query: { date: '2026-09-12' } }, res);
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Nameless');
        expect(res.body.avibase_url).toBeNull();
        expect(res.body.inaturalist_url).toBeNull();
        expect(res.body.explanation).toBe('');
    });

    it('skips wikipedia enrichment when no title can be derived', async () => {
        const taxa = {
            results: [{
                wikipedia_url: 'http://en.wikipedia.org/',
                default_photo: { url: 'https://example.com/untitled.jpg' },
            }],
        };
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => taxa,
        });
        vi.stubGlobal('fetch', fetchMock);

        const res = mockRes();
        await handler({ method: 'GET', query: { date: '2026-09-12' } }, res);
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBeUndefined();
        expect(res.body.url).toContain('untitled.jpg');
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('returns 500 when results is not an array or photos lack urls', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ results: { nope: true } }),
        }));
        const res = mockRes();
        await handler({ method: 'GET', query: { date: '2026-09-12' } }, res);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toMatch(/no birds/i);

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                results: [{ id: 9, name: 'EmptyPhoto', default_photo: {} }],
            }),
        }));
        const res2 = mockRes();
        await handler({ method: 'GET', query: { date: '2026-09-12' } }, res2);
        expect(res2.statusCode).toBe(500);
        expect(res2.body.message).toMatch(/no bird with photo/i);
    });
});
