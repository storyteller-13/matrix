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
                    id:   'spacetime journey through the galaxies',
                    name: 'spacetime journey through the galaxies',
                    songs: [
                        { id: 'pDyl6I6ESSw', title: 'space oddity (bowie)' },
                        { id: 'o7WGrdg-p4Y', title: 'a deep breath (giuseppe centonze)' },
                        { id: 'IysMLKomjXs', title: 'singularity (james malikey)' },
                        { id: 'OqK2XmcWu8g', title: 'abstract jazz for disappearing into work (sileo)' },
                        { id: 'JCX0SEX9YMo', title: 'way out (blume)' },
                        { id: 'yzW0kLJSwkc', title: 'the 2nd coming was a moonrise (hammock)' },
                        { id: 'LTiqKDrjqr4', title: 'summer\'26 stargazing fest (lofi girl)' },
                        { id: '2gezcxmmy30', title: 'love is in small things (puuung1)' },
                        { id: '6K5yqX4Np1Y', title: 'hyperion (ambient civilization)' },
                        { id: 'v1ZkSsxl98A', title: 'a moment before forever (sci-fi ambience)' },
                        { id: 'JcHtM0PEETo', title: 'stillness in the cosmos (spiritual brother sci-fi)' },
                        { id: 'oJ5ciSr8rAc', title: 'all that we perceive (thievery corporation)' },
                    ]
                },

                {
                    id:   'life around our beautiful planet ➜ brazil',
                    name: 'life around our beautiful planet ➜ brazil',
                    songs: [
                        { id: '5r4i5MNRtgI', title: 'astronauta (nenhum de nós)' },
                        { id: '8D7yIqJIMwA', title: 'primavera (tim maia)' },
                        { id: 'gWSSanodnIs', title: 'baila comigo (rita lee)' },
                        { id: 'R_mbnbcEIoE', title: 'eu te amo (ana carolina)' },
                        { id: 'rfrpOhC6858', title: 'taj mahal (jorge ben jor)' },
                        { id: 'Fc9e27PFIlo', title: 'joao e maria (chico buarque)' },
                        { id: '_rZCF09BeYw', title: 'o segundo sol (cassia eller)' },
                        { id: 'wJ2prEKx3_Y', title: 'o leãozinho (caetano veloso)' },
                        { id: 'JFfvlwfql-g', title: 'casinha de sape (kid abelha)' },
                        { id: 'NK88geNsUmQ', title: 'te ver e nao te querer (skank)' },
                        { id: '-NAqR4E5KnA', title: 'amor meu grande amor (angela ro ro)' },
                        { id: '8uPXyMaU3co', title: 'paisagem da janela (milton nascimento)' },
                        { id: 'Gbv4pB3YmL4', title: 'aguas de março (elis regina + tom jobim)' },
                        { id: '8JKxOBUA3cY', title: 'assim caminha a humanidade (lulu santos)' },
                        { id: 'ao65W_bOs5M', title: 'eu sei que vou te amar (vinicius de moraes)' },
                        { id: 'TnK29aJCOp4', title: 'stairway to heaven (orquestra sinfônica curitiba)' },
                    ]
                },

                {
                    id:   'life around our beautiful planet ➜ japan',
                    name: 'life around our beautiful planet ➜ japan',
                    songs: []
                },

            ],

            currentPlaylistId: 'spacetime journey through the galaxies'
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
            data.currentPlaylistId = defaultData.currentPlaylistId;
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

window.MusicPlayerStorage = MusicPlayerStorage;
