/**
 * Music Player Storage Module
 * Handles localStorage persistence for playlists
 */
class MusicPlayerStorage {
    constructor() {
        this.storageKey = 'music-player-playlists';
    }

    /**
     * Remove persisted playlists so the next load() starts from defaults.
     */
    clearPersisted() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            // ignore quota / private mode
        }
    }

    /**
     * Load playlists from localStorage or return default data
     * @returns {Object} Playlists data object with playlists array
     */
    load() {
        const stored = localStorage.getItem(this.storageKey);
        let data;
        
        if (stored) {
            try {
                data = JSON.parse(stored);
            } catch (e) {
                data = this.getDefaultData();
                this.save(data);
            }
        } else {
            data = this.getDefaultData();
            this.save(data);
        }
        
        return data;
    }

    /**
     * Save playlists data to localStorage
     * @param {Object} data - Playlists data object to save
     */
    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            // Error saving to storage
        }
    }

    /**
     * Get default playlists data structure
     * @returns {Object} Default playlists data
     */
    getDefaultData() {
        return {
            playlists: [
                {
                    id:   'the cutest couple in the world',
                    name: 'the cutest couple in the world',
                    songs: [
                        { id: 'bG0QEvaIGfQ', title: 'ghost of a chance (rush)' },
                        { id: 'n2MtEsrcTTs', title: 'harvest moon (neil young)' },
                        { id: 'G2dR2DV-eGc', title: 'hard to concentrate (rhcp)' },
                        { id: 'x11NA63gLDM', title: 'change the world (eric clapton)' },
                        { id: 'ozXZnwYTMbs', title: 'nothing else matters (metallica)' },
                        { id: 'F-F_oHOvBsM', title: 'in the stars (the rolling stones)' },
                        { id: 'fF8GARU44iY', title: 'wild mountain honey (steve miller)' }
                    ]
                },
            ],
            currentPlaylistId: 'the cutest couple in the world'
        };
    }

    /**
     * Ensure default playlists exist in data (merge in missing playlists/songs, enforce order).
     * Mutates data. Call save(data) after if you need to persist.
     * @param {Object} data - Playlists data object
     */
    ensureDefaultPlaylists(data) {
        if (!data.playlists) {
            data.playlists = [];
        }
        const defaultData = this.getDefaultData();
        const defaultPlaylistIds = new Set(defaultData.playlists.map(p => p.id));

        defaultData.playlists.forEach((defaultPlaylist, position) => {
            let playlist = this.getPlaylist(data, defaultPlaylist.id);
            if (!playlist) {
                playlist = {
                    id: defaultPlaylist.id,
                    name: defaultPlaylist.name,
                    songs: defaultPlaylist.songs.map(s => ({ ...s }))
                };
                data.playlists.splice(position, 0, playlist);
            } else {
                if (!playlist.songs) playlist.songs = [];
                defaultPlaylist.songs.forEach(defaultSong => {
                    if (!playlist.songs.some(s => s.id === defaultSong.id)) {
                        playlist.songs.push({ ...defaultSong });
                    }
                });
                const currentIndex = data.playlists.findIndex(p => p.id === defaultPlaylist.id);
                if (currentIndex !== position) {
                    data.playlists.splice(currentIndex, 1);
                    data.playlists.splice(position, 0, playlist);
                }
            }
        });
        if (!data.currentPlaylistId || !defaultPlaylistIds.has(data.currentPlaylistId)) {
            data.currentPlaylistId = '2026 peaceful dreamer';
        }
    }

    /**
     * Get a playlist by ID
     * @param {Object} data - Playlists data object
     * @param {string} playlistId - ID of the playlist to get
     * @returns {Object|null} Playlist object or null if not found
     */
    getPlaylist(data, playlistId) {
        return data.playlists.find(p => p.id === playlistId) || null;
    }

    /**
     * Get the current active playlist
     * @param {Object} data - Playlists data object
     * @returns {Object|null} Current playlist or null if not found
     */
    getCurrentPlaylist(data) {
        const currentId = data.currentPlaylistId;
        if (!currentId) return null;
        return this.getPlaylist(data, currentId);
    }

    /**
     * Set the current active playlist
     * @param {Object} data - Playlists data object
     * @param {string} playlistId - ID of the playlist to set as current
     */
    setCurrentPlaylist(data, playlistId) {
        if (this.getPlaylist(data, playlistId)) {
            data.currentPlaylistId = playlistId;
            this.save(data);
        }
    }
}

// Expose class for testing
if (typeof window !== 'undefined') {
    window.MusicPlayerStorage = MusicPlayerStorage;
}
