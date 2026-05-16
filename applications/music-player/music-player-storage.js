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
                    id: '2026 chill behemoth endeavor',
                    name: '2026 chill behemoth endeavor',
                    songs: [
                        { id: 'GXFSK0ogeg4', title: 'carmina burana (carl orff)' },
                        { id: 'kLp_Hh6DKWc', title: 'hall of the mountain king (grieg)' },
                        { id: 'wneUNq_Ndbw', title: 'sorcerer\'s apprentice (dukas)' },
                        { id: 'r30D3SW4OVw', title: 'bolero (maurice ravel)' },
                        { id: 'bBsKplb2E6Q', title: 'dance of the knights (prokofiev)' },
                        { id: 'GGU1P6lBW6Q', title: 'also sprach zarathustra (strauss)' },
                        { id: 'dfe8tCcHnKY', title: 'ride of the valkyries (wagner)' },
                        { id: 'CUGMZlvrR4c', title: 'requiem, dies irae (verdi)' },
                        { id: 'YyknBTm_YyM', title: 'danse macabre (saint-saëns)' },
                        { id: 'S8m4fm_cF6o', title: 'requiem, confutatis (mozart)' },
                        { id: 'ho9rZjlsyYY', title: 'tocatta and fugue in D minor (bach)' },
                        { id: 'iCEDfZgDPS8', title: 'night on bald mountain (mussorgsky)' },
                        { id: 'L0bcRCCg01I', title: 'mars, the bringer of the last war (holst)' },
                        { id: 'L0bcRCCg01I', title: 'welcome to the future, droid (moebius fm)' }
                    ]
                },
                {
                    id: '2026 peaceful builder dreamer',
                    name: '2026 peaceful builder dreamer',
                    songs: [
                        { id: 'eqo0TpDBsZc', title: 'violet night... (james malikey)' },
                        { id: 'N0snMcR6aaA', title: 'emma\'s surrender (lofi girl)' },
                        { id: '0tiuAKQjRpg', title: 'rose garden (afloat in time)' },
                        { id: 'N-BAlJ-2xro', title: 'every breath (brooklyn duo)' },
                        { id: 'rSzKm3hqhs8', title: 'perpetual (tommy guerrero)' },
                        { id: 'YBioStgspO8', title: 'happy moments (essential)' },
                        { id: 'p88iGCFH7vQ', title: 'sunny days (halidonmusic)' },
                        { id: 'NH8uI4EJ0bo', title: 'romantic jazz (lofi girl)' },
                        { id: 'b9WKC5sT9Z4', title: 'gymnopedies (erik satie)' },
                        { id: 'aA4Kub9flag', title: 'dreamer (luke faulkner)' },
                        { id: 'b44-5M4e9nI', title: 'the swan (saint-saens)' },
                        { id: 'y9Yc46rVgRQ', title: 'saturn (james malikey)' },
                        { id: 'PFofOcuNNBk', title: 'hoppípolla (sigur rós)' },
                        { id: 'bTvOEXAuIEU', title: 'frailed (flea)' }
                    ]
                },
                {
                    id: '2026 chez moi w/ mah pretty gals',
                    name: '2026 chez moi w/ mah pretty gals',
                    songs: [
                        { id: 'R3gpbT-JZMk', title: 'killah (lady gaga)' },
                        { id: 'bECMcp4AdOs', title: 'wide awake (kate perry)' },
                        { id: 'YDTazIuuDPY', title: 'i feel so free (madonna)' },
                        { id: 'G7KNmW9a75Y', title: 'flowers (miley cyrus)' },
                        { id: 'e_aT9pAGQo8', title: 'alien superstar (beyoncé)' },
                        { id: 'DagMrm6p2dA', title: 'a woman\'s worth (alicia keys)' },
                        { id: 'WqbJT_vC0rs', title: 'elizabeth taylor (taylor swift)' },
                        { id: 'xhXUdIekqDk', title: 'kraken (florence + the machine)' },
                        { id: '9WbCfHutDSE', title: 'dangerous woman (ariana grande)' },
                        { id: 'ak4Ti54Y6rY', title: 'who will you follow (evanescence)' },
                        { id: 'ZWmrfgj0MZI', title: 'unfinished sympathy (massive attack)' },
                        { id: 'JCKBaJDRMw4', title: 'chill music for work (lofi girl)' }
                    ]
                },
                {
                    id: '2026 after afterlife zeitgeist',
                    name: '2026 after afterlife zeitgeist',
                    songs: [
                        { id: 'ya7L3A1DOlg', title: 'all is violent, bright (god is an astronaut)' },
                        { id: 'MAmqJjyDH48', title: 'a song for our fathers (explosion in the sky)' },
                        { id: 'XXIX2WnfbpE', title: 'runway (lady gaga && doechii)' },
                        { id: 'PhlbZFdlHC0', title: 'bones for the crows (nickelback)' },
                        { id: 'X-KyrJRhYUw', title: 'seconds before the sunrise (dean lewis)' },
                        { id: 'iGTN1xz0f84', title: 'personal apocalypse (unlike pluto)' }, 
                        { id: 'OZ-ywVT052U', title: 'window (foo fighters)' },
                        { id: 'o5i3l8-hRHg', title: 'burn (zhu && joyia)' },
                        { id: 'X2959NkomEc', title: 'up all night (meltt)' },
                        { id: 'wpWOQSgsetk', title: 'butterfly (anees)' },
                        { id: 'vnIOFl_jt1M', title: '22 (ok godnight)' },
                        { id: '5H19y7B-Dzk', title: 'who feels love? (oasis)' },
                        { id: 'fhOAsDVg8pY', title: 'round && round (bob moses)' },
                        { id: 'CevxZvSJLk8', title: 'roar (kate perry)' },
                        { id: 'ZbZSe6N_BXs', title: 'happy (pharrell williams)' },
                        { id: 'Z4A9ZZo_rAE', title: 'shake it off (taylor swift)' },
                        { id: 'HBMy-y2wb4I', title: 'father (ye and travis scott)' },
                        { id: 'vRQb_-mRcAc', title: 'unwritten (natasha bedingfield)' },
                        { id: 'UVpcupE1xEo', title: 'seven (david bowie)' },
                        { id: 'iGTN1xz0f84', title: 'old dog (j. cole)' }, 
                        { id: 'y9S38QLwCUM', title: 'joy (dogstar)' },
                        { id: '94UmYrW5oto', title: 'what up gangsta (50 cent)' },
                        { id: 'hT_nvWreIhg', title: 'counting stars (onerepublic)' },
                        { id: 'F-F_oHOvBsM', title: 'in the stars (the rolling stones)' },
                        { id: 'ln7Vn_WKkWU', title: 'stuck in the middle (stealers wheel)' },
                        { id: 'MO0LdXqwDP0', title: 'afterlife (evanescence)' },
                        { id: 'jtyvVmiBk-8', title: 'long distance runner (indigo)' },
                        { id: 'po4GAzP0kHU', title: 'original sin (tim henson)' },
                        { id: 'fA82c4YkAZ4', title: 'first light (lana del rey)' },
                        { id: 'yB9_ImBoazY', title: 'leviticus ($uicideboy$)' },
                        { id: 'yB9_ImBoazY', title: 'reward the scars (koRn)' },
                        { id: 'Pj5u8OagODo', title: 'it\'s for the kids (anthrax)' },
                        { id: '8r-bTAvYkZw', title: 'ave maria (alanis morissette)' },
                        { id: 'SL8JuRgEajs', title: 'picking dragon\'s pockets (modest mouse)' },
                        { id: 'cfjDrutsfRQ', title: 'sympathy magic (florence + the machine)' },
                        { id: 'SlaSbwxG46Y', title: 'like a stone (band of echoes cover)' },
                        { id: 'pf3KyEnacJ8', title: 'zombie (yungblud + the smashing pumpkins)' },
                        { id: 'pe3jFvJ0qjs', title: "don't fear the reaper (blue oyster cult)" },
                        { id: 'IXdNnw99-Ic', title: 'wish you were here (pink floyd)' },
                        { id: '1lyu1KKwC74', title: 'bitter sweet symphony (the verve)' },
                        { id: '7jMlFXouPk8', title: 'high hopes (pink floyd)' },
                        { id: 'TFjmvfRvjTc', title: 'hey you (pink floyd)' }
                    ]
                },
                {
                    id: '2026 in another reincarnation',
                    name: '2026 in another reincarnation',
                    songs: [
                        { id: 'n2MtEsrcTTs', title: 'harvest moon (neil young)' },
                        { id: 'G2dR2DV-eGc', title: 'hard to concentrate (rhcp)' },
                        { id: 'ux2P_nU8aD0', title: 'bridge to my heart (powfu)' },
                        { id: 'u2ah9tWTkmk', title: 'ordinary (alex warren)' },
                        { id: 'x11NA63gLDM', title: 'change the world (eric clapton)' },
                        { id: 'ozXZnwYTMbs', title: 'nothing else matters (metallica)' },
                        { id: 'fF8GARU44iY', title: 'wild mountain honey (steve miller)' },
                        { id: 'pGNDncTbJRU', title: 'a place to call home (world of warcraft)' }
                    ]
                },
                {
                    id: '2026 when they invade the privacy of an engineer and scientist for many years with no concern for her dignity, and they try to frame her with every crazy label imaginable, and nobody goes to jail, and she survives stronger than ever',
                    name: '2026 when they invade the privacy of an engineer && scientist for many years with no concern for her dignity, and they try to frame her with every crazy label imaginable, and nobody goes to jail, and she survives stronger than ever and builds something amazing and becomes happy forever with good real friends (justice is final; each one of them is cursed by G\'d; payday will come threefold; not her concern anymore; so it is)',
                    songs: [
                        { id: 'pkcJEvMcnEg', title: 'lithium (nirvana)' }
                    ]
                }
            ],
            currentPlaylistId: '2026 peaceful dreamer'
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
