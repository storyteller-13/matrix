"""Local dev server: python's http.server, but telling the browser never to cache.

Without this, browsers (Firefox especially) keep stale copies of the ES modules,
so a changed .js file can silently keep running its old version.
"""

import functools
import http.server
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8088


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    handler = functools.partial(NoCacheHandler, directory='.')
    with http.server.ThreadingHTTPServer(('127.0.0.1', PORT), handler) as server:
        server.serve_forever()
