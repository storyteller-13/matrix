/**
 * Artwork Window Application Module.
 */

const IMAGES = [
    'summer.jpg',
    'love.jpg',
    'lion.jpg',
    'memories.jpg',
];

const BASE_PATH = '/pages/artwork/';


class ArtworkApp extends BaseApp {
    constructor() {
        super({ windowId: 'artwork-window', dockItemId: 'artwork-dock-item' });
        this.elements = {};
        this.fileListPopulated = false;

        this.images = IMAGES;
        this.init();
    }

    init() {
        super.init();
        if (!this.window) return;
        this.cacheElements();
        this.updateBadge();
    }

    cacheElements() {
        this.elements.badge = document.getElementById('artwork-count-badge');
        this.elements.menuCount = document.getElementById('artwork-menu-count');
    }

    updateBadge() {
        const { badge, menuCount } = this.elements;
        const count = this.images.length;
        const text = count > 99 ? '99+' : String(count);

        if (badge) {
            badge.textContent = text;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
        if (menuCount) {
            menuCount.textContent = text;
            menuCount.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    loadImages() {
        if (this.fileListPopulated) return;
        const fileList = this.window.querySelector('.file-list');
        if (!fileList) return;

        const fragment = document.createDocumentFragment();

        for (const imageName of this.images) {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.style.cursor = 'pointer';
            fileItem.addEventListener('click', () => this.openImage(imageName));

            const img = document.createElement('img');
            img.src = BASE_PATH + imageName;
            img.alt = imageName;
            img.loading = 'lazy';
            Object.assign(img.style, {
                width: '100%',
                height: 'auto',
                maxHeight: '120px',
                objectFit: 'contain',
                borderRadius: '4px',
                marginBottom: '8px'
            });

            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = imageName;

            fileItem.appendChild(img);
            fileItem.appendChild(fileName);
            fragment.appendChild(fileItem);
        }

        fileList.appendChild(fragment);
        this.fileListPopulated = true;
    }

    ensureModal() {
        let modal = document.getElementById('artwork-image-modal');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'artwork-image-modal';
        Object.assign(modal.style, {
            position: 'fixed',
            inset: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            cursor: 'pointer',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });

        modal.addEventListener('click', () => this.closeImage());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('artwork-image-modal')?.style.display === 'flex') {
                this.closeImage();
            }
        });

        const img = document.createElement('img');
        Object.assign(img.style, {
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.5)',
            cursor: 'default'
        });
        img.addEventListener('click', (e) => e.stopPropagation());
        modal.appendChild(img);

        const shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.className = 'artwork-share-link';
        shareBtn.textContent = 'copy link';
        Object.assign(shareBtn.style, {
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 14px',
            font: 'inherit',
            fontSize: '13px',
            color: '#E879A9',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(232, 121, 169, 0.6)',
            borderRadius: '999px',
            cursor: 'pointer'
        });
        shareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyShareLink(shareBtn);
        });
        modal.appendChild(shareBtn);

        document.body.appendChild(modal);
        return modal;
    }

    /** Image name from the ?artwork= query parameter, if it names a known picture. */
    getArtworkFromUrl() {
        try {
            const name = new URLSearchParams(window.location.search).get('artwork');
            return this.images.includes(name) ? name : null;
        } catch {
            return null;
        }
    }

    setArtworkInUrl(imageName) {
        try {
            const url = new URL(window.location.href);
            if (imageName) {
                url.searchParams.set('artwork', imageName);
            } else {
                url.searchParams.delete('artwork');
            }
            history.replaceState(null, '', url);
        } catch {
            // Ignore URL update failures in non-browser test hosts
        }
    }

    getShareUrl(imageName) {
        const url = new URL(window.location.href);
        url.searchParams.set('artwork', imageName);
        return url.toString();
    }

    async copyShareLink(button) {
        if (!this.currentImage) return;
        const shareUrl = this.getShareUrl(this.currentImage);
        let copied = false;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
                copied = true;
            }
        } catch {
            copied = false;
        }
        if (!copied) {
            const input = document.createElement('textarea');
            input.value = shareUrl;
            input.setAttribute('readonly', '');
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            try {
                copied = document.execCommand('copy');
            } catch {
                copied = false;
            }
            input.remove();
        }
        if (copied) {
            button.textContent = 'copied!';
            setTimeout(() => { button.textContent = 'copy link'; }, 1600);
        }
    }

    openImage(imageName) {
        const modal = this.ensureModal();
        const img = modal.querySelector('img');
        this.currentImage = imageName;
        this.setArtworkInUrl(imageName);
        img.src = BASE_PATH + imageName;
        modal.style.display = 'flex';
        requestAnimationFrame(() => { modal.style.opacity = '1'; });
    }

    closeImage() {
        const modal = document.getElementById('artwork-image-modal');
        if (!modal) return;
        this.currentImage = null;
        this.setArtworkInUrl(null);
        modal.style.opacity = '0';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }

    /** Opens the window and the picture named in the URL, e.g. ?artwork=love.jpg. */
    openImageFromUrl() {
        const imageName = this.getArtworkFromUrl();
        if (!imageName) return;
        this.open();
        this.openImage(imageName);
    }

    open() {
        this.loadImages();
        super.open();
    }
}

// Expose class constructor for testing
window.ArtworkAppClass = ArtworkApp;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ArtworkApp = new ArtworkApp();
        window.ArtworkApp.openImageFromUrl();
    });
} else {
    window.ArtworkApp = new ArtworkApp();
    window.ArtworkApp.openImageFromUrl();
}

// Expose open function globally for onclick handlers
window.openArtworkWindow = function() {
    if (window.ArtworkApp) {
        window.ArtworkApp.open();
    }
};
