/**
 * Podcast player window – plays a curated podcast episode (YouTube embed) opened from the lists folder.
 * The iframe is cleared on close so playback stops.
 */

const PODCAST_EMBED_BASE = 'https://www.youtube-nocookie.com/embed/';
const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/** Episodes by id; shared by the lists folder and the top-left menu. */
const PODCAST_EPISODES = [];
window.PODCAST_EPISODES = PODCAST_EPISODES;

class PodcastPlayerApp extends BaseApp {
    constructor() {
        super({ windowId: 'podcast-window' });
        this.elements = {};
        this.videoId = null;
        this.init();
    }

    init() {
        super.init();
        if (!this.window) return;
        this.elements.title = this.window.querySelector('.window-title');
        this.elements.iframe = this.window.querySelector('#podcast-iframe');
        // Capture phase: runs before the window manager's close handler stops propagation.
        this.window.addEventListener('click', (e) => {
            if (e.target.closest('.control.close')) this.stop();
        }, true);
    }

    embedUrl(videoId) {
        return `${PODCAST_EMBED_BASE}${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    }

    stop() {
        this.videoId = null;
        this.elements.iframe?.setAttribute('src', 'about:blank');
    }

    open({ title = '', videoId = '' } = {}) {
        if (!this.window || !YOUTUBE_ID_PATTERN.test(videoId)) return;
        const { title: titleEl, iframe } = this.elements;
        if (titleEl) titleEl.textContent = title.toUpperCase();
        if (iframe) {
            iframe.setAttribute('title', title);
            if (this.videoId !== videoId) iframe.setAttribute('src', this.embedUrl(videoId));
        }
        this.videoId = videoId;
        super.open();
        // Cascade on top of the curated-lists folder, like the list windows do.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const folder = document.getElementById('lists-folder-window');
                if (folder && getComputedStyle(folder).display !== 'none') {
                    this.window.style.top = 'calc(50% + 28px)';
                    this.window.style.left = 'calc(50% + 36px)';
                    this.window.style.transform = 'translate(-50%, -50%) scale(1)';
                }
                if (window.bringToFront) window.bringToFront(this.window);
                else window.WindowManager?.bringToFront?.(this.window);
            });
        });
    }
}

window.PodcastPlayerAppClass = PodcastPlayerApp;

const PODCAST_MENU_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">'
    + '<rect x="8.6" y="3.2" width="6.8" height="11" rx="3.4" fill="rgba(216, 70, 166, 0.18)" stroke="#E879A9" stroke-width="1.55"/>'
    + '<path d="M5.8 11.2 a6.2 6.2 0 0 0 12.4 0" fill="none" stroke="#E879A9" stroke-width="1.55" stroke-linecap="round"/>'
    + '<path d="M12 17.4 V20.6 M8.8 20.6 H15.2" stroke="#E879A9" stroke-width="1.55" stroke-linecap="round"/>'
    + '<path d="M10.9 7.1 L13.8 8.7 L10.9 10.3 Z" fill="#E879A9" stroke="#E879A9" stroke-width="0.7" stroke-linejoin="round"/>'
    + '</svg>';

/** Fills the top menu's episode submenu from PODCAST_EPISODES, so episodes live in one place. */
const renderPodcastMenu = () => {
    const menu = document.getElementById('podcast-menu-episodes');
    if (!menu) return;
    menu.replaceChildren();
    PODCAST_EPISODES.forEach((episode, i) => {
        if (i > 0) {
            const separator = document.createElement('div');
            separator.className = 'menu-separator';
            menu.appendChild(separator);
        }
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'menu-item';
        button.dataset.action = 'openPodcastEpisode';
        button.dataset.arg = episode.id;
        button.innerHTML = `<span class="menu-item-icon">${PODCAST_MENU_ICON}</span><span class="menu-item-text"></span>`;
        button.querySelector('.menu-item-text').textContent = episode.title;
        menu.appendChild(button);
    });
};

const initPodcastPlayerApp = () => {
    window.PodcastPlayerApp = new PodcastPlayerApp();
    renderPodcastMenu();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPodcastPlayerApp);
} else {
    initPodcastPlayerApp();
}

window.openPodcastWindow = (episode) => window.PodcastPlayerApp?.open(episode);
window.openPodcastEpisode = (id) => {
    const episode = PODCAST_EPISODES.find((e) => e.id === id);
    if (episode) window.openPodcastWindow({ title: episode.title, videoId: episode.videoId });
};
