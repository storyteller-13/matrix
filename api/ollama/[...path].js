/**
 * Vercel Serverless Function - Ollama Proxy
 * Proxies requests to Ollama server to avoid CORS issues
 *
 * Set OLLAMA_URL environment variable in Vercel dashboard:
 * - For remote server: https://your-ollama-server.com
 * - For localhost during dev: http://localhost:11434
 */

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const ollamaUrl = process.env.OLLAMA_URL;
  if (!ollamaUrl) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'ollama_url environment variable not set',
      message: 'please set OLLAMA_URL in your vercel project settings (e.g., https://your-ollama-server.com:11434)',
      detail: 'the proxy requires OLLAMA_URL to be configured in vercel environment variables'
    });
  }

  const path = req.query.path || [];
  const endpoint = Array.isArray(path) ? path.join('/') : path;
  const url = `${ollamaUrl}/api/${endpoint}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (req.method === 'POST' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/x-ndjson') || contentType.includes('text/plain')) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const chunks = [];

      /* eslint-disable-next-line no-constant-condition */
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(decoder.decode(value, { stream: true }));
      }

      const fullText = chunks.join('');
      const lines = fullText.split('\n').filter(line => line.trim());
      const jsonData = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');
      return res.status(response.status).json(jsonData);
    }

    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(response.status).json(data);
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let errorMessage = error.message || 'unknown error';
    let detail = '';

    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('Connection refused') || errorMessage.includes('Failed to establish')) {
      detail = 'cannot connect. make sure the ollama server is running and accessible.';
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
      detail = 'cannot resolve ollama hostname. check that OLLAMA_URL is correct.';
    } else if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timeout')) {
      detail = 'connection timed out. the ollama server may be down or unreachable.';
    }

    return res.status(500).json({
      error: 'failed to connect to ollama server',
      message: errorMessage,
      detail: detail || 'error connecting to ollama'
    });
  }
}
