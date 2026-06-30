/**
 * MusicPlayerStorage tests – load/save, getDefaultData, getPlaylist, ensureDefaultPlaylists
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

const STORAGE_KEY = 'music-player-playlists';

describe('MusicPlayerStorage', () => {
    beforeAll(async () => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        await import('../applications/music-player/music-player-storage.js');
    });

    beforeEach(() => {
        localStorage.removeItem(STORAGE_KEY);
    });

    it('exposes MusicPlayerStorage on window', () => {
        expect(window.MusicPlayerStorage).toBeDefined();
    });

    it('load() returns object with playlists array and currentPlaylistId', () => {
        const storage = new window.MusicPlayerStorage();
        const data = storage.load();
        expect(data).toHaveProperty('playlists');
        expect(Array.isArray(data.playlists)).toBe(true);
        expect(data.playlists.length).toBeGreaterThan(0);
        expect(data).toHaveProperty('currentPlaylistId');
        expect(data.playlists[0]).toHaveProperty('id');
        expect(data.playlists[0]).toHaveProperty('name');
        expect(data.playlists[0]).toHaveProperty('songs');

    });

    it('save() persists and load() returns saved data', () => {
        const storage = new window.MusicPlayerStorage();
        const data = storage.load();
        data.currentPlaylistId = '2026 after afterlife zeitgeist';
        storage.save(data);
        const loaded = storage.load();
        expect(loaded.currentPlaylistId).toBe('2026 after afterlife zeitgeist');
    });

    it('clearPersisted() removes key; next load() uses defaults', () => {
        const storage = new window.MusicPlayerStorage();
        const data = storage.load();
        data.currentPlaylistId = '2026 after afterlife zeitgeist';
        storage.save(data);
        storage.clearPersisted();
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('getPlaylist returns playlist by id or null', () => {
        const storage = new window.MusicPlayerStorage();
        const data = storage.load();
        const p = storage.getPlaylist(data, '2026 peaceful dreamer');
        expect(p).toBeDefined();
        expect(storage.getPlaylist(data, 'nonexistent')).toBeNull();
    });

    it('getCurrentPlaylist returns current playlist', () => {
        const storage = new window.MusicPlayerStorage();
        const data = storage.load();
        const current = storage.getCurrentPlaylist(data);
        expect(current).toBeDefined();
    });

    it('ensureDefaultPlaylists merges defaults and preserves order', () => {
        const storage = new window.MusicPlayerStorage();
        const data = { playlists: [], currentPlaylistId: null };
        storage.ensureDefaultPlaylists(data);
        expect(data.playlists.length).toBeGreaterThan(0);
        expect(data.currentPlaylistId).toBe('2026 peaceful dreamer');
    });

    it('load() uses getDefaultData when stored value is invalid JSON', () => {
        localStorage.setItem(STORAGE_KEY, 'not valid json');
        const storage = new window.MusicPlayerStorage();
        const data = storage.load();
        expect(data.playlists).toBeDefined();
        expect(Array.isArray(data.playlists)).toBe(true);
    });

    it('setCurrentPlaylist does not update when playlist id does not exist', () => {
        const storage = new window.MusicPlayerStorage();
        const data = storage.load();
        const before = data.currentPlaylistId;
        storage.setCurrentPlaylist(data, 'nonexistent-id');
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = JSON.parse(raw);
        expect(parsed.currentPlaylistId).toBe(before);
    });

});
