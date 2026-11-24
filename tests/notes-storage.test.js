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

    it('derives stable identifiers from translation keys, titles, and dates', () => {
        const storage = new window.NotesStorage();
        expect(storage.deriveStableId({ titleKey: 'notes.my-story.title' })).toBe('my-story');
        expect(storage.deriveStableId({ titleKey: 'other.key', title: 'Hello, World!' })).toBe('hello-world');
        expect(storage.deriveStableId({ date: '2026-04-05T10:00:00Z' })).toBe('2026-04-05');
        expect(storage.deriveStableId({ date: 'unknown', createdAt: 'also-unknown' })).toBeNull();
        expect(storage.deriveStableId({ title: ' !!! ' })).toBeNull();
        expect(storage.deriveStableId(null)).toBeNull();
    });

    it('normalizes explicit values and generates an id when no stable source exists', () => {
        const storage = new window.NotesStorage();
        const complete = storage.normalizeEntry({
            id: 'explicit', title: 'Title', content: 'Body', titleKey: 'title.key', contentKey: 'body.key',
            date: '2026-02-03', createdAt: 'ignored', updatedAt: 'today', read: true, italic: true, asciiArt: true,
        });
        expect(complete).toMatchObject({
            id: 'explicit', title: 'Title', content: 'Body', titleKey: 'title.key', contentKey: 'body.key',
            createdAt: '2026-02-03', updatedAt: 'today', read: true, italic: true, asciiArt: true,
        });
        vi.spyOn(storage, 'generateId').mockReturnValue('generated');
        expect(storage.normalizeEntry({}).id).toBe('generated');
    });

    it('cleans content and returns an empty string for blank input', () => {
        const storage = new window.NotesStorage();
        expect(storage.cleanContent('')).toBe('');
        expect(storage.cleanContent('\n    first\n\n\n    second\n    ')).toBe('first\n\nsecond');
        expect(storage.cleanContent('\n\n')).toBe('');
    });

    it('returns empty date keys for invalid dates and uses the Pacific calendar day', () => {
        const storage = new window.NotesStorage();
        expect(storage.getPacificDateParts(null)).toBeNull();
        expect(storage.getPacificDateParts('invalid')).toBeNull();
        expect(storage.getDateKey('2026-03-08T06:30:00Z')).toBe('2026-03-07');
        expect(storage.getDateKey('invalid')).toBe('');
    });

    it('load tolerates storage being blocked', () => {
        const storage = new window.NotesStorage();
        const workingStorage = localStorage;
        vi.stubGlobal('localStorage', { removeItem() { throw new Error('blocked'); } });
        expect(storage.load().length).toBeGreaterThan(0);
        vi.stubGlobal('localStorage', workingStorage);
    });
});
