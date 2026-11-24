/**
 * Deep links: ?open=<app> opens that app's window on load, and ?open=<app>&item=<id> opens one item in it.
 * Example: ?open=books&item=books-2026, ?open=quotes, ?open=podcast&item=<episode id>.
 * (?folder= in the lists app keeps working on its own.)
 */
import { APPS, openApp } from './app-catalog.js';

const ITEM_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

/** The app and optional item in a query string, or null when there is no valid ?open=. */
export function parseDeepLink(search) {
    const params = new URLSearchParams(search);
    const app = (params.get('open') || '').toLowerCase();
    if (!APPS.some((entry) => entry.id === app)) return null;
    const item = params.get('item');
    return { app, item: item && ITEM_PATTERN.test(item) ? item : undefined };
}

/** A shareable URL for an app (and optional item) on this site. */
export function deepLinkFor(app, item, base = 'https://matrix.nullstar.fun/') {
    const url = new URL(base);
    url.search = '';
    url.searchParams.set('open', app);
    if (item) url.searchParams.set('item', item);
    return url.toString();
}

/** Opens the app named in the current URL, once the page's scripts have loaded. */
export function openFromLocation(win = window) {
    const params = new URLSearchParams(win.location.search);
    const link = parseDeepLink(win.location.search);
    // The lists app handles its own ?folder= link; other app links can coexist with it.
    if (!link || (params.has('folder') && link.app === 'lists')) return false;
    return openApp(link.app, link.item, { win });
}

if (typeof window !== 'undefined') {
    window.addEventListener('load', () => openFromLocation(window), { once: true });
}
