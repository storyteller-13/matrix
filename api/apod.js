const API_URL = 'https://science.nasa.gov/wp-json/wp/v2/apod-basic';
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (compatible; matrix.nullstar.fun/1.0; +https://matrix.nullstar.fun)',
  Accept: 'application/json',
};

function toYYMMDD(date) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || '');
  return m ? `${m[1].slice(2)}${m[2]}${m[3]}` : null;
}

function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .trim();
}

function normalize(item) {
  const img = item.hdurl || item.url;
  return {
    date: item.date,
    title: stripHtml(item.title),
    explanation: stripHtml(item.explanation),
    media_type: item.media_type,
    url: img,
    hdurl: img,
    copyright: stripHtml(item.copyright || item.credit) || undefined,
    permalink: item.permalink || item.url,
  };
}

async function getJson(url) {
  const r = await fetch(url, { headers: HEADERS });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: r.status, ok: r.ok, json, snippet: text.slice(0, 300) };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' });

  try {
    const requested = Array.isArray(req.query.date) ? req.query.date[0] : req.query.date;
    const code = toYYMMDD(requested);

    // specific date -> /YYMMDD ; otherwise latest -> ?per_page=1
    const url = code ? `${API_URL}/${code}` : `${API_URL}?per_page=1`;
    const result = await getJson(url);

    if (!result.ok || !result.json) {
      console.error('NASA upstream failure', url, result.status, result.snippet);
      return res.status(result.status === 404 ? 404 : 502).json({
        error: 'upstream failure',
        upstreamStatus: result.status,
        upstreamUrl: url,
        upstreamBody: result.snippet,
      });
    }

    const item = Array.isArray(result.json) ? result.json[0] : result.json;
    if (!item) return res.status(404).json({ error: 'no apod found' });

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(normalize(item));
  } catch (error) {
    console.error('apod handler error', error);
    return res.status(500).json({ error: 'failed to fetch apod', message: error.message });
  }
}