/**
 * NotesStorage tests – load script in jsdom and assert load contract
 */
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

function makeFakeStorage() {
    const store = {};
    return {
        getItem(k) { return store[k] ?? null; },
        setItem(k, v) { store[k] = String(v); },
        removeItem(k) { delete store[k]; },
        clear() { for (const k of Object.keys(store)) delete store[k]; },
        get length() { return Object.keys(store).length; },
        key(i) { return Object.keys(store)[i] ?? null; },
    };
}

const NOTES_KEY = 'notes-entries';

describe('NotesStorage', () => {
    beforeAll(async () => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        await import('../applications/notes/notes-storage.js');
    });

    beforeEach(() => {
        localStorage.removeItem(NOTES_KEY);
    });

    it('defines NotesStorage class with load', () => {
        const NotesStorage = window.NotesStorage;
        expect(NotesStorage).toBeDefined();
        expect(typeof NotesStorage.prototype.load).toBe('function');
    });

    it('load() returns an array of entries with expected shape', () => {
        const NotesStorage = window.NotesStorage;
        const storage = new NotesStorage();
        const entries = storage.load();
        expect(Array.isArray(entries)).toBe(true);
        expect(entries.length).toBeGreaterThan(0);
        const first = entries[0];
        expect(first).toHaveProperty('id');
        expect(first).toHaveProperty('title');
        expect(first).toHaveProperty('content');
        expect(first).toHaveProperty('createdAt');
    });

    it('formatDate returns empty for null or invalid date', () => {
        const NotesStorage = window.NotesStorage;
        const storage = new NotesStorage();
        expect(storage.formatDate(null)).toBe('');
        expect(storage.formatDate('not-a-date')).toBe('');
    });

    it('formatDate returns formatted string for valid date', () => {
        const NotesStorage = window.NotesStorage;
        const storage = new NotesStorage();
        const out = storage.formatDate('2026-03-07T00:00:00.000Z');
        expect(out).toMatch(/\d{4}/);
        expect(out).toMatch(/saturday|sunday|monday|tuesday|wednesday|thursday|friday/i);
    });

    it('normalizeEntry fills missing fields from createdAt', () => {
        const storage = new window.NotesStorage();
        const entry = storage.normalizeEntry({ createdAt: '2026-01-01T00:00:00.000Z' });
        expect(entry.id).toBeTruthy();
        expect(entry.title).toBe('');
        expect(entry.content).toBe('');
        expect(entry.createdAt).toBe('2026-01-01T00:00:00.000Z');
        expect(entry.updatedAt).toBeNull();
        expect(entry.read).toBe(false);
        expect(entry.italic).toBe(false);
        expect(entry.asciiArt).toBe(false);
    });

    it('cleanContent returns empty for falsy input and trims blank lines', () => {
        const storage = new window.NotesStorage();
        expect(storage.cleanContent()).toBe('');
        expect(storage.cleanContent('')).toBe('');
        expect(storage.cleanContent('\n\n  hello\n\n\n  world\n\n')).toBe('hello\n\nworld');
    });

    it('default entries keep translation keys', () => {
        const storage = new window.NotesStorage();
        const [entry] = storage.load();
        expect(entry.titleKey).toBe('notes.hello.title');
        expect(entry.contentKey).toBe('notes.hello.content');
        expect(entry.title).toBe('hello starlit world');
    });

    it('formatDate uses translated weekday names when I18n is present', () => {
        const storage = new window.NotesStorage();
        window.I18n = {
            t(key) {
                if (key.startsWith('notes.weekday.')) return 'にちようび';
                return key;
            },
        };
        expect(storage.formatDate('2026-03-08T12:00:00.000Z')).toContain('にちようび');
        window.I18n = { t: (key) => key };
        expect(storage.formatDate('2026-03-08T12:00:00.000Z')).toMatch(/sunday|monday|tuesday|wednesday|thursday|friday|saturday/);
        window.I18n = undefined;
    });
});
