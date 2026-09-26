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
        const loaded = storage.load();
        expect(loaded.currentPlaylistId).toBe(storage.getDefaultData().currentPlaylistId);
    });

    it('clearPersisted() ignores storage errors', () => {
        const storage = new window.MusicPlayerStorage();
        vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
            throw new Error('private mode');
        });
        expect(() => storage.clearPersisted()).not.toThrow();
        vi.restoreAllMocks();
    });

    it('getPlaylist returns playlist by id or null', () => {
        const storage = new window.MusicPlayerStorage();
        const data = storage.load();
        const p = storage.getPlaylist(data, data.currentPlaylistId);
        expect(p).toBeDefined();
        expect(p.id).toBe(data.currentPlaylistId);
        expect(storage.getPlaylist(data, 'nonexistent')).toBeNull();
    });

    it('getCurrentPlaylist returns current playlist', () => {
        const storage = new window.MusicPlayerStorage();
        const data = storage.load();
        const current = storage.getCurrentPlaylist(data);
        expect(current).toBeDefined();
        expect(current.id).toBe(data.currentPlaylistId);
    });

    it('getCurrentPlaylist returns null when currentPlaylistId is missing', () => {
        const storage = new window.MusicPlayerStorage();
        const data = storage.load();
        data.currentPlaylistId = null;
        expect(storage.getCurrentPlaylist(data)).toBeNull();
        data.currentPlaylistId = '';
        expect(storage.getCurrentPlaylist(data)).toBeNull();
    });

    it('ensureDefaultPlaylists merges defaults and preserves order', () => {
        const storage = new window.MusicPlayerStorage();
        const data = { playlists: [], currentPlaylistId: null };
        storage.ensureDefaultPlaylists(data);
        const defaults = storage.getDefaultData();
        expect(data.playlists.map(p => p.id)).toEqual(defaults.playlists.map(p => p.id));
        expect(data.currentPlaylistId).toBe(defaults.currentPlaylistId);
    });

    it('ensureDefaultPlaylists creates playlists array when missing', () => {
        const storage = new window.MusicPlayerStorage();
        const data = { currentPlaylistId: null };
        storage.ensureDefaultPlaylists(data);
        expect(Array.isArray(data.playlists)).toBe(true);
        expect(data.playlists.length).toBe(storage.getDefaultData().playlists.length);
    });

    it('ensureDefaultPlaylists merges missing songs and restores playlist order', () => {
        const storage = new window.MusicPlayerStorage();
        const defaults = storage.getDefaultData();
        const first = defaults.playlists[0];
        const last = defaults.playlists[defaults.playlists.length - 1];
        const data = {
            playlists: [
                { id: last.id, name: last.name, songs: [] },
                { id: first.id, name: first.name, songs: first.songs.slice(0, 1) },
            ],
            currentPlaylistId: first.id,
        };
        storage.ensureDefaultPlaylists(data);
        expect(data.playlists.map(p => p.id)).toEqual(defaults.playlists.map(p => p.id));
        expect(data.playlists[0].songs.length).toBe(first.songs.length);
        expect(data.playlists[0].songs.map(s => s.id)).toEqual(first.songs.map(s => s.id));
    });

    it('ensureDefaultPlaylists fills a missing songs array on an existing playlist', () => {
        const storage = new window.MusicPlayerStorage();
        const defaults = storage.getDefaultData();
        const first = defaults.playlists[0];
        const data = {
            playlists: [{ id: first.id, name: first.name }],
            currentPlaylistId: first.id,
        };
        storage.ensureDefaultPlaylists(data);
        expect(data.playlists[0].songs.map(s => s.id)).toEqual(first.songs.map(s => s.id));
    });

    it('ensureDefaultPlaylists keeps a valid default currentPlaylistId', () => {
        const storage = new window.MusicPlayerStorage();
        const data = storage.getDefaultData();
        const keep = data.playlists[1].id;
        data.currentPlaylistId = keep;
        storage.ensureDefaultPlaylists(data);
        expect(data.currentPlaylistId).toBe(keep);
    });

    it('ensureDefaultPlaylists resets currentPlaylistId when it is not a default', () => {
        const storage = new window.MusicPlayerStorage();
        const data = storage.getDefaultData();
        data.currentPlaylistId = 'custom-playlist';
        storage.ensureDefaultPlaylists(data);
        expect(data.currentPlaylistId).toBe(storage.getDefaultData().currentPlaylistId);
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
        expect(data.currentPlaylistId).toBe(before);
    });

    it('setCurrentPlaylist updates current playlist and persists', () => {
        const storage = new window.MusicPlayerStorage();
        const data = storage.load();
        const nextId = data.playlists[1].id;
        storage.setCurrentPlaylist(data, nextId);
        expect(data.currentPlaylistId).toBe(nextId);
        const loaded = storage.load();
        expect(loaded.currentPlaylistId).toBe(nextId);
    });

    it('save() ignores storage errors', () => {
        const storage = new window.MusicPlayerStorage();
        vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
            throw new Error('quota');
        });
        expect(() => storage.save({ playlists: [] })).not.toThrow();
        vi.restoreAllMocks();
    });

});
