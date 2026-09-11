/**
 * Music Player Application Module
 * Handles YouTube music player functionality
 */
class MusicPlayer {
    constructor() {
        this.player = null;
        this.isReady = false;
        this.currentSongIndex = 0;
        this.songs = [];
        this.storage = new MusicPlayerStorage();
        this.playlistsData = null;
        this.expandedPlaylists = new Set();
        this.youtubeApiRequested = false;
        this.pendingPlay = false;
        this.selectors = {
            youtube: 'music-youtube',
            toggle: 'music-toggle',
            player: 'music-player',
            soundIcon: 'sound-icon-toggle',
            close: 'music-close',
            title: 'music-title',
            prev: 'music-prev',
            next: 'music-next',
            songList: 'music-song-list'
        };

        this.loadPlaylists({ resetDefaultEntry: true });
        this.init();
    }

    /**
     * Initialize playlists and ensure default playlists exist (single source of truth in storage).
     * @param {Object} [options]
     * @param {boolean} [options.resetDefaultEntry]
     */
    loadPlaylists(options = {}) {
        const resetDefaultEntry = options.resetDefaultEntry === true;
        if (resetDefaultEntry) {
            this.storage.clearPersisted();
        }
        this.playlistsData = this.storage.load();
        this.storage.ensureDefaultPlaylists(this.playlistsData);
        this.storage.save(this.playlistsData);

        const currentPlaylist = this.storage.getCurrentPlaylist(this.playlistsData);
        if (currentPlaylist && currentPlaylist.songs && currentPlaylist.songs.length > 0) {
            this.songs = [...currentPlaylist.songs];
            this.currentSongIndex = Math.max(0, Math.min(this.currentSongIndex, this.songs.length - 1));
        } else {
            this.playlistsData = this.storage.getDefaultData();
            this.storage.save(this.playlistsData);
            this.songs = [...this.playlistsData.playlists[0].songs];
            this.currentSongIndex = 0;
        }
    }
    
    init() {
        const musicPlayer = document.getElementById(this.selectors.player);
        this.setupUIControls();
        if (musicPlayer && this.shouldAutoOpen()) this.showPlayer(musicPlayer);
        this.renderSongList();
    }

    isMobile() {
        return typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 768px)').matches;
    }

    shouldAutoOpen() {
        if (window.Env && typeof window.Env.shouldAutoOpenDesktopPanels === 'function') {
            return window.Env.shouldAutoOpenDesktopPanels();
        }
        return !this.isMobile();
    }

    ensureYouTubeAPI() {
        if (this.player) return;
        if (typeof YT !== 'undefined' && YT.Player) {
            this.setupPlayer();
            return;
        }
        this.setupYouTubeAPI();
        this.loadYouTubeScript();
    }

    loadYouTubeScript() {
        if (document.getElementById('youtube-iframe-api')) return;
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
    }

    setupYouTubeAPI() {
        if (this.youtubeApiRequested) return;
        this.youtubeApiRequested = true;

        if (typeof YT !== 'undefined' && YT.Player) {
            this.setupPlayer();
            return;
        }

        const existingCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (existingCallback) {
                existingCallback();
            }
            this.setupPlayer();
        };

        let checkCount = 0;
        const checkInterval = setInterval(() => {
            checkCount++;
            if (typeof YT !== 'undefined' && YT.Player && !this.player) {
                clearInterval(checkInterval);
                this.setupPlayer();
            } else if (checkCount > 50) {
                clearInterval(checkInterval);
            }
        }, 100);
    }

    setupPlayer() {
        if (this.player) {
            return;
        }

        const youtubeElement = document.getElementById(this.selectors.youtube);
        if (!youtubeElement) {
            return;
        }

        if (typeof YT === 'undefined' || !YT.Player) {
            return;
        }

        // Ensure we have songs loaded
        if (!this.songs || this.songs.length === 0) {
            this.loadPlaylists();
        }

        // Validate and fix currentSongIndex
        if (this.currentSongIndex < 0 || this.currentSongIndex >= this.songs.length) {
            this.currentSongIndex = 0;
        }

        const currentSong = this.songs[this.currentSongIndex];
        if (!currentSong) {
            this.loadPlaylists();
            if (this.songs.length > 0) {
                this.currentSongIndex = 0;
            } else {
                return;
            }
        }

        // If element is an iframe with src, replace it with a div for YT.Player
        if (youtubeElement.tagName === 'IFRAME') {
            const parent = youtubeElement.parentNode;
            const newDiv = document.createElement('div');
            newDiv.id = this.selectors.youtube;
            newDiv.style.display = youtubeElement.style.display;
            parent.replaceChild(newDiv, youtubeElement);
        }

        const playerVars = {
            'autoplay': 0,
            'loop': 0,
            'controls': 0,
            'modestbranding': 1,
            'rel': 0,
            'origin': window.location.origin
        };

        try {
            this.player = new YT.Player(this.selectors.youtube, {
                videoId: this.songs[this.currentSongIndex].id,
                playerVars: playerVars,
                events: {
                    'onReady': () => {
                        this.isReady = true;
                        this.updateSongTitle();
                        this.renderSongList();
                        this.flushPendingPlay();
                    },
                    'onStateChange': (event) => {
                        this.onStateChange(event);
                    },
                    'onError': (event) => {
                        this.handlePlayerError(event);
                    }
                }
            });
            this.flushPendingPlay();
        } catch (error) {
            console.error('Failed to initialize YouTube player:', error);
        }
    }

    flushPendingPlay() {
        if (!this.pendingPlay || !this.player || !this.isReady) return;
        this.pendingPlay = false;
        try {
            this.player.playVideo();
        } catch (error) {
            console.error('Failed to start playback:', error);
        }
    }

    handlePlayerError(event) {
        const errorCode = event.data;

        // 2: invalid id, 100: not found, 101/150: embedding disabled
        if (errorCode === 2 || errorCode === 100 || errorCode === 101 || errorCode === 150) {
            setTimeout(() => {
                this.playNextSong(true);
            }, 1000);
        }
    }

    onStateChange(event) {
        if (!event || typeof event.data !== 'number') return;

        const musicToggle = document.getElementById(this.selectors.toggle);
        const musicPlayer = document.getElementById(this.selectors.player);

        if (event.data === YT.PlayerState.PLAYING) {
            if (musicToggle) musicToggle.classList.add('playing');
            if (musicPlayer) musicPlayer.classList.add('playing');
        } else if (event.data === YT.PlayerState.PAUSED) {
            if (musicToggle) musicToggle.classList.remove('playing');
            if (musicPlayer) musicPlayer.classList.remove('playing');
        } else if (event.data === YT.PlayerState.ENDED) {
            if (this.isReady && this.songs.length > 0) {
                this.playNextSong(true);
            }
        }
    }

    setupUIControls() {
        const musicToggle = document.getElementById(this.selectors.toggle);
        const musicClose = document.getElementById(this.selectors.close);
        const soundIconToggle = document.getElementById(this.selectors.soundIcon);
        const musicPlayer = document.getElementById(this.selectors.player);
        const prevButton = document.getElementById(this.selectors.prev);
        const nextButton = document.getElementById(this.selectors.next);

        if (musicToggle) {
            musicToggle.addEventListener('click', () => {
                this.togglePlayPause();
            });
        }

        if (musicClose) {
            musicClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleVisibility();
            });
        }

        if (soundIconToggle && musicPlayer) {
            soundIconToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleVisibility();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.playPreviousSong();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.playNextSong();
            });
        }

        const songListElement = document.getElementById(this.selectors.songList);
        if (songListElement) {
            songListElement.addEventListener('click', (e) => {
                const header = e.target.closest('.music-playlist-header');
                const songItem = e.target.closest('.music-song-item-small');
                if (header) {
                    e.preventDefault();
                    e.stopPropagation();
                    const playlistId = header.getAttribute('data-playlist-id');
                    const currentPlaylistId = this.playlistsData?.currentPlaylistId;
                    if (this.expandedPlaylists.has(playlistId)) {
                        this.expandedPlaylists.delete(playlistId);
                    } else {
                        this.expandedPlaylists.add(playlistId);
                    }
                    if (playlistId !== currentPlaylistId) {
                        this.switchPlaylist(playlistId);
                    }
                    this.renderSongList();
                } else if (songItem) {
                    e.preventDefault();
                    e.stopPropagation();
                    const playlistId = songItem.getAttribute('data-playlist-id');
                    const songIndex = Number(songItem.getAttribute('data-song-index'));
                    const currentPlaylistId = this.playlistsData?.currentPlaylistId;
                    if (playlistId !== currentPlaylistId) {
                        this.switchPlaylist(playlistId, { loadFirst: false });
                    }
                    this.playSongAtIndex(songIndex);
                }
            });
        }
    }

    togglePlayPause() {
        if (!this.player || !this.isReady) {
            this.pendingPlay = true;
            this.ensureYouTubeAPI();
            return;
        }

        try {
            const state = this.player.getPlayerState();
            if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
                this.player.pauseVideo();
            } else if (state === YT.PlayerState.PAUSED || 
                       state === YT.PlayerState.ENDED || 
                       state === YT.PlayerState.CUED || 
                       state === YT.PlayerState.UNSTARTED) {
                this.player.playVideo();
            }
        } catch (error) {
            console.error('Failed to toggle play/pause:', error);
        }
    }

    toggleVisibility() {
        const musicPlayer = document.getElementById(this.selectors.player);
        if (!musicPlayer) return;

        const isVisible = musicPlayer.style.display !== 'none' &&
                         window.getComputedStyle(musicPlayer).display !== 'none';

        if (isVisible) {
            this.hidePlayer(musicPlayer);
        } else {
            this.showPlayer(musicPlayer);
        }
    }

    hidePlayer(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px) scale(0.95)';
        setTimeout(() => {
            element.style.display = 'none';
        }, 400);
    }

    showPlayer(element) {
        this.ensureYouTubeAPI();
        element.style.display = 'flex';
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px) scale(0.95)';
        void element.offsetHeight; // Force reflow
        requestAnimationFrame(() => {
            element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
        });
    }

    playNextSong(shouldPlay = false) {
        if (this.songs.length === 0) return;
        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.loadSong(shouldPlay);
    }

    playPreviousSong(shouldPlay = false) {
        if (this.songs.length === 0) return;
        this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        this.loadSong(shouldPlay);
    }

    /**
     * Switch to a different playlist
     */
    switchPlaylist(playlistId, { loadFirst = true } = {}) {
        if (!this.playlistsData) return;
        
        const playlist = this.storage.getPlaylist(this.playlistsData, playlistId);
        if (!playlist || !playlist.songs || playlist.songs.length === 0) return;

        this.storage.setCurrentPlaylist(this.playlistsData, playlistId);
        this.songs = [...playlist.songs];
        this.currentSongIndex = 0;

        if (!loadFirst) return;

        if (this.player && this.isReady) {
            this.loadSong();
        } else if (!this.player) {
            this.setupPlayer();
        }
    }

    /**
     * Load and play a specific song
     */
    loadSong(shouldPlay = false) {
        if (!this.player || !this.isReady) return;
        if (!this.songs || this.songs.length === 0) return;

        if (this.currentSongIndex < 0 || this.currentSongIndex >= this.songs.length) {
            this.currentSongIndex = 0;
        }

        const currentSong = this.songs[this.currentSongIndex];
        if (!currentSong) return;

        try {
            const state = this.player.getPlayerState();
            const wasPlaying = state === YT.PlayerState.PLAYING ||
                               state === YT.PlayerState.BUFFERING ||
                               state === YT.PlayerState.ENDED;
            const shouldAutoPlay = shouldPlay || wasPlaying;

            if (shouldAutoPlay) {
                this.player.loadVideoById(currentSong.id);
                this.player.playVideo();
            } else {
                this.player.cueVideoById(currentSong.id);
            }

            this.updateSongTitle();
        } catch (error) {
            console.error('failed to load song:', error);
        }
    }

    updateSongTitle() {
        const titleElement = document.getElementById(this.selectors.title);
        if (titleElement && this.songs[this.currentSongIndex]) {
            titleElement.textContent = this.songs[this.currentSongIndex].title;
        }
        this.renderSongList();
    }

    renderSongList() {
        const songListElement = document.getElementById(this.selectors.songList);
        if (!songListElement || !this.playlistsData || !this.playlistsData.playlists) return;

        const currentPlaylistId = this.playlistsData.currentPlaylistId;
        
        // Build HTML for all playlists
        songListElement.innerHTML = this.playlistsData.playlists.map(playlist => {
            const isCurrentPlaylist = playlist.id === currentPlaylistId;
            const isExpanded = this.expandedPlaylists.has(playlist.id);
            const songs = playlist.songs || [];
            const songsHtml = songs.length === 0
                ? `<div class="music-song-soon">soon</div>`
                : songs.map((song, songIndex) => {
                    const isActive = isCurrentPlaylist && songIndex === this.currentSongIndex;
                    return `
                    <div class="music-song-item-small ${isActive ? 'active' : ''}" 
                         data-playlist-id="${playlist.id}" 
                         data-song-id="${song.id}"
                         data-song-index="${songIndex}">
                        <span class="music-song-title-small">${song.title}</span>
                    </div>
                `;
                }).join('');

            return `
                <div class="music-playlist-container">
                    <div class="music-playlist-header ${isCurrentPlaylist ? 'active' : ''} ${isExpanded ? 'expanded' : ''}" 
                         data-playlist-id="${playlist.id}">
                        <span class="music-playlist-name">${playlist.name}</span>
                    </div>
                    <div class="music-playlist-songs ${isExpanded ? 'expanded' : 'collapsed'}">
                        ${songsHtml}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Play a song by index in the current playlist
     */
    playSongAtIndex(songIndex) {
        if (!this.songs || this.songs.length === 0) return;
        if (!Number.isInteger(songIndex) || songIndex < 0 || songIndex >= this.songs.length) return;

        if (songIndex === this.currentSongIndex && this.player && this.isReady) {
            this.togglePlayPause();
            return;
        }

        this.currentSongIndex = songIndex;
        if (!this.player || !this.isReady) {
            this.pendingPlay = true;
            this.ensureYouTubeAPI();
            this.updateSongTitle();
            return;
        }
        this.loadSong(true);
    }
}

// Expose class constructor for testing
window.MusicPlayerClass = MusicPlayer;

// Initialize when DOM is ready
const initMusicPlayer = () => {
    window.MusicPlayer = new MusicPlayer();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusicPlayer);
} else {
    initMusicPlayer();
}
