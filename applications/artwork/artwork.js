/**
 * Artwork Window Application Module
 * Simple file manager window for artwork (image lightbox).
 */
class ArtworkApp extends BaseApp {
    constructor() {
        super({ windowId: 'artwork-window', dockItemId: 'artwork-dock-item' });
        this.elements = {};
        this.fileListPopulated = false;

        this.images = [
            'begin.png'
        ];

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
        const basePath = '/pages/artwork/';

        for (const imageName of this.images) {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.style.cursor = 'pointer';
            fileItem.addEventListener('click', () => this.openImage(basePath + imageName));

            const img = document.createElement('img');
            img.src = basePath + imageName;
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
        document.body.appendChild(modal);
        return modal;
    }

    openImage(imageSrc) {
        const modal = this.ensureModal();
        const img = modal.querySelector('img');
        img.src = imageSrc;
        modal.style.display = 'flex';
        requestAnimationFrame(() => { modal.style.opacity = '1'; });
    }

    closeImage() {
        const modal = document.getElementById('artwork-image-modal');
        if (!modal) return;
        modal.style.opacity = '0';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
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
    });
} else {
    window.ArtworkApp = new ArtworkApp();
}

// Expose open function globally for onclick handlers
window.openArtworkWindow = function() {
    if (window.ArtworkApp) {
        window.ArtworkApp.open();
    }
};
