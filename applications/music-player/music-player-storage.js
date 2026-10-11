
/**
 * Music Player Storage Module
 * Handles localStorage persistence for playlists.
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
            // Ignore unavailable storage or private browsing restrictions.
        }
    }

    /**
     * Load playlists from localStorage or return default data.
     * Handles inaccessible storage, malformed JSON, and invalid data.
     *
     * @returns {Object} Playlists data object with playlists array.
     */
    load() {
        let stored;

        try {
            stored = localStorage.getItem(this.storageKey);
        } catch (e) {
            // Storage is unavailable. Use defaults without persistence.
            return this.getDefaultData();
        }

        if (!stored) {
            const data = this.getDefaultData();
            this.save(data);
            return data;
        }

        try {
            const data = JSON.parse(stored);

            if (
                !data ||
                typeof data !== 'object' ||
                !Array.isArray(data.playlists)
            ) {
                throw new Error('Invalid playlist data structure');
            }

            return data;
        } catch (e) {
            const data = this.getDefaultData();
            this.save(data);
            return data;
        }
    }

    /**
     * Save playlists data to localStorage.
     *
     * @param {Object} data - Playlists data object to save.
     */
    save(data) {
        try {
            localStorage.setItem(
                this.storageKey,
                JSON.stringify(data)
            );
        } catch (e) {
            // Ignore unavailable storage, quota errors, or serialization errors.
        }
    }

    /**
     * Get default playlists data structure.
     *
     * @returns {Object} Default playlists data.
     */
    getDefaultData() {
        return {
            playlists: [
                {
                    id: 'spacetime journey through the galaxies',
                    name: 'spacetime journey through the galaxies',
                    songs: [
                        { id: 'UDO8hHGZ3MU', title: 'amber of memory (tommy guerrero)' },
                        { id: 'HX33ezQhBio', title: 'night surf (soundgarden)' },
                        { id: 'o7WGrdg-p4Y', title: 'a deep breath (giuseppe centonze)' },
                        { id: 'IysMLKomjXs', title: 'singularity (james malikey)' },
                        { id: 'OqK2XmcWu8g', title: 'abstract jazz for disappearing into work (sileo)' },
                        { id: 'fBmQ8IDv140', title: 'somewhere over the rainbow (blume)' },
                        { id: '-cPmDQqHQN0', title: 'sleepless nights (nobody)' },
                        { id: 'yzW0kLJSwkc', title: 'the 2nd coming was a moonrise (hammock)' },
                        { id: 'LTiqKDrjqr4', title: "summer'26 stargazing fest (lofi girl)" },
                        { id: '2gezcxmmy30', title: 'love is in small things (puuung1)' },
                        { id: '6K5yqX4Np1Y', title: 'hyperion (ambient civilization)' },
                        { id: '4Ymarg9u0v0', title: '夢見る街  (future city)' },
                        { id: '0nfLWrDaQl8', title: 'oppenheimer (alienworlds)' },
                        { id: '4Opd1HFs--g', title: 'the call of ktulu (metallica)' },
                        { id: 'v1ZkSsxl98A', title: 'a moment before forever (sci-fi ambience)' },
                        { id: 'JcHtM0PEETo', title: 'stillness in the cosmos (spiritual brother sci-fi)' },
                        { id: '0DKHswQbr_8', title: 'gentle debussy (halidon music)' },
                        { id: 'pDyl6I6ESSw', title: 'space oddity (bowie)' }
                    ]
                },

                {
                    id: 'the free people inside babel ➜ prelude',
                    name: 'the free people inside babel ➜ prelude',
                    songs: [
                        { id: '3mbBbFH9fAg', title: 'black hole sun (soundgarden)' },
                        { id: '44FId4BpMx0', title: 'heroes (bowie)' },
                        { id: 'gt4eSe_43pg', title: 'like a stone (tom + serj)' },
                        { id: '-qcko5RfeLc', title: 'demon days (gorillaz)' },
                        { id: 'HQDB1n0UZtM', title: 'season of the witch (alanis morissette)' },
                        { id: 'eAOIpDUDGX4', title: 'where the goth girls at? (queens of the stone age)' },
                        { id: 'afSgBNwmZrQ', title: 'petal (ariana grande)' },
                        { id: '1mCN-RDh0-0', title: 'silencio (u2)' },
                        { id: 'xFMdDMELQIY', title: 'princess (drake)' },
                        { id: 'Sqhuk0iaq4k', title: 'ghost (jhené aiko)' },
                        { id: '_jkfczaOFDU', title: 'gasoline (sheryl crow)' },
                        { id: 'fpQstZwQL5M', title: 'living undercover (rise against)' },
                        { id: '8NikIaI6gQM', title: 'rabbit ♡ (florence + the machine)' },
                        { id: '8kQbg4Pqa4Q', title: 'helen keller (placebo)' },
                        { id: 'zdJYdfkOJeg', title: 'the pretty girl in the tower (halsey)' },
                        { id: 'agOOQ2wTS8I', title: 'underground (mogwai + iggy pop)' },
                        { id: 'UezrC5nNQxE', title: "when you've had enough (evanescence)" },
                        { id: '9uPMQ7KZ2KU', title: 'to whom it may concern (a perfect circle)' },
                        { id: 'ity-l7be1z0', title: "don't let me be misunderstood (joe cocker)" },
                        { id: 'vVXIK1xCRpY', title: 'show me how to live (audioslave)' },
                        { id: 'ooX11qSJoxQ', title: 'the last run on the ladder (tom morello)' },
                        { id: 'Tk9TM7-eTmw', title: 'joseph (falling in reverse)' },
                        { id: 'eVTXPUF4Oz4', title: 'in the end (linkin park)' },
                        { id: 'tgbkQxyYjS4', title: 'the divine feminine (mac miller)' },
                        { id: '6NZzjs3_VwY', title: 'burden the heavens (sabrina jordan)' }
                    ]
                },

                {
                    id: 'the free people inside babel ➜ interlude',
                    name: 'the free people inside babel ➜ interlude',
                    songs: [
                        { id: 'WC5FdFlUcl0', title: 'be yourself (audioslave)' },
                        { id: 'jsILu2K6K3E', title: 'upperhand (apocalyptica)' },
                        { id: 'fDltPLFdkYI', title: 'power in the blood (polyphia)' },
                        { id: '3x2BXn0cPM8', title: 'roses (chvrches)' },
                        { id: 'aWpw-Ynl0Yc', title: 'bass persuades (miley)' },
                        { id: 'KWn5FkkuYwk', title: 'hear me now (kaskade + friends)' },
                        { id: 'mi7KlC1hxpI', title: "can't you see (bonobo + aanya martin)" },
                        { id: 'oytaoGL-mck', title: 'princess of the night (train)' },
                        { id: 'AXWHQb9VsJA', title: 'teach yourself (david duchovny)' },
                        { id: 'fR4HjTH_fTM', title: 'the long and winding road (the beatles)' },
                        { id: 'tVXXD7KXAec', title: 'rescuer (alex warren)' },
                        { id: '3Zzz-xpjshM', title: 'time (alabama shakes)' },
                        { id: 'c0Y4PqvDvqc', title: 'the station of a showgirl (tay tay)' }
                    ]
                },

                {
                    id: 'the free people inside babel ➜ the finale',
                    name: 'the free people inside babel ➜ the finale',
                    songs: [
                        { id: 'x11NA63gLDM', title: 'change the world (eric clapton)' },
                        { id: 'ZoC9_udLNeU', title: "let's dance (bowie)" },
                        { id: 'G2nJPEDc02k', title: 'levitating (dua lipa)' },
                        { id: '5f3sMmdG2sg', title: 'sunshine (jungle)' },
                        { id: 'oHRNrgDIJfo', title: 'feeling good (nina simone)' },
                        { id: 'zp7NtW_hKJI', title: 'a sky full of stars (coldplay)' },
                        { id: 'JAYb8ZyjzD0', title: 'hoppípolla (sigur rós)' },
                        { id: 'n3nPiBai66M', title: 'just like heaven (the cure)' },
                        { id: 'HVHUjzZZGQ4', title: 'island in the sun (weezer)' },
                        { id: 'Rk_sAHh9s08', title: 'return to innocence (enigma)' },
                        { id: 'oJ5ciSr8rAc', title: 'all that we perceive (thievery corporation)' }
                    ]
                },

                {
                    id: 'life around our beautiful planet ➜ brazil',
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
                        { id: 'TnK29aJCOp4', title: 'stairway to heaven (orquestra sinfônica curitiba)' }
                    ]
                },

                {
                    id: 'life around our beautiful planet ➜ japan',
                    name: 'life around our beautiful planet ➜ japan',
                    songs: [
                        { id: 'D4cAD8sJ6Gc', title: 'dream odyssey (mono)' },
                        { id: 'CbnGz3qyzRA', title: 'ember (ichika nito)' }
                    ]
                }
            ],

            currentPlaylistId: 'spacetime journey through the galaxies'
        };
    }

    /**
     * Ensure default playlists and songs exist.
     * Default playlists are kept in their configured order.
     * Custom playlists are preserved after the default playlists.
     * Existing user edits and custom songs are preserved.
     *
     * Mutates data. Call save(data) afterward to persist changes.
     *
     * @param {Object} data - Playlists data object.
     */
    ensureDefaultPlaylists(data) {
        if (!data || typeof data !== 'object') {
            return;
        }

        if (!Array.isArray(data.playlists)) {
            data.playlists = [];
        }

        const defaultData = this.getDefaultData();
        const existingPlaylists = data.playlists.filter(
            playlist =>
                playlist &&
                typeof playlist === 'object' &&
                typeof playlist.id === 'string'
        );

        const defaultPlaylistIds = new Set(
            defaultData.playlists.map(playlist => playlist.id)
        );

        const mergedDefaultPlaylists = defaultData.playlists.map(
            (defaultPlaylist) => {
                // Use the first matching playlist if duplicate IDs exist.
                const playlist = existingPlaylists.find(
                    existing => existing.id === defaultPlaylist.id
                );

                if (!playlist) {
                    return {
                        id: defaultPlaylist.id,
                        name: defaultPlaylist.name,
                        songs: defaultPlaylist.songs.map(song => ({ ...song }))
                    };
                }

                // Preserve an existing playlist name and its custom songs.
                if (typeof playlist.name !== 'string') {
                    playlist.name = defaultPlaylist.name;
                }

                if (!Array.isArray(playlist.songs)) {
                    playlist.songs = [];
                }

                // Normalize malformed song entries.
                playlist.songs = playlist.songs.filter(
                    song =>
                        song &&
                        typeof song === 'object' &&
                        typeof song.id === 'string'
                );

                // Add missing default songs without duplicating existing IDs.
                const existingSongIds = new Set(
                    playlist.songs.map(song => song.id)
                );

                defaultPlaylist.songs.forEach(defaultSong => {
                    if (!existingSongIds.has(defaultSong.id)) {
                        playlist.songs.push({ ...defaultSong });
                        existingSongIds.add(defaultSong.id);
                    }
                });

                return playlist;
            }
        );

        // Preserve custom playlists and their relative order.
        // Remove duplicate default playlists and duplicate playlist IDs.
        const seenPlaylistIds = new Set(defaultPlaylistIds);

        const customPlaylists = existingPlaylists.filter(playlist => {
            if (seenPlaylistIds.has(playlist.id)) {
                return false;
            }

            seenPlaylistIds.add(playlist.id);
            return true;
        });

        data.playlists = [
            ...mergedDefaultPlaylists,
            ...customPlaylists
        ];

        // Preserve a valid current selection, including custom playlists.
        const currentPlaylistExists = data.playlists.some(
            playlist => playlist.id === data.currentPlaylistId
        );

        if (!currentPlaylistExists) {
            data.currentPlaylistId = defaultData.currentPlaylistId;
        }
    }

    /**
     * Get a playlist by ID.
     *
     * @param {Object} data - Playlists data object.
     * @param {string} playlistId - ID of the playlist to get.
     * @returns {Object|null} Playlist object or null if not found.
     */
    getPlaylist(data, playlistId) {
        if (!Array.isArray(data?.playlists)) {
            return null;
        }

        return data.playlists.find(
            playlist => playlist && playlist.id === playlistId
        ) || null;
    }

    /**
     * Get the current active playlist.
     *
     * @param {Object} data - Playlists data object.
     * @returns {Object|null} Current playlist or null if not found.
     */
    getCurrentPlaylist(data) {
        if (!data || !data.currentPlaylistId) {
            return null;
        }

        return this.getPlaylist(data, data.currentPlaylistId);
    }

    /**
     * Set the current active playlist and persist the change.
     *
     * @param {Object} data - Playlists data object.
     * @param {string} playlistId - ID of the playlist to set as current.
     */
    setCurrentPlaylist(data, playlistId) {
        if (this.getPlaylist(data, playlistId)) {
            data.currentPlaylistId = playlistId;
            this.save(data);
        }
    }
}

window.MusicPlayerStorage = MusicPlayerStorage;
