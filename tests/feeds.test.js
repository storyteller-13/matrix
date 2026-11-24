/**
 * Feeds: the RSS and JSON builders, and the committed feed files matching the site's data.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { plainText, buildReflectionsFeed, buildQuotesJson, generateFeeds } from '../scripts/build-feeds.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('feeds', () => {
    it('turns reflection markup into plain text and drops decorative rules', () => {
        const text = plainText('-----\nhello «a:https://example.test/»there«/a», «i»friend«/i»\n-----');
        expect(text).toBe('hello there, friend');
    });

    it('builds RSS items newest first, escaped, with deep links and no invalid dates', () => {
        const xml = buildReflectionsFeed([
            { id: 'old', title: 'Tom & Jerry', date: '2026-01-01T12:00:00Z', content: 'a <b>' },
            { id: 'new', title: 'new one', date: '2026-02-01T12:00:00Z', content: 'b' },
            { id: 'bad', title: 'no date', date: '2026-??-??', content: 'c' },
        ], 'https://example.test/');
        expect(xml.indexOf('new one')).toBeLessThan(xml.indexOf('Tom &amp; Jerry'));
        expect(xml).not.toContain('no date');
        expect(xml).toContain('<link>https://example.test/?open=notes</link>');
        expect(xml).toContain('a &lt;b&gt;');
    });

    it('builds the quotes JSON with a count and links', () => {
        const parsed = JSON.parse(buildQuotesJson([{ text: 'hi', author: 'x' }], 'https://example.test/'));
        expect(parsed.count).toBe(1);
        expect(parsed.quotes[0].link).toBe('https://example.test/?open=quotes');
    });

    it('committed feeds match the site data (run `npm run feeds` after changing it)', () => {
        const generated = generateFeeds(root);
        expect(readFileSync(join(root, 'feeds/reflections.xml'), 'utf8')).toBe(generated.reflections);
        expect(readFileSync(join(root, 'feeds/quotes.json'), 'utf8')).toBe(generated.quotes);
    });
});
