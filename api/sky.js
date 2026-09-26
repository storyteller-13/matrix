/**
 * Vercel Serverless Function - CosmyDay transit proxy
 * Proxies today's sky_summary so the panel can cache it and identify the app.
 */

const TRANSIT_URL = 'https://api.cosmyday.com/content/transit';

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
    const response = await fetch(TRANSIT_URL, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'matrix.nullstar.fun/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`CosmyDay API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(data);
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'failed to fetch sky',
      message: error.message || 'an unexpected error occurred',
    });
  }
}
