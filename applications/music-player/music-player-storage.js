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
                    id:   'the world we are creating together',
                    name: 'the world we are creating together',
                    songs: [
                        { id: '5f3sMmdG2sg', title: 'sunshine (jungle)' },
                        { id: 'G2nJPEDc02k', title: 'levitating (dua lipa)' },
                        { id: 'ZoC9_udLNeU', title: 'let\'s dance (david bowie)' },
                        { id: 'oHRNrgDIJfo', title: 'feeling good (nina simone)' },
                        { id: 'zp7NtW_hKJI', title: 'a sky full of stars (coldplay)' },
                        { id: 'x11NA63gLDM', title: 'change the world (eric clapton)' },
                    ]
                },

                {
                    id:   'the space voyage through galaxies',
                    name: 'the space voyage through galaxies',
                    songs: [
                        { id: 'TLYYh_E8bvk', title: 'space travel (blume)' },
                        { id: 'IysMLKomjXs', title: 'singularity (james malikey)' },
                        { id: '2gezcxmmy30', title: 'love is in small things (puuung1)' },
                        { id: 'o7WGrdg-p4Y', title: 'a deep breath (giuseppe centonze)' },
                        { id: 'KA1vU5sg_G0', title: 'waltz op. 69 no. 2 in b minor (chopin)' },

                        
                    ]
                },

                {
                    id:   'the time journey through dimensions',
                    name: 'the time journey through dimensions',
                    songs: [
                        { id: '6K5yqX4Np1Y', title: 'hyperion (ambient civilization)' },
                        { id: 'LTiqKDrjqr4', title: 'summer\'26 stargazing fest (lofi girl)' },
                        { id: 'v1ZkSsxl98A', title: 'a moment before forever (sci-fi ambience)' },
                        { id: 'yzW0kLJSwkc', title: 'the 2nd coming was a moonrise (hammock)' },
                        { id: 'JcHtM0PEETo', title: 'stillness in the cosmos (spiritual brother sci-fi)' },
                        { id: 'FaJ40cZUz84', title: 'drifting in your room among the stars (future city)' },
                    ]
                },

                {
                    id:   'the free people inside the babel tower',
                    name: 'the free people inside the babel tower',
                    songs: [
                        { id: '7YHgZ1EDr1U', title: 'heroes (david bowie)' },
                        { id: 'tVXXD7KXAec', title: 'rescuer (alex warren)' },
                        { id: 'afSgBNwmZrQ', title: 'petal (ariana grande)' },
                        { id: '-qcko5RfeLc', title: 'demon days (gorillaz)' },
                        { id: '3Zzz-xpjshM', title: 'time (alabama shakes)' },
                        { id: 'aWpw-Ynl0Yc', title: 'bass persuades (miley)' },
                        { id: 'HVHUjzZZGQ4', title: 'island in the sun (weezer)' },
                        { id: 'oytaoGL-mck', title: 'princess of the night (train)' },
                        { id: 'fDltPLFdkYI', title: 'power in the blood (polyphia)' },    
                        { id: 'fpQstZwQL5M', title: 'living undercover (rise against)' },  
                        { id: 'AXWHQb9VsJA', title: 'teach yourself (david duchovny)' }, 
                        { id: 'KWn5FkkuYwk', title: 'hear me now (kaskade x friends)' },
                        { id: '8NikIaI6gQM', title: 'rabbit ♡ (florence + the machine)' },
                        { id: 'zdJYdfkOJeg', title: 'the pretty girl in the tower (halsey)' },
                        { id: 'UezrC5nNQxE', title: 'when you\'ve had enough (evanescence)' },
                    ]
                },

            ],

            currentPlaylistId: 'a world we are creating together'
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
            data.currentPlaylistId = 'a space journey through galaxies';
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
