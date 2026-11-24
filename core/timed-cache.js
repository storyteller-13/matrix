/**
 * Timestamped localStorage cache shared by the daily panels (bird, APOD, sky).
 * The stored shape stays { data, timestamp } under each app's own key, so existing caches still read.
 */
import { readStorage, writeStorage } from './storage.js';

const TimedCache = {
    /**
     * Returns the cached data, or null when it is missing, unreadable, or older than maxAgeMs.
     * allowExpired returns stale data too, for use when a fresh fetch fails.
     */
    read(key, maxAgeMs, { allowExpired = false } = {}) {
        try {
            const raw = readStorage(key);
            if (!raw) return null;
            const { data, timestamp } = JSON.parse(raw);
            const valid = Date.now() - timestamp < maxAgeMs;
            return valid || allowExpired ? data : null;
        } catch (_) {
            return null;
        }
    },

    /** Stores data with the current time. Storage that is full or blocked is ignored. */
    write(key, data) {
        let payload;
        try {
            payload = JSON.stringify({ data, timestamp: Date.now() });
        } catch (_) {
            return; // Data that cannot be serialized is not cached.
        }
        // A full or blocked storage is ignored: the app still works without its cache.
        writeStorage(key, payload);
    },
};

window.TimedCache = TimedCache;
