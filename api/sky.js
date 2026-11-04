/**
 * Vercel Serverless Function - CosmyDay transit proxy
 * Proxies today's sky_summary so the panel can cache it and identify the app.
 */

import { createHandler, fetchJson } from './_lib/http.js';

const API_URL = 'https://api.cosmyday.com/content/transit';

export default createHandler({
  name: 'sky',
  load: () => fetchJson(API_URL),
});
