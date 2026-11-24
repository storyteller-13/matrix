/**
 * localStorage access that never throws.
 * Storage can be blocked (private windows, disabled site data) or full, and every app still works
 * without it, so reads fall back to null and writes are best-effort.
 * core/locale-boot.js is a classic inline script that runs before modules load, so it keeps its own try/catch.
 */

/** The stored string, or null when the key is missing or storage is unavailable. */
export function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (_) {
        return null;
    }
}

/** Stores a string. Returns false when storage is full or blocked. */
export function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (_) {
        return false;
    }
}

/** Removes a key. Returns false when storage is blocked. */
export function removeStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (_) {
        return false;
    }
}
