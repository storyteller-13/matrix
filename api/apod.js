/**
 * Vercel Serverless Function - NASA Astronomy Picture of the Day
 * Reads NASA's public APOD feed (?date=YYYY-MM-DD for a specific day, otherwise the latest)
 * and returns a plain-text, normalized picture.
 */

import { createHandler, fetchJson, queryParam, HttpError, UpstreamError } from './_lib/http.js';

const API_URL = 'https://science.nasa.gov/wp-json/wp/v2/apod-basic';
// NASA's site expects a browser-like User-Agent.
const NASA_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; matrix.nullstar.fun/1.0; +https://matrix.nullstar.fun)',
};

/** "2026-11-04" -> "261104" (NASA's per-day path), or null for anything else. */
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

async function loadApod(req) {
  const code = toYYMMDD(queryParam(req, 'date'));
  const url = code ? `${API_URL}/${code}` : `${API_URL}?per_page=1`;

  let json;
  try {
    json = await fetchJson(url, { headers: NASA_HEADERS });
  } catch (error) {
    if (error instanceof UpstreamError && error.status === 404) {
      throw new HttpError(404, 'no apod for that date');
    }
    throw error;
  }

  const item = Array.isArray(json) ? json[0] : json;
  if (!item) throw new HttpError(404, 'no apod found');
  return normalize(item);
}

export default createHandler({ name: 'apod', load: loadApod });
