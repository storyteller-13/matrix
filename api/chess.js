/**
 * Vercel Serverless Function - Chess.com PubAPI Proxy
 * Proxies requests to the Chess.com daily puzzle API (avoids CORS in browser)
 * No API key required; read-only public data.
 */

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(405).json({ error: 'method not allowed' });
  }

  try {
    const random = req.query.random === '1';
    const apiUrl = random
      ? 'https://api.chess.com/pub/puzzle/random'
      : 'https://api.chess.com/pub/puzzle';

    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'matrix.nullstar.fun.com/1.0' },
    });

    if (!response.ok) {
      throw new Error(`Chess.com API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Chess proxy error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'failed to fetch puzzle',
      message: error.message || 'an unexpected error occurred',
    });
  }
}
