/**
 * APOD (Astronomy Picture of the Day) Module
 * Fetches and displays NASA's Astronomy Picture of the Day
 */
class APODPanel {
    constructor() {
        this.apiBase = window.Env && window.Env.getApiBase('apod');
        this.cacheKey = 'apod_cache';
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
        this.lastData = null;
        this.init();
    }

    /**
     * NASA APOD dates are US Eastern, not UTC. Using toISOString() requests
     * tomorrow's unpublished image for much of the evening in the Americas
     * (and morning in Asia).
     */
    easternDateString(offsetDays = 0) {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(new Date());
        const year = Number(parts.find((p) => p.type === 'year').value);
        const month = Number(parts.find((p) => p.type === 'month').value);
        const day = Number(parts.find((p) => p.type === 'day').value);
        return new Date(Date.UTC(year, month - 1, day + offsetDays)).toISOString().slice(0, 10);
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
        if (this.shouldAutoOpen()) {
            this.loadAPOD();
            this.showBox({ reload: false });
        }
        document.addEventListener('localechange', () => {
            if (this.lastData) this.displayAPOD(this.lastData);
        });
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

        const data = await this.fetchAPOD();
        if (data) {
            this.cacheAPOD(data);
            this.displayAPOD(data);
            return;
        }

        const stale = this.getCachedAPOD(true);
        if (stale) this.displayAPOD(stale);
        else this.showError();
    }

    /**
     * Fetches the latest image APOD, walking back past unpublished dates and videos.
     */
    async fetchAPOD() {
        for (let i = 0; i < 8; i++) {
            let response;
            try {
                response = await fetch(this.buildApiUrl(this.easternDateString(-i)));
            } catch (_) {
                continue;
            }

            if (!response) continue;
            if (response.status === 429) return this.getCachedAPOD(true);

            if (!response.ok) continue;

            try {
                const data = await response.json();
                if (data && data.media_type === 'image' && data.url) return data;
            } catch (_) {}
        }
        return this.getCachedAPOD(true);
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

        this.lastData = data;

        // Clear loading state
        imageContainer.innerHTML = '';

        // Create image
        const img = document.createElement('img');
        img.src = data.url;
        const fallbackTitle = window.I18n ? window.I18n.t('apod.fallbackTitle') : 'astronomical picture of the day';
        const loadingText = window.I18n ? window.I18n.t('panel.loading') : 'loading...';
        img.alt = data.title || fallbackTitle;
        img.className = 'apod-box-image';
        img.onerror = () => this.showError(loadingText);

        imageContainer.appendChild(img);

        if (titleElement) {
            titleElement.textContent = 'APOD';
            titleElement.title = data.title || fallbackTitle;
        }

        // Update popup content
        if (popupImage) popupImage.src = data.url;
        if (popupTitle) popupTitle.textContent = data.title || fallbackTitle;
        if (popupExplanation) popupExplanation.textContent = data.explanation || '';
        if (popupDate) {
            const date = new Date(data.date);
            popupDate.textContent = date.toLocaleDateString(window.I18n?.locale === 'ja' ? 'ja-JP' : 'en-US', {
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
    showError(message) {
        const imageContainer = document.getElementById('apod-box-image-container');
        if (imageContainer) {
            const text = message || (window.I18n ? window.I18n.t('panel.loading') : 'loading....');
            imageContainer.innerHTML = `<div class="apod-error">${text}</div>`;
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
    showBox(options = {}) {
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

        if (options.reload !== false) {
            this.loadAPOD();
        }
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
            if (valid || allowExpired) return data;
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
