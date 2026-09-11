/**
 * MusicPlayer tests – playlists, UI controls, and player state without a real YouTube iframe
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';

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

function FakePlayer(elementId, options) {
    this.elementId = elementId;
    this.options = options;
    this.state = -1;
    this.videoId = options.videoId;
    this.playVideo = vi.fn(() => { this.state = 1; });
    this.pauseVideo = vi.fn(() => { this.state = 2; });
    this.loadVideoById = vi.fn((id) => { this.videoId = id; });
    this.cueVideoById = vi.fn((id) => { this.videoId = id; });
    this.getPlayerState = vi.fn(() => this.state);
    if (options.events?.onReady) {
        options.events.onReady();
    }
}

const YT_STATES = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
};

const musicDom = () => `
    <a id="sound-icon-toggle"></a>
    <div id="music-player" class="music-player" style="display: none;">
        <button id="music-prev"></button>
        <span id="music-title"></span>
        <button id="music-next"></button>
        <button id="music-toggle"></button>
        <button id="music-close"></button>
        <div id="music-song-list"></div>
        <div id="music-youtube"></div>
    </div>
`;

describe('MusicPlayer', () => {
    beforeAll(async () => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        const yt = { Player: FakePlayer, PlayerState: YT_STATES };
        vi.stubGlobal('YT', yt);
        window.YT = yt;
        document.body.innerHTML = musicDom();
        await import('../applications/music-player/music-player-storage.js');
        await import('../applications/music-player/music-player.js');
    });

    beforeEach(() => {
        document.body.innerHTML = musicDom();
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('exposes MusicPlayerClass and MusicPlayer on window', () => {
        expect(window.MusicPlayerClass).toBeDefined();
        expect(window.MusicPlayer).toBeDefined();
    });

    it('init loads default songs and renders playlists', () => {
        const player = new window.MusicPlayerClass();
        expect(player.songs.length).toBeGreaterThan(0);
        expect(player.playlistsData.playlists.length).toBeGreaterThan(0);
        const list = document.getElementById('music-song-list');
        expect(list.innerHTML).toContain('music-playlist-header');
        expect(list.innerHTML).toContain('music-song-soon');
        expect(document.getElementById('music-player').style.display).toBe('flex');
        expect(player.isReady).toBe(true);
        expect(player.player).toBeTruthy();
    });

    it('playNextSong and playPreviousSong wrap around the playlist', () => {
        const player = new window.MusicPlayerClass();
        const last = player.songs.length - 1;
        player.currentSongIndex = last;
        player.playNextSong();
        expect(player.currentSongIndex).toBe(0);
        player.playPreviousSong();
        expect(player.currentSongIndex).toBe(last);
    });

    it('playNextSong and playPreviousSong no-op when there are no songs', () => {
        const player = new window.MusicPlayerClass();
        player.songs = [];
        player.currentSongIndex = 0;
        player.playNextSong();
        player.playPreviousSong();
        expect(player.currentSongIndex).toBe(0);
    });

    it('switchPlaylist changes songs; empty playlist is ignored', () => {
        const player = new window.MusicPlayerClass();
        const empty = player.playlistsData.playlists.find(p => !p.songs.length);
        const other = player.playlistsData.playlists.find(p => p.songs.length > 0 && p.id !== player.playlistsData.currentPlaylistId);
        const before = player.playlistsData.currentPlaylistId;
        player.switchPlaylist(empty.id);
        expect(player.playlistsData.currentPlaylistId).toBe(before);
        player.switchPlaylist(other.id);
        expect(player.playlistsData.currentPlaylistId).toBe(other.id);
        expect(player.songs.map(s => s.id)).toEqual(other.songs.map(s => s.id));
        expect(player.player.loadVideoById).not.toHaveBeenCalled();
        expect(player.player.cueVideoById).toHaveBeenCalled();
    });

    it('playSongAtIndex loads a different song and toggles the current one', () => {
        const player = new window.MusicPlayerClass();
        player.player.state = YT_STATES.PAUSED;
        player.playSongAtIndex(1);
        expect(player.currentSongIndex).toBe(1);
        expect(player.player.loadVideoById).toHaveBeenCalled();
        player.player.state = YT_STATES.PLAYING;
        player.playSongAtIndex(1);
        expect(player.player.pauseVideo).toHaveBeenCalled();
    });

    it('playSongAtIndex ignores invalid indexes', () => {
        const player = new window.MusicPlayerClass();
        const index = player.currentSongIndex;
        player.playSongAtIndex(-1);
        player.playSongAtIndex(99);
        player.playSongAtIndex(1.5);
        expect(player.currentSongIndex).toBe(index);
    });

    it('clicking a playlist header expands it and switches playlist', () => {
        const player = new window.MusicPlayerClass();
        const other = player.playlistsData.playlists.find(p => p.songs.length > 0 && p.id !== player.playlistsData.currentPlaylistId);
        const header = document.querySelector(`.music-playlist-header[data-playlist-id="${other.id}"]`);
        header.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(player.expandedPlaylists.has(other.id)).toBe(true);
        expect(player.playlistsData.currentPlaylistId).toBe(other.id);
        const headerAgain = document.querySelector(`.music-playlist-header[data-playlist-id="${other.id}"]`);
        headerAgain.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(player.expandedPlaylists.has(other.id)).toBe(false);
    });

    it('clicking a song item switches playlist and plays that song', () => {
        const player = new window.MusicPlayerClass();
        const other = player.playlistsData.playlists.find(p => p.songs.length > 1 && p.id !== player.playlistsData.currentPlaylistId);
        const item = document.querySelector(`.music-song-item-small[data-playlist-id="${other.id}"][data-song-index="1"]`);
        item.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(player.playlistsData.currentPlaylistId).toBe(other.id);
        expect(player.currentSongIndex).toBe(1);
    });

    it('nav buttons and toggle wire up to player methods', () => {
        const player = new window.MusicPlayerClass();
        const nextSpy = vi.spyOn(player, 'playNextSong');
        const prevSpy = vi.spyOn(player, 'playPreviousSong');
        const toggleSpy = vi.spyOn(player, 'togglePlayPause');
        document.getElementById('music-next').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        document.getElementById('music-prev').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        document.getElementById('music-toggle').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(nextSpy).toHaveBeenCalled();
        expect(prevSpy).toHaveBeenCalled();
        expect(toggleSpy).toHaveBeenCalled();
    });

    it('togglePlayPause plays, pauses, and swallows player errors', () => {
        const player = new window.MusicPlayerClass();
        player.player.state = YT_STATES.PLAYING;
        player.togglePlayPause();
        expect(player.player.pauseVideo).toHaveBeenCalled();
        player.player.state = YT_STATES.PAUSED;
        player.togglePlayPause();
        expect(player.player.playVideo).toHaveBeenCalled();
        player.player.getPlayerState.mockImplementation(() => { throw new Error('gone'); });
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => player.togglePlayPause()).not.toThrow();
        errorSpy.mockRestore();
    });

    it('togglePlayPause returns early when the player is not ready', () => {
        const player = new window.MusicPlayerClass();
        player.isReady = false;
        player.togglePlayPause();
        expect(player.player.playVideo).not.toHaveBeenCalled();
        expect(player.player.pauseVideo).not.toHaveBeenCalled();
    });

    it('onStateChange updates playing class and advances on ended', () => {
        const player = new window.MusicPlayerClass();
        const nextSpy = vi.spyOn(player, 'playNextSong');
        const musicToggle = document.getElementById('music-toggle');
        const musicPlayer = document.getElementById('music-player');
        player.onStateChange({ data: YT_STATES.PLAYING });
        expect(musicToggle.classList.contains('playing')).toBe(true);
        expect(musicPlayer.classList.contains('playing')).toBe(true);
        player.onStateChange({ data: YT_STATES.PAUSED });
        expect(musicToggle.classList.contains('playing')).toBe(false);
        player.onStateChange({ data: YT_STATES.ENDED });
        expect(nextSpy).toHaveBeenCalledWith(true);
        expect(() => player.onStateChange(null)).not.toThrow();
    });

    it('handlePlayerError skips unplayable videos', () => {
        vi.useFakeTimers();
        const player = new window.MusicPlayerClass();
        const nextSpy = vi.spyOn(player, 'playNextSong');
        player.handlePlayerError({ data: 100 });
        vi.advanceTimersByTime(1000);
        expect(nextSpy).toHaveBeenCalledWith(true);
        nextSpy.mockClear();
        player.handlePlayerError({ data: 5 });
        vi.advanceTimersByTime(1000);
        expect(nextSpy).not.toHaveBeenCalled();
    });

    it('toggleVisibility hides then shows the player', () => {
        vi.useFakeTimers();
        const player = new window.MusicPlayerClass();
        const el = document.getElementById('music-player');
        el.style.display = 'flex';
        player.toggleVisibility();
        vi.advanceTimersByTime(400);
        expect(el.style.display).toBe('none');
        player.toggleVisibility();
        expect(el.style.display).toBe('flex');
    });

    it('close and sound icon toggle visibility', () => {
        const player = new window.MusicPlayerClass();
        const spy = vi.spyOn(player, 'toggleVisibility');
        document.getElementById('music-close').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        document.getElementById('sound-icon-toggle').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('setupPlayer replaces an iframe youtube element', () => {
        document.body.innerHTML = `
            <div id="music-player" style="display: none;">
                <div id="music-song-list"></div>
                <iframe id="music-youtube"></iframe>
            </div>
        `;
        const player = new window.MusicPlayerClass();
        expect(document.getElementById('music-youtube').tagName).toBe('DIV');
        expect(player.player).toBeTruthy();
    });

    it('loadSong cues when idle and loads when already playing', () => {
        const player = new window.MusicPlayerClass();
        player.player.state = YT_STATES.UNSTARTED;
        player.loadSong();
        expect(player.player.cueVideoById).toHaveBeenCalled();
        player.player.state = YT_STATES.PLAYING;
        player.loadSong(true);
        expect(player.player.loadVideoById).toHaveBeenCalled();
        expect(player.player.playVideo).toHaveBeenCalled();
    });

    it('setupYouTubeAPI waits for the iframe API and chains an existing callback', () => {
        vi.useFakeTimers();
        const existing = vi.fn();
        window.onYouTubeIframeAPIReady = existing;
        const origYT = window.YT;
        delete window.YT;
        delete global.YT;
        const player = new window.MusicPlayerClass();
        expect(player.player).toBeFalsy();
        window.YT = origYT;
        global.YT = origYT;
        window.onYouTubeIframeAPIReady();
        expect(existing).toHaveBeenCalled();
        expect(player.player).toBeTruthy();
    });

    it('setupYouTubeAPI interval sets up the player then gives up', () => {
        vi.useFakeTimers();
        const origYT = window.YT;
        delete window.YT;
        delete global.YT;
        const player = new window.MusicPlayerClass();
        window.YT = origYT;
        global.YT = origYT;
        vi.advanceTimersByTime(100);
        expect(player.player).toBeTruthy();

        delete window.YT;
        delete global.YT;
        const waiting = new window.MusicPlayerClass();
        vi.advanceTimersByTime(6000);
        expect(waiting.player).toBeFalsy();
        window.YT = origYT;
        global.YT = origYT;
    });

    it('setupPlayer returns early without an element, API, or songs', () => {
        const player = new window.MusicPlayerClass();
        player.player = null;
        player.isReady = false;
        document.getElementById('music-youtube').remove();
        player.setupPlayer();
        expect(player.player).toBeNull();

        document.body.innerHTML = musicDom();
        const origYT = window.YT;
        delete window.YT;
        player.setupPlayer();
        window.YT = origYT;
        player.songs = [];
        player.loadPlaylists = vi.fn(() => { player.songs = []; });
        player.setupPlayer();
        expect(player.loadPlaylists).toHaveBeenCalled();
    });

    it('setupPlayer resets a bad index and swallows constructor errors', () => {
        const player = new window.MusicPlayerClass();
        player.player = null;
        player.isReady = false;
        player.currentSongIndex = 99;
        player.setupPlayer();
        expect(player.currentSongIndex).toBe(0);

        player.player = null;
        player.isReady = false;
        const orig = window.YT.Player;
        window.YT.Player = function () { throw new Error('boom'); };
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => player.setupPlayer()).not.toThrow();
        window.YT.Player = orig;
        errorSpy.mockRestore();
    });

    it('setupPlayer skips re-init when already ready and wires player events', () => {
        const player = new window.MusicPlayerClass();
        const existing = player.player;
        player.setupPlayer();
        expect(player.player).toBe(existing);
        existing.options.events.onStateChange({ data: YT_STATES.ENDED });
        existing.options.events.onError({ data: 2 });
    });

    it('loadPlaylists falls back to defaults when the current playlist is empty', () => {
        const player = new window.MusicPlayerClass();
        player.playlistsData.currentPlaylistId = 'the life around the planet earth: japan';
        player.storage.save(player.playlistsData);
        player.currentSongIndex = 3;
        player.loadPlaylists();
        expect(player.songs.length).toBeGreaterThan(0);
        expect(player.currentSongIndex).toBe(0);
    });

    it('switchPlaylist no-ops without data and sets up a missing player', () => {
        const player = new window.MusicPlayerClass();
        player.playlistsData = null;
        expect(() => player.switchPlaylist('x')).not.toThrow();
        player.loadPlaylists();
        player.player = null;
        player.isReady = false;
        const setup = vi.spyOn(player, 'setupPlayer').mockImplementation(() => {});
        const other = player.storage.getDefaultData().playlists.find(p => p.songs.length > 1 && p.id !== player.playlistsData.currentPlaylistId);
        player.playlistsData = player.storage.getDefaultData();
        player.switchPlaylist(other.id);
        expect(setup).toHaveBeenCalled();
        player.switchPlaylist(other.id, { loadFirst: false });
    });

    it('loadSong guards missing player, songs, and indexes', () => {
        const player = new window.MusicPlayerClass();
        player.isReady = false;
        player.loadSong();
        player.isReady = true;
        player.songs = [];
        player.loadSong();
        player.songs = [{ id: 'a', title: 'a' }];
        player.currentSongIndex = 5;
        player.loadSong();
        expect(player.currentSongIndex).toBe(0);
        player.songs = [null];
        player.currentSongIndex = 0;
        player.loadSong();
        player.songs = [{ id: 'a', title: 'a' }];
        player.player.getPlayerState.mockImplementation(() => { throw new Error('gone'); });
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => player.loadSong()).not.toThrow();
        errorSpy.mockRestore();
    });

    it('playSongAtIndex no-ops without songs', () => {
        const player = new window.MusicPlayerClass();
        player.songs = [];
        expect(() => player.playSongAtIndex(0)).not.toThrow();
    });

    it('togglePlayPause handles buffering and cued states', () => {
        const player = new window.MusicPlayerClass();
        player.player.state = YT_STATES.BUFFERING;
        player.togglePlayPause();
        expect(player.player.pauseVideo).toHaveBeenCalled();
        player.player.state = YT_STATES.CUED;
        player.togglePlayPause();
        expect(player.player.playVideo).toHaveBeenCalled();
        player.player.state = YT_STATES.ENDED;
        player.togglePlayPause();
        player.player.state = YT_STATES.UNSTARTED;
        player.togglePlayPause();
    });

    it('onStateChange ignores missing toggle nodes and ended when empty', () => {
        const player = new window.MusicPlayerClass();
        document.getElementById('music-toggle').remove();
        document.getElementById('music-player').remove();
        expect(() => player.onStateChange({ data: YT_STATES.PLAYING })).not.toThrow();
        expect(() => player.onStateChange({ data: YT_STATES.PAUSED })).not.toThrow();
        player.songs = [];
        const nextSpy = vi.spyOn(player, 'playNextSong');
        player.onStateChange({ data: YT_STATES.ENDED });
        expect(nextSpy).not.toHaveBeenCalled();
    });

    it('toggleVisibility no-ops without a player element', () => {
        const player = new window.MusicPlayerClass();
        document.getElementById('music-player').remove();
        expect(() => player.toggleVisibility()).not.toThrow();
    });

    it('init skips showPlayer when the player node is missing', () => {
        document.body.innerHTML = `<div id="music-song-list"></div><div id="music-youtube"></div>`;
        const player = new window.MusicPlayerClass();
        expect(player.songs.length).toBeGreaterThan(0);
    });

    it('stays closed on mobile init', () => {
        const original = window.matchMedia;
        window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
        const player = new window.MusicPlayerClass();
        expect(player.isMobile()).toBe(true);
        expect(player.shouldAutoOpen()).toBe(false);
        expect(document.getElementById('music-player').style.display).not.toBe('flex');
        expect(player.player).toBeFalsy();
        window.matchMedia = original;
    });

    it('playSongAtIndex loads YouTube when the player was not started', () => {
        const original = window.matchMedia;
        window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
        const player = new window.MusicPlayerClass();
        expect(player.player).toBeFalsy();
        player.playSongAtIndex(1);
        expect(player.currentSongIndex).toBe(1);
        expect(player.player).toBeTruthy();
        expect(player.player.playVideo).toHaveBeenCalled();
        window.matchMedia = original;
    });

    it('togglePlayPause starts YouTube on the first tap when it was not loaded', () => {
        const original = window.matchMedia;
        window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
        const player = new window.MusicPlayerClass();
        expect(player.player).toBeFalsy();
        player.togglePlayPause();
        expect(player.player).toBeTruthy();
        expect(player.player.playVideo).toHaveBeenCalled();
        window.matchMedia = original;
    });

    it('stays closed when Env says not to auto-open desktop panels', () => {
        const originalEnv = window.Env;
        window.Env = { shouldAutoOpenDesktopPanels: () => false };
        const player = new window.MusicPlayerClass();
        expect(player.shouldAutoOpen()).toBe(false);
        expect(player.player).toBeFalsy();
        expect(document.getElementById('music-player').style.display).not.toBe('flex');
        window.Env = originalEnv;
    });

    it('flushPendingPlay plays when ready and swallows player errors', () => {
        const player = new window.MusicPlayerClass();
        player.pendingPlay = true;
        player.flushPendingPlay();
        expect(player.player.playVideo).toHaveBeenCalled();
        player.pendingPlay = true;
        player.player.playVideo.mockImplementation(() => { throw new Error('gone'); });
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => player.flushPendingPlay()).not.toThrow();
        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
    });

    it('loadYouTubeScript inserts the iframe API once', () => {
        const player = new window.MusicPlayerClass();
        document.getElementById('youtube-iframe-api')?.remove();
        player.loadYouTubeScript();
        player.loadYouTubeScript();
        expect(document.querySelectorAll('#youtube-iframe-api').length).toBe(1);
        expect(document.getElementById('youtube-iframe-api').getAttribute('src')).toContain('iframe_api');
        document.getElementById('youtube-iframe-api').remove();
    });

    it('showPlayer animates in via requestAnimationFrame', () => {
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
        const player = new window.MusicPlayerClass();
        const el = document.getElementById('music-player');
        player.showPlayer(el);
        expect(el.style.opacity).toBe('1');
    });

    it('updateSongTitle skips a missing title node', () => {
        document.body.innerHTML = `
            <div id="music-player">
                <div id="music-song-list"></div>
                <div id="music-youtube"></div>
            </div>
        `;
        const player = new window.MusicPlayerClass();
        expect(() => player.updateSongTitle()).not.toThrow();
    });

    it('renderSongList returns early without data', () => {
        const player = new window.MusicPlayerClass();
        player.playlistsData = null;
        expect(() => player.renderSongList()).not.toThrow();
        player.playlistsData = { playlists: null };
        expect(() => player.renderSongList()).not.toThrow();
    });
});
