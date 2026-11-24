/**
 * Every English string has a Japanese translation, so no label falls back to English by accident.
 */
import { describe, it, expect, beforeAll } from 'vitest';

describe('i18n translation parity', () => {
    beforeAll(async () => {
        await import('../core/i18n.js');
    });

    it('has a Japanese string for every English key', () => {
        const ja = new Set(Object.keys(window.I18N_STRINGS.ja));
        const missing = Object.keys(window.I18N_STRINGS.en).filter((key) => !ja.has(key));
        expect(missing).toEqual([]);
    });
});
