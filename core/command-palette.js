/**
 * Command palette (Ctrl+K): find and open apps, lists, episodes, quotes and reflections.
 * The search and item building are pure functions, so they can be tested without the DOM.
 */
import { APPS, openApp } from './app-catalog.js';

const RESULT_LIMIT = 30;
const QUOTE_PREVIEW = 90;

/** The page's translation for a key, or the English fallback when the key or the translator is missing. */
const tr = (key, fallback) => {
    const text = window.I18n?.t?.(key);
    return text && text !== key ? text : fallback;
};

const GROUP_KEYS = new Set(['apps', 'podcasts', 'reflections', 'lists']);

/** A group name in the page language. Folder paths and quote authors keep their own text after the translated word. */
export function translateGroup(group, t = tr) {
    if (GROUP_KEYS.has(group)) return t(`palette.group.${group}`, group);
    if (group.startsWith('lists › ')) return `${t('palette.group.lists', 'lists')}${group.slice('lists'.length)}`;
    if (group.startsWith('quotes · ')) return `${t('palette.group.quotes', 'quotes')}${group.slice('quotes'.length)}`;
    return group;
}

/** The label and group shown for an item in the page language. */
export function displayItem(item, t = tr) {
    return {
        label: item.labelKey ? t(item.labelKey, item.label) : item.label,
        group: translateGroup(item.group, t),
    };
}

/** Items for the lists folder: every list, folder and podcast episode, with the window function to open it. */
export function listItems(app) {
    if (!app || typeof app.rootEntries !== 'function') return [];
    const items = [];
    const walk = (entries, trail) => {
        for (const entry of entries) {
            const group = trail.length ? `lists › ${trail.join(' › ')}` : 'lists';
            if (entry.kind === 'podcast') {
                items.push({ label: entry.label, group: 'podcasts', fn: 'openPodcastEpisode', arg: entry.id });
            } else if (entry.kind === 'list') {
                items.push({ label: entry.label, group, fn: 'openBooksWindow', arg: entry.id });
            } else if (entry.kind === 'folder') {
                items.push({ label: entry.label, group, fn: 'openListsFolderWindow', arg: entry.id });
                walk(app.entriesForFolder(entry.id), [...trail, entry.label]);
            }
        }
    };
    walk(app.rootEntries(), []);
    return items;
}

/** Items for the apps, quotes and reflections (notes) that can be opened. */
export function buildItems({ apps = APPS, lists = [], quotes = [], notes = [] } = {}) {
    return [
        ...apps.map((app) => ({ label: app.label, labelKey: app.labelKey, group: 'apps', app: app.id })),
        ...lists,
        ...quotes.map((quote) => ({
            label: quote.text.length > QUOTE_PREVIEW ? `${quote.text.slice(0, QUOTE_PREVIEW)}…` : quote.text,
            group: `quotes · ${quote.author}`,
            app: 'quotes',
        })),
        ...notes.map((note) => ({ label: note.title, group: 'reflections', app: 'notes' })),
    ];
}

/**
 * Items matching every word of the query. Labels that start with the first word rank first.
 * An empty query returns the first items, so the palette is useful before typing.
 */
export function searchItems(items, query, limit = RESULT_LIMIT) {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return items.slice(0, limit);
    return items
        .map((item, index) => {
            const label = item.label.toLowerCase();
            const haystack = `${label} ${item.group.toLowerCase()} ${(item.searchText || '').toLowerCase()}`;
            if (!words.every((word) => haystack.includes(word))) return null;
            return { item, index, rank: label.startsWith(words[0]) ? 0 : 1 };
        })
        .filter(Boolean)
        .sort((a, b) => a.rank - b.rank || a.index - b.index)
        .slice(0, limit)
        .map(({ item }) => item);
}

/** Runs an item: an app (opened only if not already showing), or its window function with its argument. */
export function runItem(item) {
    if (item.app) return openApp(item.app);
    const fn = window[item.fn];
    if (typeof fn !== 'function') return false;
    if (item.arg !== undefined) fn(item.arg);
    else fn();
    return true;
}

function sourcesNow() {
    let notes = [];
    try {
        notes = window.NotesStorage ? new window.NotesStorage().getDefaultEntries() : [];
    } catch (_) {
        // Reflections are optional in the palette.
    }
    return {
        lists: listItems(window.ListsFolderApp),
        quotes: window.QUOTES || [],
        notes,
    };
}

const isOpenShortcut = (e) => (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'k';

/** Adds the palette to the page. Safe to call once; it builds its DOM when first opened. */
export function initCommandPalette(doc = document) {
    let root = null;
    let input = null;
    let list = null;
    let items = [];
    let results = [];
    let active = 0;
    let returnFocus = null;

    function build() {
        root = doc.createElement('div');
        root.className = 'command-palette';
        root.hidden = true;
        root.innerHTML = `
            <div class="command-palette-panel" role="dialog" aria-modal="true" aria-label="${tr('palette.dialog', 'search')}">
                <input class="command-palette-input" type="text" autocomplete="off" spellcheck="false"
                    aria-label="${tr('palette.search', 'search apps, lists, quotes and reflections')}" aria-controls="command-palette-results"
                    aria-autocomplete="list" />
                <ul class="command-palette-results" id="command-palette-results" role="listbox"></ul>
            </div>`;
        doc.body.appendChild(root);
        input = root.querySelector('input');
        list = root.querySelector('ul');
        input.addEventListener('input', () => render());
        input.addEventListener('keydown', onKey);
        root.addEventListener('click', (e) => {
            if (e.target === root) close();
        });
        list.addEventListener('click', (e) => {
            const row = e.target.closest('li[data-index]');
            if (row) run(Number(row.dataset.index));
        });
    }

    function render() {
        results = searchItems(items, input.value);
        active = Math.min(active, Math.max(results.length - 1, 0));
        list.replaceChildren(...results.map((item, i) => {
            const li = doc.createElement('li');
            li.className = 'command-palette-result';
            li.dataset.index = String(i);
            li.id = `command-palette-option-${i}`;
            li.setAttribute('role', 'option');
            li.setAttribute('aria-selected', String(i === active));
            const shown = displayItem(item);
            const label = doc.createElement('span');
            label.className = 'command-palette-label';
            label.textContent = shown.label;
            const group = doc.createElement('span');
            group.className = 'command-palette-group';
            group.textContent = shown.group;
            li.append(label, group);
            return li;
        }));
        if (results.length === 0) {
            const empty = doc.createElement('li');
            empty.className = 'command-palette-empty';
            empty.textContent = tr('palette.empty', 'nothing matches');
            list.replaceChildren(empty);
        }
        input.setAttribute('aria-activedescendant', results.length ? `command-palette-option-${active}` : '');
    }

    // Items also match the words shown in the page language, so Japanese searches find them too.
    function allItems() {
        const { lists, quotes, notes } = sourcesNow();
        return buildItems({ lists, quotes, notes }).map((item) => {
            const shown = displayItem(item);
            return { ...item, searchText: `${shown.label} ${shown.group}` };
        });
    }

    function open() {
        // Rebuild if the page removed the palette's DOM since it was last opened.
        if (!root || !root.isConnected) build();
        returnFocus = doc.activeElement;
        root.hidden = false;
        // Read the sources once per opening; typing then only filters this list.
        items = allItems();
        input.value = '';
        input.setAttribute('aria-label', tr('palette.search', 'search apps, lists, quotes and reflections'));
        root.querySelector('.command-palette-panel')?.setAttribute('aria-label', tr('palette.dialog', 'search'));
        active = 0;
        render();
        input.focus();
    }

    function close() {
        if (!root || root.hidden) return;
        root.hidden = true;
        if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
    }

    function run(index) {
        const item = results[index];
        if (!item) return;
        close();
        runItem(item);
    }

    function move(delta) {
        if (results.length === 0) return;
        active = (active + delta + results.length) % results.length;
        [...list.querySelectorAll('li[data-index]')].forEach((li, i) => {
            li.setAttribute('aria-selected', String(i === active));
        });
        input.setAttribute('aria-activedescendant', `command-palette-option-${active}`);
        list.querySelector(`[data-index="${active}"]`)?.scrollIntoView?.({ block: 'nearest' });
    }

    function onKey(e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
        else if (e.key === 'Enter') { e.preventDefault(); run(active); }
        else if (e.key === 'Escape') { e.preventDefault(); close(); }
    }

    doc.addEventListener('keydown', (e) => {
        if (isOpenShortcut(e)) {
            e.preventDefault();
            if (root && root.isConnected && !root.hidden) close();
            else open();
        }
    });

    return { open, close };
}

if (typeof document !== 'undefined' && !window.CommandPalette) {
    window.CommandPalette = initCommandPalette();
}
