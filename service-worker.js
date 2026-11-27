// Bump the version when the app shell changes shape. Old caches are deleted on activate.
const CACHE_NAME = 'matrix-shell-v2';
const APP_SHELL = [
    '/',
    '/index.html',
    '/main.js',
    '/core/actions.js',
    '/core/env.js',
    '/core/storage.js',
    '/core/i18n.js',
    '/core/base-app.js',
    '/core/timed-cache.js',
    '/core/app-catalog.js',
    '/core/command-palette.js',
    '/core/deep-link.js',
    '/core/matrix-theme.js',
    '/core/wallpaper-stars.js',
    '/core/window-manager.js',
    '/core/panel.js',
    '/core/locale-boot.js',
    '/applications/music-player/music-player-storage.js',
    '/applications/music-player/music-player.js',
    '/applications/todo/todo-storage.js',
    '/applications/todo/todo.js',
    '/applications/notes/notes-storage.js',
    '/applications/notes/notes.js',
    '/applications/lists/folders/list-entry.js',
    '/applications/lists/folders/books.js',
    '/applications/lists/folders/movies.js',
    '/applications/lists/folders/my-guides.js',
    '/applications/lists/folders/adventures.js',
    '/applications/lists/folders/games.js',
    '/applications/lists/folders/friendships.js',
    '/applications/lists/folders/sublime.js',
    '/applications/lists/books.js',
    '/applications/lists/podcast-player.js',
    '/applications/lists/lists-menu.js',
    '/applications/lists/lists-folder-data.js',
    '/applications/lists/lists-folder.js',
    '/applications/quotes/quotes-data.js',
    '/applications/quotes/quotes.js',
    '/applications/bird/bird.js',
    '/applications/apod/apod.js',
    '/applications/chess/chess.js',
    '/applications/sky/sky.js',
    '/applications/calendar/calendar-events.js',
    '/applications/calendar/calendar.js',
    '/applications/about/about.js',
    '/applications/home/home.js',
    '/applications/building/building.js',
    '/applications/status/status.js',
    '/applications/artwork/artwork.js',
    '/applications/terminal/terminal-app.js',
    '/applications/terminal/terminal-core.js',
    '/applications/terminal/terminal-text.js',
    '/applications/terminal/terminal-picture.js',
    '/applications/terminal/terminal.js',
    '/styles/base.css',
    '/styles/404.css',
    '/styles/panel.css',
    '/styles/tray-boxes.css',
    '/styles/tray-boxes-apod-chess.css',
    '/styles/tray-boxes-sky-calendar.css',
    '/styles/music.css',
    '/styles/desktop-icons.css',
    '/styles/windows.css',
    '/styles/windows-todo-notes.css',
    '/styles/windows-about-lists.css',
    '/styles/windows-reflections.css',
    '/styles/dock.css',
    '/styles/palette.css',
    '/styles/matrix-theme.css',
    '/styles/responsive.css',
    '/styles/responsive-phones.css',
    '/styles/responsive-landscape.css',
    '/styles/responsive-touch-apps.css',
    '/assets/favicon.svg',
    '/assets/favicon-matrix.svg',
    '/pages/artwork/memories.jpg',
    '/pages/artwork/summer.jpg',
    '/pages/artwork/love.jpg',
    '/pages/artwork/lion.jpg',
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys
                .filter((key) => key.startsWith('matrix-shell-') && key !== CACHE_NAME)
                .map((key) => caches.delete(key))))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== self.location.origin) return;
    // API data has its own freshness and stale fallback handling in each app.
    if (url.pathname.startsWith('/api/')) return;

    if (request.mode === 'navigate') {
        event.respondWith(fetch(request)
            .then((response) => {
                if (response.ok) {
                    const copy = response.clone();
                    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy)));
                }
                return response;
            })
            .catch(async () => (await caches.match(request)) || (await caches.match('/index.html'))));
        return;
    }

    // Network first, so a deploy reaches returning visitors. The cached copy is the offline fallback.
    event.respondWith(fetch(request)
        .then((response) => {
            if (response.ok) {
                const copy = response.clone();
                event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
            }
            return response;
        })
        .catch(() => caches.match(request)));
});
