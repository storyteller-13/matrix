#!/usr/bin/env node
/**
 * Writes the static feeds from the site's own data:
 *   feeds/reflections.xml  RSS 2.0 of the reflections (notes)
 *   feeds/quotes.json      the quotes, as JSON
 * Run with `npm run feeds` after changing the reflections or quotes data.
 * Output is deterministic (no build timestamp), so the committed files only change when the data does.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export const SITE_URL = 'https://matrix.nullstar.fun/';
const SUMMARY_LENGTH = 400;

/** Loads a browser script that assigns to window.* into a sandbox and returns that window. */
export function loadBrowserScripts(files) {
    const sandbox = { window: {}, console };
    for (const file of files) {
        vm.runInNewContext(readFileSync(file, 'utf8'), sandbox, { filename: file });
    }
    return sandbox.window;
}

/** Reflection text as plain text: links keep their words, italics and other markers are removed. */
export function plainText(content = '') {
    return content
        .replace(/«a:[^»]*»([\s\S]*?)«\/a»/g, '$1')
        .replace(/«\/?i»/g, '')
        .replace(/^-{3,}$/gm, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

const escapeXml = (text) => String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** RSS 2.0 for the reflections. Entries without a valid date are left out. */
export function buildReflectionsFeed(entries, siteUrl = SITE_URL) {
    const dated = entries
        .map((entry) => ({ entry, time: Date.parse(entry.date) }))
        .filter(({ time }) => !Number.isNaN(time))
        .sort((a, b) => b.time - a.time);
    const newest = dated.length ? new Date(dated[0].time).toUTCString() : new Date(0).toUTCString();
    const items = dated.map(({ entry, time }) => {
        const text = plainText(entry.content);
        const summary = text.length > SUMMARY_LENGTH ? `${text.slice(0, SUMMARY_LENGTH).trimEnd()}…` : text;
        return [
            '    <item>',
            `      <title>${escapeXml(entry.title)}</title>`,
            `      <link>${escapeXml(`${siteUrl}?open=notes`)}</link>`,
            `      <guid isPermaLink="false">${escapeXml(entry.id)}</guid>`,
            `      <pubDate>${new Date(time).toUTCString()}</pubDate>`,
            `      <description>${escapeXml(summary)}</description>`,
            '    </item>',
        ].join('\n');
    });
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0">',
        '  <channel>',
        '    <title>reflections · matrix.nullstar.fun</title>',
        `    <link>${escapeXml(siteUrl)}</link>`,
        '    <description>reflections and stories by marina von steinkirch</description>',
        `    <lastBuildDate>${newest}</lastBuildDate>`,
        ...items,
        '  </channel>',
        '</rss>',
        '',
    ].join('\n');
}

/** The quotes as JSON, with a link to the quotes window for each. */
export function buildQuotesJson(quotes, siteUrl = SITE_URL) {
    const items = quotes.map((quote) => ({
        text: quote.text,
        author: quote.author,
        link: `${siteUrl}?open=quotes`,
    }));
    return `${JSON.stringify({ count: items.length, quotes: items }, null, 2)}\n`;
}

/** Generates both feeds from the site's data. Returns { reflections, quotes } as strings. */
export function generateFeeds(root) {
    const win = loadBrowserScripts([
        join(root, 'applications/notes/notes-storage.js'),
        join(root, 'applications/quotes/quotes-data.js'),
    ]);
    const reflections = new win.NotesStorage().getDefaultEntries();
    return {
        reflections: buildReflectionsFeed(reflections),
        quotes: buildQuotesJson(win.QUOTES || []),
    };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
    const root = join(dirname(fileURLToPath(import.meta.url)), '..');
    const feeds = generateFeeds(root);
    writeFileSync(join(root, 'feeds/reflections.xml'), feeds.reflections);
    writeFileSync(join(root, 'feeds/quotes.json'), feeds.quotes);
    console.log('wrote feeds/reflections.xml and feeds/quotes.json');
}
