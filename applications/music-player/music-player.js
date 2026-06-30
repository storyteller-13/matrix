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
        this.isLoadingSong = false;
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

        if (resetDefaultEntry) {
            const dreamPlaylist = this.storage.getPlaylist(this.playlistsData, '2026 peaceful dreamer');
            if (dreamPlaylist && dreamPlaylist.songs && dreamPlaylist.songs.length > 0) {
                this.playlistsData.currentPlaylistId = '2026 peaceful dreamer';
                this.songs = [...dreamPlaylist.songs];
                const dreamerIdx = this.songs.findIndex(s => s.id === 'aA4Kub9flag');
                this.currentSongIndex = dreamerIdx >= 0 ? dreamerIdx : 0;
                this.storage.save(this.playlistsData);
                return;
            }
        }

        const currentPlaylist = this.storage.getCurrentPlaylist(this.playlistsData);
        if (currentPlaylist && currentPlaylist.songs && currentPlaylist.songs.length > 0) {
            this.songs = [...currentPlaylist.songs];
            this.currentSongIndex = Math.max(0, Math.min(this.currentSongIndex, this.songs.length - 1));
        } else {
            const fallbackPlaylist = this.storage.getPlaylist(this.playlistsData, '2026 peaceful dreamer');
            if (fallbackPlaylist && fallbackPlaylist.songs && fallbackPlaylist.songs.length > 0) {
                this.songs = [...fallbackPlaylist.songs];
                this.playlistsData.currentPlaylistId = '2026 peaceful dreamer';
                this.storage.save(this.playlistsData);
            } else {
                this.playlistsData = this.storage.getDefaultData();
                this.storage.save(this.playlistsData);
                this.songs = [...this.playlistsData.playlists[0].songs];
            }
            this.currentSongIndex = 0;
        }
    }
    
    init() {
        this.setupYouTubeAPI();
        this.setupUIControls();
    }

    setupYouTubeAPI() {
        if (typeof YT !== 'undefined' && YT.Player) {
            this.setupPlayer();
        } else {
            // Store existing callback if any, then chain it
            const existingCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (existingCallback) {
                    existingCallback();
                }
                this.setupPlayer();
            };

            // Also check periodically in case the API loads but doesn't call the callback
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
    }

    setupPlayer() {
        // Prevent multiple initializations
        if (this.player && this.isReady) {
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
            'rel': 0
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
                    },
                    'onStateChange': (event) => {
                        this.onStateChange(event);
                    },
                    'onError': (event) => {
                        this.handlePlayerError(event);
                    }
                }
            });
        } catch (error) {
            console.error('Failed to initialize YouTube player:', error);
        }
    }

    handlePlayerError(event) {
        const errorCode = event.data;

        // Auto-skip to next song on certain errors
        if (errorCode === 100 || errorCode === 101 || errorCode === 150) {
            setTimeout(() => {
                this.playNextSong();
            }, 1000);
        } else if (errorCode === 2) {
            // Invalid parameter - try next song
            setTimeout(() => {
                if (this.currentSongIndex < this.songs.length - 1) {
                    this.playNextSong();
                }
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
            // When video ends, automatically play next song
            if (this.isReady && this.songs.length > 0) {
                this.playNextSong();
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
                    const songId = songItem.getAttribute('data-song-id');
                    const currentPlaylistId = this.playlistsData?.currentPlaylistId;
                    if (playlistId !== currentPlaylistId) {
                        this.switchPlaylist(playlistId);
                        setTimeout(() => this.playSongById(songId), 100);
                    } else {
                        this.playSongById(songId);
                    }
                }
            });
        }
    }

    togglePlayPause() {
        if (!this.player || !this.isReady) {
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
        element.style.display = 'block';
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px) scale(0.95)';
        void element.offsetHeight; // Force reflow
        requestAnimationFrame(() => {
            element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
        });
    }

    playNextSong() {
        if (this.songs.length === 0) return;
        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.loadSong();
    }

    playPreviousSong() {
        if (this.songs.length === 0) return;
        this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        this.loadSong();
    }

    /**
     * Switch to a different playlist
     */
    switchPlaylist(playlistId) {
        if (!this.playlistsData) return;
        
        const playlist = this.storage.getPlaylist(this.playlistsData, playlistId);
        if (!playlist || !playlist.songs || playlist.songs.length === 0) return;

        // Update current playlist
        this.storage.setCurrentPlaylist(this.playlistsData, playlistId);
        this.loadPlaylists(); // Reload to get fresh data
        
        // Reset to first song
        this.currentSongIndex = 0;
        
        // Update player if it exists
        if (this.player && this.isReady) {
            this.loadSong();
        } else if (!this.player) {
            // Player not initialized yet, it will load the correct song on init
            this.setupPlayer();
        }
    }

    /**
     * Load and play a specific song
     */
    loadSong(shouldPlay = false) {
        if (this.isLoadingSong) return; // Prevent concurrent loads
        if (!this.player || !this.isReady) return;
        if (!this.songs || this.songs.length === 0) return;

        // Validate song index
        if (this.currentSongIndex < 0 || this.currentSongIndex >= this.songs.length) {
            this.currentSongIndex = 0;
        }

        const currentSong = this.songs[this.currentSongIndex];
        if (!currentSong) return;

        this.isLoadingSong = true;

        try {
            const wasPlaying = this.player.getPlayerState() === YT.PlayerState.PLAYING;
            
            // Load the video
            this.player.loadVideoById({
                videoId: currentSong.id,
                startSeconds: 0
            });
            
            this.updateSongTitle();

            // Determine if we should play
            const shouldAutoPlay = shouldPlay || wasPlaying;

            if (shouldAutoPlay) {
                // Wait for video to be ready, then play
                this.waitForVideoReady(() => {
                    try {
                        if (this.player && this.isReady) {
                            this.player.playVideo();
                        }
                    } catch (error) {
                        console.error('Failed to play video:', error);
                    } finally {
                        this.isLoadingSong = false;
                    }
                });
            } else {
                this.isLoadingSong = false;
            }
        } catch (error) {
            console.error('Failed to load song:', error);
            this.isLoadingSong = false;
        }
    }

    /**
     * Wait for video to be ready to play
     */
    waitForVideoReady(callback, maxAttempts = 20) {
        let attempts = 0;
        
        const checkReady = () => {
            attempts++;
            
            if (!this.player || !this.isReady) {
                if (attempts < maxAttempts) {
                    setTimeout(checkReady, 200);
                } else {
                    callback();
                }
                return;
            }

            try {
                const state = this.player.getPlayerState();
                // Video is ready if it's CUED, PAUSED, ENDED, or UNSTARTED
                if (state === YT.PlayerState.CUED ||
                    state === YT.PlayerState.PAUSED ||
                    state === YT.PlayerState.ENDED ||
                    state === YT.PlayerState.UNSTARTED) {
                    callback();
                } else if (attempts < maxAttempts) {
                    setTimeout(checkReady, 200);
                } else {
                    // Timeout - try anyway
                    callback();
                }
            } catch (error) {
                if (attempts < maxAttempts) {
                    setTimeout(checkReady, 200);
                } else {
                    callback();
                }
            }
        };

        // Start checking after a short delay
        setTimeout(checkReady, 100);
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
            const songsHtml = (playlist.songs || []).map((song) => {
                const globalSongIndex = this.songs.findIndex(s => s.id === song.id);
                const isActive = isCurrentPlaylist && globalSongIndex === this.currentSongIndex;
                return `
                    <div class="music-song-item-small ${isActive ? 'active' : ''}" 
                         data-playlist-id="${playlist.id}" 
                         data-song-id="${song.id}">
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
     * Play a song by its ID in the current playlist
     */
    playSongById(songId) {
        if (!this.songs || this.songs.length === 0) return;

        const songIndex = this.songs.findIndex(s => s.id === songId);
        if (songIndex < 0) return;

        // If clicking the same song, toggle play/pause
        if (songIndex === this.currentSongIndex && this.player && this.isReady) {
            try {
                const state = this.player.getPlayerState();
                if (state === YT.PlayerState.PLAYING) {
                    this.player.pauseVideo();
                } else {
                    this.player.playVideo();
                }
            } catch (error) {
                console.error('Failed to toggle play/pause:', error);
            }
        } else {
            this.currentSongIndex = songIndex;
            this.loadSong(true);
        }
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
