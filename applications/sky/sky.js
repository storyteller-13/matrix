/**
 * Today's Sky panel – CosmyDay transit sky_summary (planet, sign, angle).
 */
const PLANET_ORDER = [
    'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter',
    'saturn', 'uranus', 'neptune', 'pluto',
    'north_node', 'chiron', 'southnode', 'south_node',
];

const PLANET_GLYPHS = {
    sun: '\u2609',
    moon: '\u263D',
    mercury: '\u263F',
    venus: '\u2640',
    mars: '\u2642',
    jupiter: '\u2643',
    saturn: '\u2644',
    uranus: '\u2645',
    neptune: '\u2646',
    pluto: '\u2647',
    north_node: '\u260A',
    southnode: '\u260B',
    south_node: '\u260B',
    chiron: '\u26B7',
};

const PLANET_LABELS = {
    north_node: 'n. node',
    southnode: 's. node',
    south_node: 's. node',
};

const SIGN_GLYPHS = {
    aries: '\u2648',
    taurus: '\u2649',
    gemini: '\u264A',
    cancer: '\u264B',
    leo: '\u264C',
    virgo: '\u264D',
    libra: '\u264E',
    scorpio: '\u264F',
    sagittarius: '\u2650',
    capricorn: '\u2651',
    aquarius: '\u2652',
    pisces: '\u2653',
};

const SKIP_KEYS = new Set(['stelliums', 'top_aspects']);

class SkyPanel {
    constructor() {
        this.apiBase = window.Env && window.Env.getApiBase('sky');
        this.directUrl = 'https://api.cosmyday.com/content/transit';
        this.cacheKey = 'sky_cache';
        this.cacheExpiry = 24 * 60 * 60 * 1000;
        this.lastSky = null;
        this.init();
    }

    buildApiUrl() {
        return this.apiBase || this.directUrl;
    }

    init() {
        const closeBtn = document.getElementById('sky-box-close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.hideBox());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.getBox() && window.getComputedStyle(this.getBox()).display !== 'none') {
                this.hideBox();
            }
        });
        this.loadSky();
        document.addEventListener('localechange', () => {
            if (this.lastSky) this.displaySky(this.lastSky);
            else this.showError();
        });
    }

    getBox() {
        return document.getElementById('sky-box');
    }

    getList() {
        return document.getElementById('sky-planet-list');
    }

    isMobile() {
        return typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 768px)').matches;
    }

    planetLabel(key) {
        const i18nKey = `sky.planet.${key}`;
        if (window.I18n?.has(i18nKey)) return window.I18n.t(i18nKey);
        if (PLANET_LABELS[key]) return PLANET_LABELS[key];
        return String(key || '').replace(/_/g, ' ');
    }

    signLabel(sign) {
        const slug = String(sign || '').toLowerCase();
        const i18nKey = `sky.sign.${slug}`;
        if (window.I18n?.has(i18nKey)) return window.I18n.t(i18nKey);
        return slug.slice(0, 3);
    }

    formatDegree(deg) {
        const n = Number(deg);
        if (!Number.isFinite(n)) return '';
        const abs = Math.abs(n);
        let degrees = Math.floor(abs);
        let minutes = Math.round((abs - degrees) * 60);
        if (minutes === 60) {
            degrees += 1;
            minutes = 0;
        }
        return `${degrees}\u00B0${String(minutes).padStart(2, '0')}\u2032`;
    }

    isPlanetEntry(value) {
        return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
            && (value.sign != null || value.degree != null);
    }

    extractPlanets(summary) {
        if (!summary || typeof summary !== 'object') return [];
        const items = [];
        const seen = new Set();
        const pushKey = (key) => {
            if (seen.has(key) || SKIP_KEYS.has(key)) return;
            const value = summary[key];
            if (!this.isPlanetEntry(value)) return;
            seen.add(key);
            const sign = String(value.sign || '');
            items.push({
                key,
                name: this.planetLabel(key),
                glyph: PLANET_GLYPHS[key] || '\u2726',
                sign,
                signGlyph: SIGN_GLYPHS[sign.toLowerCase()] || '',
                signShort: this.signLabel(sign),
                degree: this.formatDegree(value.degree),
                retrograde: Boolean(value.retrograde),
            });
        };
        PLANET_ORDER.forEach(pushKey);
        Object.keys(summary).forEach(pushKey);
        return items;
    }

    async loadSky() {
        const cached = this.getCachedSky();
        if (cached) {
            this.displaySky(cached);
            this.fetchSky().then((data) => {
                if (data) {
                    this.cacheSky(data);
                    this.displaySky(data);
                }
            }).catch(() => {});
            return;
        }

        const data = await this.fetchSky();
        if (data) {
            this.cacheSky(data);
            this.displaySky(data);
            return;
        }

        const stale = this.getCachedSky(true);
        if (stale) this.displaySky(stale);
        else this.showError();
    }

    async fetchSky() {
        try {
            const response = await fetch(this.buildApiUrl(), {
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) return this.getCachedSky(true);
            const data = await response.json();
            if (data && data.sky_summary) return data;
        } catch (_) {}
        return this.getCachedSky(true);
    }

    displaySky(data) {
        this.lastSky = data;
        const list = this.getList();
        if (!list) return;
        const planets = this.extractPlanets(data && data.sky_summary);
        list.replaceChildren();
        if (!planets.length) {
            this.showError();
            return;
        }
        planets.forEach((planet) => {
            const row = document.createElement('li');
            row.className = `sky-planet sky-planet--${planet.key.replace(/_/g, '-')}`;

            const glyph = document.createElement('span');
            glyph.className = 'sky-planet-glyph';
            glyph.textContent = planet.glyph;
            glyph.setAttribute('aria-hidden', 'true');

            const name = document.createElement('span');
            name.className = 'sky-planet-name';
            name.textContent = planet.name;

            const place = document.createElement('span');
            place.className = 'sky-planet-place';
            const signGlyph = document.createElement('span');
            signGlyph.className = 'sky-planet-sign-glyph';
            signGlyph.textContent = planet.signGlyph;
            signGlyph.setAttribute('aria-hidden', 'true');
            const signName = document.createElement('span');
            signName.className = 'sky-planet-sign';
            signName.textContent = planet.signShort;
            place.append(signGlyph, signName);

            const angle = document.createElement('span');
            angle.className = 'sky-planet-angle';
            angle.textContent = planet.degree;

            const rx = document.createElement('span');
            rx.className = 'sky-planet-rx';
            if (planet.retrograde) {
                rx.textContent = window.I18n ? window.I18n.t('sky.rx') : 'rx';
                rx.title = window.I18n ? window.I18n.t('sky.retrograde') : 'retrograde';
            } else {
                rx.setAttribute('aria-hidden', 'true');
            }

            row.append(glyph, name, place, angle, rx);
            list.append(row);
        });
    }

    showError(message) {
        const list = this.getList();
        if (!list) return;
        list.replaceChildren();
        const item = document.createElement('li');
        item.className = 'sky-error';
        item.textContent = message || (window.I18n ? window.I18n.t('panel.loading') : 'loading...');
        list.append(item);
    }

    toggleVisibility() {
        const box = this.getBox();
        if (!box) return;
        const isVisible = box.style.display !== 'none' && window.getComputedStyle(box).display !== 'none';
        if (isVisible) this.hideBox();
        else this.showBox();
    }

    showBox(options = {}) {
        const box = this.getBox();
        if (!box) return;
        const center = this.isMobile() ? 'translate(-50%, -50%) ' : '';
        box.style.display = 'block';
        box.style.opacity = '0';
        box.style.transform = center + 'translateY(-10px) scale(0.95)';
        void box.offsetHeight;
        requestAnimationFrame(() => {
            box.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            box.style.opacity = '1';
            box.style.transform = center + 'translateY(0) scale(1)';
        });
        if (options.reload !== false) this.loadSky();
    }

    hideBox() {
        const box = this.getBox();
        if (!box) return;
        const center = this.isMobile() ? 'translate(-50%, -50%) ' : '';
        box.style.opacity = '0';
        box.style.transform = center + 'translateY(-10px) scale(0.95)';
        setTimeout(() => { box.style.display = 'none'; }, 400);
    }

    getCachedSky(allowExpired = false) {
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

    cacheSky(data) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
        } catch (_) {}
    }
}

window.SkyPanelClass = SkyPanel;

const initSky = () => { window.SkyPanel = new SkyPanel(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSky);
else initSky();

window.openSkyWindow = () => window.SkyPanel?.toggleVisibility();
