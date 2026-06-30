/**
 * APOD (Astronomy Picture of the Day) Module
 * Fetches and displays NASA's Astronomy Picture of the Day
 */
class APODPanel {
    constructor() {
        this.apiBase = window.Env && window.Env.getApiBase('apod');
        this.cacheKey = 'apod_cache';
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        this.init();
    }

    /** Build API URL for a given date (YYYY-MM-DD). */
    buildApiUrl(dateStr) {
        if (this.apiBase) {
            return `${this.apiBase}?date=${dateStr}`;
        }
        return `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${dateStr}`;
    }

    init() {
        this.setupEventListeners();
        this.loadAPOD();
    }

    /**
     * Sets up event listeners for the APOD box
     */
    setupEventListeners() {
        const imageContainer = document.getElementById('apod-box-image-container');
        const box = document.getElementById('apod-box');
        const closeBtn = document.getElementById('apod-box-close');
        const popup = document.getElementById('apod-popup');
        const popupCloseBtn = document.getElementById('apod-close');

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
     * Loads APOD data, checking cache first
     */
    async loadAPOD() {
        const cached = this.getCachedAPOD();
        if (cached) {
            this.displayAPOD(cached);
            this.fetchAPOD().then(data => {
                if (data) {
                    this.cacheAPOD(data);
                    if (data.date !== cached.date) this.displayAPOD(data);
                }
            }).catch(() => {});
            return;
        }

        try {
            const data = await this.fetchAPOD();
            if (data) {
                this.cacheAPOD(data);
                this.displayAPOD(data);
            } else {
                this.showError('unable to load APOD; rate limit may be active.');
            }
        } catch (_) {
            const stale = this.getCachedAPOD(true);
            if (stale) this.displayAPOD(stale);
            else this.showError('unable to load APOD; please try again later.');
        }
    }

    /**
     * Fetches APOD data from NASA API
     */
    async fetchAPOD() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(this.buildApiUrl(today));

            if (response.status === 429) {
                const cached = this.getCachedAPOD();
                if (cached) return cached;
                throw new Error('rate limited and no cached data available');
            }
            if (!response.ok) throw new Error(`API returned ${response.status}`);

            const data = await response.json();
            if (data.media_type !== 'image') {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                const yesterdayResponse = await fetch(this.buildApiUrl(yesterdayStr));
                if (yesterdayResponse.ok) return await yesterdayResponse.json();
            }
            return data;
        } catch (error) {
            if (!error.message.includes('rate limited')) return this.fetchRandomAPOD();
            return null;
        }
    }

    /**
     * Fetches a random APOD from the past week as fallback
     */
    async fetchRandomAPOD() {
        try {
            const daysAgo = Math.floor(Math.random() * 7);
            const d = new Date();
            d.setDate(d.getDate() - daysAgo);
            const dateStr = d.toISOString().split('T')[0];
            const response = await fetch(this.buildApiUrl(dateStr));
            if (response.status === 429) return null;
            if (response.ok) {
                const data = await response.json();
                if (data.media_type === 'image') return data;
            }
        } catch (_) {}
        return null;
    }

    /**
     * Displays APOD data in the box
     */
    displayAPOD(data) {
        const imageContainer = document.getElementById('apod-box-image-container');
        const titleElement = document.getElementById('apod-box-title');
        const popupImage = document.getElementById('apod-popup-image');
        const popupTitle = document.getElementById('apod-title');
        const popupExplanation = document.getElementById('apod-explanation');
        const popupDate = document.getElementById('apod-date');

        if (!imageContainer) return;

        // Clear loading state
        imageContainer.innerHTML = '';

        // Create image
        const img = document.createElement('img');
        img.src = data.url;
        img.alt = data.title || 'astronomical picture of the day';
        img.className = 'apod-box-image';
        img.onerror = () => this.showError();

        imageContainer.appendChild(img);

        if (titleElement) {
            titleElement.textContent = 'APOD';
            titleElement.title = data.title || 'astronomical picture of the day';
        }

        // Update popup content
        if (popupImage) popupImage.src = data.url;
        if (popupTitle) popupTitle.textContent = data.title || 'astronomical picture of the day';
        if (popupExplanation) popupExplanation.textContent = data.explanation || '';
        if (popupDate) {
            const date = new Date(data.date);
            popupDate.textContent = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    /**
     * Shows the popup with full APOD details
     */
    showPopup() {
        const popup = document.getElementById('apod-popup');
        if (popup) {
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hides the popup
     */
    hidePopup() {
        const popup = document.getElementById('apod-popup');
        if (popup) {
            popup.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * Shows error state
     */
    showError(message = '') {
        const imageContainer = document.getElementById('apod-box-image-container');
        if (imageContainer) {
            if (message) {
                imageContainer.innerHTML = `<div class="apod-error">🌌<br><small>${message}</small></div>`;
            } else {
                imageContainer.innerHTML = '<div class="apod-error">🌌</div>';
            }
        }
    }

    /**
     * Toggles the visibility of the APOD box
     */
    toggleVisibility() {
        const box = document.getElementById('apod-box');
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
     * Shows the APOD box
     */
    showBox() {
        const box = document.getElementById('apod-box');
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

        // Reload APOD if needed
        this.loadAPOD();
    }

    /**
     * Hides the APOD box
     */
    hideBox() {
        const box = document.getElementById('apod-box');
        if (!box) return;

        box.style.opacity = '0';
        box.style.transform = 'translateY(-10px) scale(0.95)';
        setTimeout(() => {
            box.style.display = 'none';
        }, 400);
    }

    /**
     * Gets cached APOD data. If allowExpired is true, returns data even when expired (stale fallback).
     */
    getCachedAPOD(allowExpired = false) {
        try {
            const raw = localStorage.getItem(this.cacheKey);
            if (!raw) return null;
            const { data, timestamp } = JSON.parse(raw);
            const valid = Date.now() - timestamp < this.cacheExpiry;
            if (valid) return data;
            if (allowExpired) return data;
            localStorage.removeItem(this.cacheKey);
            return null;
        } catch (_) {
            return null;
        }
    }

    /**
     * Caches APOD data
     */
    cacheAPOD(data) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
        } catch (_) {}
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.APODPanel = new APODPanel();
    });
} else {
    window.APODPanel = new APODPanel();
}

// Expose class for testing
window.APODPanelClass = APODPanel;

// Expose open function globally for onclick handlers
window.openApodWindow = () => {
    if (window.APODPanel) {
        window.APODPanel.toggleVisibility();
    }
};
