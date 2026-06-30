/**
 * NotesStorage tests – load script in jsdom and assert load/save contract
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

    it('defines NotesStorage class with load and save', () => {
        const NotesStorage = window.NotesStorage;
        expect(NotesStorage).toBeDefined();
        expect(typeof NotesStorage.prototype.load).toBe('function');
        expect(typeof NotesStorage.prototype.save).toBe('function');
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

    it('save() accepts array without throwing', () => {
        const NotesStorage = window.NotesStorage;
        const storage = new NotesStorage();
        const entries = storage.load();
        expect(() => storage.save(entries)).not.toThrow();
    });

    it('save() returns early when given non-array', () => {
        const NotesStorage = window.NotesStorage;
        const storage = new NotesStorage();
        expect(() => storage.save(null)).not.toThrow();
        expect(() => storage.save({})).not.toThrow();
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
});
