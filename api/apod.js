/**
 * Vercel Serverless Function - NASA APOD API Proxy
 * Proxies requests to the NASA APOD API to avoid CORS and rate limiting issues
 * 
 * Set NASA_API_KEY in Vercel environment variables for better rate limits
 * Get your free API key at: https://api.nasa.gov/
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
    const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`;

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'matrix.nullstar.fun/1.0',
      },
    });

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(429).json({
          error: 'rate limit exceeded',
          message: 'too many requests. please try again later.',
          retryAfter: response.headers.get('Retry-After') || 3600
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

