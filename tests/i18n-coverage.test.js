/**
 * Translation coverage – every chrome string has an English and a Japanese version,
 * and the Japanese-facing labels the palette and terminal show come from the table.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { displayItem, translateGroup } from '../core/command-palette.js';
import { APPS } from '../core/app-catalog.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('translation coverage', () => {
    beforeAll(async () => {
        document.body.innerHTML = '<button id="locale-toggle" type="button"></button>';
        await import('../core/i18n.js');
    });

    it('every english key has a japanese string and the reverse', () => {
        const { en, ja } = window.I18N_STRINGS;
        expect(Object.keys(en).filter((key) => !(key in ja))).toEqual([]);
        expect(Object.keys(ja).filter((key) => !(key in en))).toEqual([]);
    });

    it('every i18n attribute in index.html names a key in both languages', () => {
        const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
        const keys = [...html.matchAll(/data-i18n(?:-title|-aria-label|-alt)?="([^"]+)"/g)].map((m) => m[1]);
        expect(keys.length).toBeGreaterThan(20);
        for (const key of keys) {
            expect(window.I18N_STRINGS.en).toHaveProperty(key);
            expect(window.I18N_STRINGS.ja).toHaveProperty(key);
        }
    });

    it('the sidebar sync label and the new alt, aria and window labels are translated', () => {
        window.I18n.setLocale('ja');
        const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
        expect(html).toContain('data-i18n="tray.sync"');
        expect(window.I18n.t('tray.sync')).toBe('同期');
        expect(window.I18n.t('window.closeAria')).toBe('ウィンドウをとじる');
        window.I18n.setLocale('en');
    });

    it('every app in the catalog has a translated palette label', () => {
        const { ja } = window.I18N_STRINGS;
        for (const app of APPS) {
            expect(app.labelKey, app.id).toBeDefined();
            expect(ja, app.labelKey).toHaveProperty(app.labelKey);
        }
    });

    it('palette groups and labels follow the page language and keep their own text', () => {
        const t = (key, fallback) => window.I18N_STRINGS.ja[key] ?? fallback;
        expect(translateGroup('apps', t)).toBe('アプリ');
        expect(translateGroup('lists › books', t)).toBe('リスト › books');
        expect(translateGroup('quotes · confucius', t)).toBe('ことば · confucius');
        expect(translateGroup('podcasts', t)).toBe('ポッドキャスト');
        expect(displayItem({ label: 'books', labelKey: 'app.books', group: 'apps' }, t)).toEqual({
            label: 'ほん',
            group: 'アプリ',
        });
        // Without a translation the English stays.
        expect(displayItem({ label: 'my list', group: 'lists' }, () => 'lists')).toEqual({ label: 'my list', group: 'lists' });
    });
});
