/**
 * Bird of the Day Module
 * Daily bird image panel (companion to APOD), sourced from iNaturalist + Wikipedia.
 */
class BirdPanel {
    constructor() {
        this.apiBase = window.Env && window.Env.getApiBase('bird');
        this.cacheKey = 'bird_cache';
        this.cacheExpiry = 24 * 60 * 60 * 1000;
        this.lastData = null;
        this.init();
    }

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

    dayOfYearFromDate(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        const start = Date.UTC(y, 0, 0);
        const target = Date.UTC(y, m - 1, d);
        return Math.floor((target - start) / 86400000);
    }

    hashDate(dateStr) {
        let h = 0;
        for (let i = 0; i < dateStr.length; i++) {
            h = ((h << 5) - h + dateStr.charCodeAt(i)) | 0;
        }
        return Math.abs(h);
    }

    buildApiUrl(dateStr) {
        if (this.apiBase) {
            return `${this.apiBase}?date=${dateStr}`;
        }
        return null;
    }

    init() {
        this.setupEventListeners();
        if (this.shouldAutoOpen()) {
            this.loadBird();
            this.showBox({ reload: false });
        }
        document.addEventListener('localechange', () => {
            if (this.lastData) this.displayBird(this.lastData);
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

    setupEventListeners() {
        const imageContainer = document.getElementById('bird-box-image-container');
        const box = document.getElementById('bird-box');
        const closeBtn = document.getElementById('bird-box-close');
        const popup = document.getElementById('bird-popup');
        const popupCloseBtn = document.getElementById('bird-close');

        if (imageContainer) {
            imageContainer.addEventListener('click', () => this.showPopup());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideBox());
        }

        if (popupCloseBtn) {
            popupCloseBtn.addEventListener('click', () => this.hidePopup());
        }

        if (popup) {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) this.hidePopup();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (popup && popup.style.display !== 'none') {
                this.hidePopup();
            } else if (box && box.style.display !== 'none') {
                this.hideBox();
            }
        });
    }

    async loadBird() {
        const cached = this.getCachedBird();
        if (cached) {
            this.displayBird(cached);
            this.fetchBird().then((data) => {
                if (data) {
                    this.cacheBird(data);
                    if (data.date !== cached.date || data.url !== cached.url) {
                        this.displayBird(data);
                    }
                }
            }).catch(() => {});
            return;
        }

        const data = await this.fetchBird();
        if (data) {
            this.cacheBird(data);
            this.displayBird(data);
            return;
        }

        const stale = this.getCachedBird(true);
        if (stale) this.displayBird(stale);
        else this.showError();
    }

    async fetchBird() {
        const dateStr = this.easternDateString();
        const proxyUrl = this.buildApiUrl(dateStr);

        if (proxyUrl) {
            try {
                const response = await fetch(proxyUrl);
                if (response.status === 429) return this.getCachedBird(true);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.url) return data;
                }
            } catch (_) {}
            return this.getCachedBird(true);
        }

        try {
            return await this.fetchBirdDirect(dateStr);
        } catch (_) {
            return this.getCachedBird(true);
        }
    }

    photoUrl(photo) {
        if (!photo) return null;
        return photo.large_url || photo.medium_url || photo.url || null;
    }

    wikipediaTitleFromUrl(url) {
        if (!url) return null;
        try {
            const path = new URL(url).pathname;
            const raw = path.split('/').filter(Boolean).pop();
            return raw ? decodeURIComponent(raw.replace(/_/g, ' ')) : null;
        } catch (_) {
            return null;
        }
    }

    async fetchBirdDirect(dateStr) {
        const doy = this.dayOfYearFromDate(dateStr);
        const hash = this.hashDate(dateStr);
        const page = (doy % 40) + 1;
        const taxaUrl =
            `https://api.inaturalist.org/v1/taxa?taxon_id=3&rank=species&per_page=30&page=${page}&order=desc&order_by=observations_count`;

        const taxaRes = await fetch(taxaUrl);
        if (!taxaRes.ok) throw new Error(`inaturalist ${taxaRes.status}`);
        const taxaData = await taxaRes.json();
        const results = Array.isArray(taxaData.results) ? taxaData.results : [];
        if (!results.length) throw new Error('no birds');

        let bird = null;
        for (let i = 0; i < results.length; i++) {
            const candidate = results[(hash + i) % results.length];
            const url = this.photoUrl(candidate.default_photo);
            if (!url) continue;
            bird = {
                title: candidate.preferred_common_name || candidate.name,
                scientific_name: candidate.name,
                url,
                date: dateStr,
                wikipedia_url: candidate.wikipedia_url || null,
                avibase_url: candidate.name
                    ? `https://avibase.bsc-eoc.org/search.jsp?qstr=${encodeURIComponent(candidate.name)}`
                    : null,
                inaturalist_url: candidate.id
                    ? `https://www.inaturalist.org/taxa/${candidate.id}`
                    : null,
                explanation: ''
            };
            break;
        }
        if (!bird) throw new Error('no bird with photo');

        const wikiTitle = this.wikipediaTitleFromUrl(bird.wikipedia_url) || bird.title;
        if (wikiTitle) {
            try {
                const wikiRes = await fetch(
                    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`
                );
                if (wikiRes.ok) {
                    const summary = await wikiRes.json();
                    bird.explanation = summary.extract || '';
                    bird.wikipedia_url = summary.content_urls?.desktop?.page || bird.wikipedia_url;
                }
            } catch (_) {}
        }

        return bird;
    }

    displayBird(data) {
        const imageContainer = document.getElementById('bird-box-image-container');
        const titleElement = document.getElementById('bird-box-title');
        const popupImage = document.getElementById('bird-popup-image');
        const popupTitle = document.getElementById('bird-title');
        const popupSci = document.getElementById('bird-scientific');
        const popupExplanation = document.getElementById('bird-explanation');
        const popupDate = document.getElementById('bird-date');
        const popupLink = document.getElementById('bird-learn-link');

        if (!imageContainer) return;

        this.lastData = data;
        imageContainer.innerHTML = '';

        const img = document.createElement('img');
        img.src = data.url;
        const fallbackTitle = window.I18n ? window.I18n.t('bird.fallbackTitle') : 'bird of the day';
        const loadingText = window.I18n ? window.I18n.t('panel.loading') : 'loading...';
        img.alt = data.title || fallbackTitle;
        img.className = 'bird-box-image';
        img.onerror = () => this.showError(loadingText);
        imageContainer.appendChild(img);

        if (titleElement) {
            titleElement.textContent = window.I18n
                ? window.I18n.t('panel.birdTitle')
                : "TODAY'S BIRD";
            titleElement.title = data.title || fallbackTitle;
        }

        if (popupImage) popupImage.src = data.url;
        if (popupTitle) popupTitle.textContent = data.title || fallbackTitle;
        if (popupSci) {
            popupSci.textContent = data.scientific_name || '';
            popupSci.style.display = data.scientific_name ? '' : 'none';
        }
        if (popupExplanation) popupExplanation.textContent = data.explanation || '';
        if (popupDate) {
            const date = new Date(`${data.date}T12:00:00`);
            popupDate.textContent = date.toLocaleDateString(window.I18n?.locale === 'ja' ? 'ja-JP' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        if (popupLink) {
            const href = data.wikipedia_url || data.avibase_url || data.inaturalist_url ||
                'https://www.allaboutbirds.org/guide/';
            popupLink.href = href;
        }
    }

    showPopup() {
        const popup = document.getElementById('bird-popup');
        if (popup) {
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hidePopup() {
        const popup = document.getElementById('bird-popup');
        if (popup) {
            popup.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    showError(message) {
        const imageContainer = document.getElementById('bird-box-image-container');
        if (imageContainer) {
            const text = message || (window.I18n ? window.I18n.t('panel.loading') : 'loading....');
            imageContainer.innerHTML = `<div class="bird-error">${text}</div>`;
        }
    }

    toggleVisibility() {
        const box = document.getElementById('bird-box');
        if (!box) return;

        const isVisible = box.style.display !== 'none' &&
            window.getComputedStyle(box).display !== 'none';

        if (isVisible) this.hideBox();
        else this.showBox();
    }

    showBox(options = {}) {
        const box = document.getElementById('bird-box');
        if (!box) return;

        box.style.display = 'block';
        box.style.opacity = '0';
        box.style.transform = 'translateY(-10px) scale(0.95)';
        void box.offsetHeight;
        requestAnimationFrame(() => {
            box.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            box.style.opacity = '1';
            box.style.transform = 'translateY(0) scale(1)';
        });

        if (options.reload !== false) {
            this.loadBird();
        }
    }

    hideBox() {
        const box = document.getElementById('bird-box');
        if (!box) return;

        box.style.opacity = '0';
        box.style.transform = 'translateY(-10px) scale(0.95)';
        setTimeout(() => {
            box.style.display = 'none';
        }, 400);
    }

    getCachedBird(allowExpired = false) {
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

    cacheBird(data) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
        } catch (_) {}
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.BirdPanel = new BirdPanel();
    });
} else {
    window.BirdPanel = new BirdPanel();
}

window.BirdPanelClass = BirdPanel;

window.openBirdWindow = () => {
    if (window.BirdPanel) {
        window.BirdPanel.toggleVisibility();
    }
};
