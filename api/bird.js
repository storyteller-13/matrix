/**
 * Vercel Serverless Function - Bird of the Day
 * Picks a stable daily bird from iNaturalist (Aves) and enriches with Wikipedia.
 */

const INAT_TAXA = 'https://api.inaturalist.org/v1/taxa';
const WIKI_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const UA = 'matrix.nullstar.fun/1.0';

/** Calendar date in US Eastern, matching APOD's day boundary. */
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

function dayOfYearFromDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const start = Date.UTC(y, 0, 0);
  const target = Date.UTC(y, m - 1, d);
  return Math.floor((target - start) / 86400000);
}

function hashDate(dateStr) {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = ((h << 5) - h + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function photoUrl(photo) {
  if (!photo) return null;
  return photo.large_url || photo.medium_url || photo.url || null;
}

function wikipediaTitleFromUrl(url) {
  if (!url) return null;
  try {
    const path = new URL(url).pathname;
    const raw = path.split('/').filter(Boolean).pop();
    return raw ? decodeURIComponent(raw.replace(/_/g, ' ')) : null;
  } catch (_) {
    return null;
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': UA,
    },
  });
  if (!response.ok) {
    throw new Error(`upstream ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

async function pickBird(dateStr) {
  const doy = dayOfYearFromDate(dateStr);
  const hash = hashDate(dateStr);
  const page = (doy % 40) + 1;
  const data = await fetchJson(
    `${INAT_TAXA}?taxon_id=3&rank=species&per_page=30&page=${page}&order=desc&order_by=observations_count`
  );
  const results = Array.isArray(data.results) ? data.results : [];
  if (!results.length) throw new Error('no birds returned');

  for (let i = 0; i < results.length; i++) {
    const bird = results[(hash + i) % results.length];
    const url = photoUrl(bird.default_photo);
    if (!url) continue;
    return {
      title: bird.preferred_common_name || bird.name,
      scientific_name: bird.name,
      url,
      date: dateStr,
      wikipedia_url: bird.wikipedia_url || null,
      avibase_url: bird.name
        ? `https://avibase.bsc-eoc.org/search.jsp?qstr=${encodeURIComponent(bird.name)}`
        : null,
      inaturalist_url: bird.id ? `https://www.inaturalist.org/taxa/${bird.id}` : null,
    };
  }
  throw new Error('no bird with photo');
}

async function enrichWithWikipedia(bird) {
  const title = wikipediaTitleFromUrl(bird.wikipedia_url) || bird.title;
  if (!title) return bird;

  try {
    const summary = await fetchJson(`${WIKI_SUMMARY}${encodeURIComponent(title)}`);
    return {
      ...bird,
      explanation: summary.extract || '',
      wikipedia_url: summary.content_urls?.desktop?.page || bird.wikipedia_url,
      url: bird.url || summary.originalimage?.source || summary.thumbnail?.source,
    };
  } catch (_) {
    return { ...bird, explanation: '' };
  }
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
    const requested = Array.isArray(req.query.date) ? req.query.date[0] : req.query.date;
    const dateStr = requested && /^\d{4}-\d{2}-\d{2}$/.test(requested)
      ? requested
      : easternDateString();

    const bird = await enrichWithWikipedia(await pickBird(dateStr));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(bird);
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'failed to fetch bird',
      message: error.message || 'an unexpected error occurred',
    });
  }
}
