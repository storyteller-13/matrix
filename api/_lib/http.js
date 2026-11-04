/**
 * Shared helpers for the Vercel serverless functions in api/.
 * The leading underscore keeps Vercel from deploying this folder as an endpoint.
 */

export const USER_AGENT = 'matrix.nullstar.fun/1.0 (+https://matrix.nullstar.fun)';

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

/** GET a JSON document, identifying this site; throws UpstreamError on a non-2xx status. */
export async function fetchJson(url, { headers = {} } = {}) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT, ...headers },
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
      const status = error instanceof HttpError ? error.status : 500;
      if (status >= 500) console.error(`${name} api error:`, error);
      return res.status(status).json({
        error: `failed to fetch ${name}`,
        message: error.message || 'an unexpected error occurred',
      });
    }
  };
}
