/**
 * I18n – EN/JA chrome copy, persistence, and cute locale toggle
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function makeFakeStorage(initial = {}) {
    const store = { ...initial };
    return {
        getItem(k) { return store[k] ?? null; },
        setItem(k, v) { store[k] = String(v); },
        removeItem(k) { delete store[k]; },
        clear() { for (const key of Object.keys(store)) delete store[key]; },
        get length() { return Object.keys(store).length; },
        key(i) { return Object.keys(store)[i] ?? null; },
    };
}

const toggleDom = () => `
    <button type="button" id="locale-toggle" class="locale-toggle"></button>
    <span data-i18n="menu.whoIAm">who i am</span>
    <span data-i18n="todo.itemsLeft" data-i18n-count="3">3 items left</span>
    <a data-i18n-title="tray.wisdom" title="today's wisdom">wisdom</a>
    <button data-i18n-aria-label="panel.close" aria-label="Close">x</button>
`;

describe('I18n', () => {
    beforeAll(async () => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        document.body.innerHTML = toggleDom();
        await import('../core/i18n.js');
    });

    beforeEach(() => {
        vi.stubGlobal('localStorage', makeFakeStorage());
        document.body.innerHTML = toggleDom();
        document.documentElement.lang = 'en';
        document.documentElement.classList.remove('locale-ja');
        document.title = "Marina von Steinkirch's Matrix";
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('exposes I18nClass and a live instance', () => {
        expect(window.I18nClass).toBeDefined();
        expect(window.I18n).toBeDefined();
        expect(window.I18nClass.LOCALES).toEqual(['en', 'ja']);
        expect(window.I18nClass.STORAGE_KEY).toBe('matrix-locale');
    });

    it('translates keys, interpolates vars, and falls back to english then the key', () => {
        const i18n = new window.I18nClass();
        expect(i18n.t('menu.whoIAm')).toBe('who i am');
        expect(i18n.t('todo.itemsLeft', { count: 2 })).toBe('2 items left');
        expect(i18n.t('todo.itemsLeft', { count: 0 })).toBe('0 items left');
        expect(i18n.t('todo.itemsLeft')).toBe('{count} items left');
        expect(i18n.t('missing.key')).toBe('missing.key');
        i18n.locale = 'ja';
        expect(i18n.t('menu.whoIAm')).toBe('わたし');
        expect(i18n.t('todo.itemLeft', { count: 1 })).toBe('のこり1こ');
        i18n.locale = 'xx';
        expect(i18n.t('menu.whoIAm')).toBe('who i am');
        expect(i18n.has('menu.whoIAm')).toBe(true);
        expect(i18n.has('nope')).toBe(false);
    });

    it('reads a stored locale and ignores invalid or throwing storage', () => {
        vi.stubGlobal('localStorage', makeFakeStorage({ 'matrix-locale': 'ja' }));
        expect(new window.I18nClass().locale).toBe('ja');
        vi.stubGlobal('localStorage', makeFakeStorage({ 'matrix-locale': 'fr' }));
        expect(new window.I18nClass().locale).toBe('en');
        vi.stubGlobal('localStorage', {
            getItem() { throw new Error('blocked'); },
            setItem() {},
        });
        expect(new window.I18nClass().locale).toBe('en');
    });

    it('setLocale paints the document, persists, and emits localechange', () => {
        const i18n = new window.I18nClass();
        const events = [];
        document.addEventListener('localechange', (e) => events.push(e.detail.locale));
        i18n.setLocale('ja');
        expect(i18n.locale).toBe('ja');
        expect(localStorage.getItem('matrix-locale')).toBe('ja');
        expect(document.documentElement.lang).toBe('ja');
        expect(document.documentElement.classList.contains('locale-ja')).toBe(true);
        expect(document.title).toBe('マリーナ・フォン・シュタインキルヒのマトリックス');
        expect(document.querySelector('[data-i18n="menu.whoIAm"]').textContent).toBe('わたし');
        expect(document.querySelector('[data-i18n="todo.itemsLeft"]').textContent).toBe('のこり3こ');
        expect(document.querySelector('[data-i18n-title]').getAttribute('title')).toBe('きょうのちえ');
        expect(document.querySelector('[data-i18n-aria-label]').getAttribute('aria-label')).toBe('とじる');
        expect(events).toEqual(['ja']);
        i18n.setLocale('ja');
        i18n.setLocale('nope');
        expect(events).toEqual(['ja']);
        i18n.setLocale('en');
        expect(document.documentElement.lang).toBe('en');
        expect(document.documentElement.classList.contains('locale-ja')).toBe(false);
        expect(events).toEqual(['ja', 'en']);
    });

    it('setLocale survives storage write failures', () => {
        vi.stubGlobal('localStorage', {
            getItem() { return null; },
            setItem() { throw new Error('quota'); },
        });
        const i18n = new window.I18nClass();
        expect(() => i18n.setLocale('ja')).not.toThrow();
        expect(i18n.locale).toBe('ja');
    });

    it('toggle flips between en and ja and updates the cute switch', () => {
        const i18n = new window.I18nClass();
        const button = document.getElementById('locale-toggle');
        i18n.setupToggle();
        expect(button.classList.contains('is-ja')).toBe(false);
        expect(button.getAttribute('aria-pressed')).toBe('false');
        i18n.toggle();
        expect(i18n.locale).toBe('ja');
        expect(button.classList.contains('is-ja')).toBe(true);
        expect(button.getAttribute('aria-pressed')).toBe('true');
        expect(button.getAttribute('title')).toBe('english にする');
        i18n.toggle();
        expect(i18n.locale).toBe('en');
    });

    it('setupToggle binds once and click switches locale', () => {
        const i18n = new window.I18nClass();
        const button = document.getElementById('locale-toggle');
        expect(button.dataset.i18nBound).toBe('true');
        i18n.setupToggle();
        button.click();
        expect(i18n.locale).toBe('ja');
        document.body.innerHTML = '';
        expect(() => i18n.setupToggle()).not.toThrow();
        expect(() => i18n.syncToggle()).not.toThrow();
    });

    it('covers notes and todo list copy in both locales', () => {
        const keys = [
            'todo.item.dreams',
            'todo.item.peace',
            'todo.item.people',
            'notes.hello.title',
            'notes.hello.content',
            'notes.weekday.sunday',
        ];
        const en = window.I18N_STRINGS.en;
        const ja = window.I18N_STRINGS.ja;
        expect(Object.keys(en).sort()).toEqual(Object.keys(ja).sort());
        for (const key of keys) {
            expect(en[key]).toBeTruthy();
            expect(ja[key]).toBeTruthy();
            expect(ja[key]).not.toBe(en[key]);
        }
        expect(en['todo.item.dreams']).toBe('never give up on my dreams');
        expect(ja['todo.item.dreams']).toContain('ゆめ');
        expect(en['notes.hello.title']).toBe('hello starlit world');
        expect(ja['notes.hello.title']).toContain('ほしぞら');
        expect(en['notes.hello.content']).toContain('scholar');
        expect(ja['notes.hello.content']).toContain('がくしゃ');
    });

    it('has and t fall back to english when the active table omits a key', () => {
        const i18n = new window.I18nClass();
        i18n.locale = 'ja';
        const ja = window.I18N_STRINGS.ja;
        const original = ja['menu.whoIAm'];
        delete ja['menu.whoIAm'];
        try {
            expect(i18n.t('menu.whoIAm')).toBe('who i am');
            expect(i18n.has('menu.whoIAm')).toBe(true);
        } finally {
            ja['menu.whoIAm'] = original;
        }
    });

    it('index.html wires chrome keys, the locale toggle, and a ja boot paint', () => {
        const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
        expect(html).toContain('src="core/i18n.js"');
        expect(html).toContain('id="locale-toggle"');
        expect(html).toContain('family=Zen+Maru+Gothic');

        const keys = [...html.matchAll(/data-i18n(?:-title|-aria-label)?="([^"]+)"/g)].map((m) => m[1]);
        expect(keys.length).toBeGreaterThan(20);
        for (const key of keys) {
            expect(window.I18N_STRINGS.en).toHaveProperty(key);
            expect(window.I18N_STRINGS.ja).toHaveProperty(key);
        }

        const boot = html.match(/<script>\s*(\(function \(\) \{[\s\S]*?\}\)\(\);)\s*<\/script>/);
        expect(boot).toBeTruthy();
        const documentEl = { lang: 'en', classList: { add: vi.fn() } };
        const run = new Function('document', 'localStorage', boot[1]);
        run({ documentElement: documentEl }, { getItem: () => 'ja' });
        expect(documentEl.lang).toBe('ja');
        expect(documentEl.classList.add).toHaveBeenCalledWith('locale-ja');
        run({ documentElement: documentEl }, { getItem: () => 'en' });
        expect(() => run(
            { documentElement: documentEl },
            { getItem() { throw new Error('blocked'); } }
        )).not.toThrow();
    });
});
