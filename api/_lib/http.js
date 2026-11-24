/**
 * Shared helpers for the Vercel serverless functions in api/.
 * The leading underscore keeps Vercel from deploying this folder as an endpoint.
 */

export const USER_AGENT = 'matrix.nullstar.fun/1.0 (+https://matrix.nullstar.fun)';

/** Upstream APIs get this long before the function gives up and the client sees an error. */
const UPSTREAM_TIMEOUT_MS = 8000;

/** Daily data: cache at the edge for an hour, serve stale for a day while revalidating. */
const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

/** An error whose status (e.g. 404) should reach the client instead of a generic 500. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** A non-2xx response from an upstream API. */
export class UpstreamError extends Error {
  constructor(url, response) {
    super(`upstream ${response.status}: ${response.statusText}`);
    this.url = url;
    this.status = response.status;
  }
}

/**
 * GET a JSON document, identifying this site; throws UpstreamError on a non-2xx status.
 * A slow upstream is aborted after UPSTREAM_TIMEOUT_MS so a serverless function never hangs on it.
 */
export async function fetchJson(url, { headers = {} } = {}) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT, ...headers },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!response.ok) throw new UpstreamError(url, response);
  return response.json();
}

/** First value of a query parameter (Vercel gives an array when it is repeated). */
export function queryParam(req, name) {
  const value = req.query?.[name];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * A YYYY-MM-DD query value, or null when it is missing or malformed (the caller uses its default).
 * A well-formed date that is not a real day, or falls outside [min, today + maxFutureDays], is a 400.
 * This bounds the upstream requests (and edge cache entries) that one client can cause.
 */
export function dateParam(req, name, { min, maxFutureDays = 1 }) {
  const raw = queryParam(req, name);
  if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const time = Date.parse(`${raw}T00:00:00Z`);
  if (Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== raw) {
    throw new HttpError(400, `not a real date: ${raw}`);
  }
  if (raw < min || time > Date.now() + maxFutureDays * 86400000) {
    throw new HttpError(400, `date outside the supported range: ${raw}`);
  }
  return raw;
}

/**
 * Build a read-only, CORS-enabled GET endpoint.
 * `load(req)` returns the JSON body; throw HttpError for a specific status, anything else is a 500.
 *
 * @param {Object} options
 * @param {string} options.name - what is being fetched, used in error messages ("failed to fetch <name>").
 * @param {(req: Object) => Promise<Object>} options.load
 */
export function createHandler({ name, load }) {
  return async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'method not allowed' });
    }

    try {
      const data = await load(req);
      res.setHeader('Cache-Control', CACHE_CONTROL);
      return res.status(200).json(data);
    } catch (error) {
      // Only deliberate HttpErrors reach the client with their message; anything else is logged, not echoed.
      const expected = error instanceof HttpError;
      if (!expected) console.error(`${name} api error:`, error);
      return res.status(expected ? error.status : 500).json({
        error: `failed to fetch ${name}`,
        message: expected ? error.message : 'an unexpected error occurred',
      });
    }
  };
}
