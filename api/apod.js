/**
 * Vercel Serverless Function - NASA APOD API Proxy
 * Proxies requests to the NASA APOD API to avoid CORS and rate limiting issues
 * 
 * Set NASA_API_KEY in Vercel environment variables for better rate limits
 * Get your free API key at: https://api.nasa.gov/
 */

/** NASA publishes APOD by US Eastern calendar date, not UTC. */
function easternDateString(offsetDays = 0) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === 'year').value);
  const month = Number(parts.find((p) => p.type === 'month').value);
  const day = Number(parts.find((p) => p.type === 'day').value);
  return new Date(Date.UTC(year, month - 1, day + offsetDays)).toISOString().slice(0, 10);
}

function fetchNasaApod(apiKey, date) {
  return fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`, {
    headers: {
      'User-Agent': 'matrix.nullstar.fun/1.0',
    },
  });
}

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
    const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    const requested = Array.isArray(req.query.date) ? req.query.date[0] : req.query.date;
    const dates = requested
      ? [requested, easternDateString(), easternDateString(-1)]
      : [easternDateString(), easternDateString(-1)];

    let response;
    for (const date of [...new Set(dates)]) {
      response = await fetchNasaApod(apiKey, date);
      if (response.ok || response.status === 429) break;
    }

    if (!response.ok) {
      if (response.status === 429) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(429).json({
          error: 'rate limit exceeded',
          message: 'too many requests. please try again later.',
          retryAfter: Number(response.headers.get('Retry-After')) || 3600
        });
      }

      throw new Error(`NASA API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(data);

  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'failed to fetch apod',
      message: error.message || 'an unexpected error occurred'
    });
  }
}

