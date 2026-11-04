/**
 * Vercel Serverless Function - Chess.com daily puzzle proxy
 * Avoids CORS in the browser. No API key required; read-only public data.
 */

import { createHandler, fetchJson } from './_lib/http.js';

const API_URL = 'https://api.chess.com/pub/puzzle';

export default createHandler({
  name: 'puzzle',
  load: () => fetchJson(API_URL),
});
