/**
 * XKCD Module
 * Fetches and displays the latest XKCD comic
 */
class XKCDPanel {
    constructor() {
        const isLocalhost = window.Env && window.Env.isLocalhost();
        if (isLocalhost) {
            // For local development, use a CORS proxy
            // Using allorigins.win as a free CORS proxy service
            this.apiUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://xkcd.com/info.0.json');
        } else {
            // For production, use our API endpoint
            this.apiUrl = '/api/xkcd';
        }
        
        this.cacheKey = 'xkcd_cache';
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            // Make sure box is visible
            const box = document.getElementById('xkcd-box');
            if (box) box.style.display = 'block';
            this.loadXKCD();
        } catch (error) {
            // Error initializing XKCD panel
        }
    }

    /**
     * Sets up event listeners for the XKCD box
     */
    setupEventListeners() {
        const imageContainer = document.getElementById('xkcd-box-image-container');
        const box = document.getElementById('xkcd-box');
        const closeBtn = document.getElementById('xkcd-box-close');
        const popup = document.getElementById('xkcd-popup');
        const popupCloseBtn = document.getElementById('xkcd-close');

        // Click on image container to show popup
        if (imageContainer) {
            imageContainer.addEventListener('click', () => this.showPopup());
        }

        // Close box button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideBox());
        }

        // Close popup button
        if (popupCloseBtn) {
            popupCloseBtn.addEventListener('click', () => this.hidePopup());
        }

        // Close popup when clicking outside
        if (popup) {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    this.hidePopup();
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (popup && popup.style.display !== 'none') {
                    this.hidePopup();
                } else if (box && box.style.display !== 'none') {
                    this.hideBox();
                }
            }
        });
    }

    /**
     * Loads XKCD data, checking cache first
     */
    async loadXKCD() {
        // Check cache first
        const cached = this.getCachedXKCD();
        if (cached) {
            this.displayXKCD(cached);
            return;
        }

        try {
            const data = await this.fetchXKCD();
            if (data) {
                this.cacheXKCD(data);
                this.displayXKCD(data);
            } else {
                this.showError();
            }
        } catch (error) {
            this.showError();
        }
    }

    /**
     * Fetches XKCD data from XKCD API with timeout and fallbacks
     */
    async fetchXKCD() {
        const xkcdApiUrl = 'https://xkcd.com/info.0.json';
        const corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest='
        ];
        
        const isLocalhost = window.Env && window.Env.isLocalhost();
        if (!isLocalhost && this.apiUrl === '/api/xkcd') {
            try {
                const response = await this.fetchWithTimeout(this.apiUrl, 10000);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.img) {
                        this.ensureAbsoluteImageUrl(data);
                        return data;
                    }
                }
            } catch (error) {
                // API endpoint failed, trying CORS proxies
            }
        }
        
        // Try CORS proxies
        for (const proxy of corsProxies) {
            try {
                const proxyUrl = proxy + encodeURIComponent(xkcdApiUrl);
                
                const response = await this.fetchWithTimeout(proxyUrl, 8000);
                
                if (response.ok) {
                    let data = await response.json();
                    
                    // Some proxies wrap the response, try to unwrap it
                    if (data.contents) {
                        data = JSON.parse(data.contents);
                    }
                    
                    if (data && data.img) {
                        this.ensureAbsoluteImageUrl(data);
                        return data;
                    }
                }
            } catch (error) {
                continue; // Try next proxy
            }
        }
        
        return null;
    }
    
    /**
     * Fetches with timeout
     */
    async fetchWithTimeout(url, timeout = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }
    
    /**
     * Ensures image URL is absolute
     */
    ensureAbsoluteImageUrl(data) {
        if (data.img && !data.img.startsWith('http')) {
            data.img = 'https://imgs.xkcd.com/comics/' + data.img;
        }
    }

    /**
     * Displays XKCD data in the box
     */
    displayXKCD(data) {
        const imageContainer = document.getElementById('xkcd-box-image-container');
        const titleElement = document.getElementById('xkcd-box-title');
        const popupImage = document.getElementById('xkcd-popup-image');
        const popupTitle = document.getElementById('xkcd-title');
        const popupAlt = document.getElementById('xkcd-alt');

        if (!imageContainer) {
            return;
        }

        // Clear loading state
        imageContainer.innerHTML = '';

        if (!data || !data.img || typeof data.img !== 'string') {
            this.showError();
            return;
        }
        this.ensureAbsoluteImageUrl(data);

        const img = document.createElement('img');
        img.alt = data.alt || 'XKCD Comic';
        img.className = 'xkcd-box-image';
        img.loading = 'eager';

        const loadTimeout = setTimeout(() => {
            if (!img.complete || img.naturalWidth === 0) {
                const currentSrc = img.src;
                img.src = '';
                setTimeout(() => { img.src = currentSrc; }, 100);
            }
        }, 5000);

        img.onload = () => {
            clearTimeout(loadTimeout);
            const errorDiv = imageContainer.querySelector('.xkcd-error, .xkcd-loading');
            if (errorDiv) errorDiv.remove();
        };
        img.onerror = () => {
            clearTimeout(loadTimeout);
            if (img.parentNode) img.parentNode.removeChild(img);
            this.showError();
        };

        imageContainer.appendChild(img);
        img.src = data.img;

        // Keep title as "XKCD"
        if (titleElement) {
            titleElement.textContent = 'XKCD';
            titleElement.title = data.title || 'XKCD Comic';
        }

        if (popupImage) popupImage.src = data.img;
        if (popupTitle) popupTitle.textContent = data.title || 'XKCD Comic';
        if (popupAlt) popupAlt.textContent = data.alt || '';
    }

    /**
     * Shows the popup with full XKCD details
     */
    showPopup() {
        const popup = document.getElementById('xkcd-popup');
        if (popup) {
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hides the popup
     */
    hidePopup() {
        const popup = document.getElementById('xkcd-popup');
        if (popup) {
            popup.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * Shows error state
     */
    showError() {
        const imageContainer = document.getElementById('xkcd-box-image-container');
        if (imageContainer) {
            imageContainer.innerHTML = '<div class="xkcd-error">failed to load</div>';
        }
    }

    /**
     * Toggles the visibility of the XKCD box
     */
    toggleVisibility() {
        const box = document.getElementById('xkcd-box');
        if (!box) return;

        const isVisible = box.style.display !== 'none' &&
                         window.getComputedStyle(box).display !== 'none';

        if (isVisible) {
            this.hideBox();
        } else {
            this.showBox();
        }
    }

    /**
     * Shows the XKCD box
     */
    showBox() {
        const box = document.getElementById('xkcd-box');
        if (!box) return;

        box.style.display = 'block';
        box.style.opacity = '0';
        box.style.transform = 'translateY(-10px) scale(0.95)';
        void box.offsetHeight; // Force reflow
        requestAnimationFrame(() => {
            box.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            box.style.opacity = '1';
            box.style.transform = 'translateY(0) scale(1)';
        });

        // Reload XKCD if needed
        this.loadXKCD();
    }

    /**
     * Hides the XKCD box
     */
    hideBox() {
        const box = document.getElementById('xkcd-box');
        if (!box) return;

        box.style.opacity = '0';
        box.style.transform = 'translateY(-10px) scale(0.95)';
        setTimeout(() => {
            box.style.display = 'none';
        }, 400);
    }

    /**
     * Gets cached XKCD data if still valid
     */
    getCachedXKCD() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();

            if (now - timestamp < this.cacheExpiry) {
                return data;
            }

            // Cache expired
            localStorage.removeItem(this.cacheKey);
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Caches XKCD data
     */
    cacheXKCD(data) {
        try {
            const cache = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(cache));
        } catch (error) {
            // Error caching XKCD
        }
    }

    destroy() {
        // No-op; panel is not torn down in this app.
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.XKCDPanel = new XKCDPanel();
    });
} else {
    window.XKCDPanel = new XKCDPanel();
}

// Expose class for testing
window.XKCDPanelClass = XKCDPanel;

// Expose open function globally for onclick handlers
window.openXkcdWindow = () => {
    if (window.XKCDPanel) {
        window.XKCDPanel.toggleVisibility();
    }
};

