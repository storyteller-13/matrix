/**
 * Terminal shell logic: a small virtual filesystem, path handling, commands and
 * tab completion. Free of DOM access so it can be tested directly; terminal.js renders it.
 */

import { t, terminalLocale } from './terminal-text.js';

const HOME = ['home', 'anon'];
const HOME_LABEL = '~';
const PROMPT_USER = 'anon@nullstar:';
const MAX_LINK_DEPTH = 8;
const FIXTURE_MTIME = new Date('2024-12-15T14:30:00');
const DIR_SIZE = 4096;
const LS_OWNER = 'anon';
const LS_DIR_PERMS = 'drwxr-xr-x';
const LS_FILE_PERMS = '-rw-r--r--';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COMMAND_NAMES = [
    'cat', 'cd', 'clear', 'date', 'echo', 'exit', 'fortune', 'grep', 'help', 'history', 'ls',
    'matrix', 'neofetch', 'next', 'open', 'pause', 'play', 'prev', 'pwd', 'sudo', 'view',
];
// Matrix mode only: `enter` opens NULLSTAR. It is listed for tab completion only while matrix mode is on.
const MATRIX_COMMAND_NAMES = ['enter'];
const NULLSTAR_URL = 'https://nullstar.games/';

// Apps `open` can start. The UI maps each name to its window function.
const APP_TARGETS = [
    'about', 'apod', 'artwork', 'bird', 'books', 'building', 'calendar', 'chess', 'home',
    'lists', 'music', 'notes', 'podcast', 'quotes', 'sky', 'status', 'todo',
];


const dir = (children = {}) => ({ type: 'dir', mtime: FIXTURE_MTIME, children });
const file = (content) => ({
    type: 'file',
    content,
    size: new TextEncoder().encode(content).length,
    mtime: FIXTURE_MTIME,
});
const image = () => ({ type: 'image', size: 0, mtime: FIXTURE_MTIME });
const link = (target) => ({ type: 'link', target });
// The lists folder is read from ListsFolderApp at call time, so it is not stored here.
const LISTS_ROOT = { type: 'listdir', folderId: null };

// The secret note. In matrix mode it says something else; the shell asks the theme on each read.
const PINK_SECRET = "let's be in love with life";
const MATRIX_SECRET = 'the future is about friendships.';
let inMatrix = () => false;
const secretsFile = {
    type: 'file',
    mtime: FIXTURE_MTIME,
    get content() { return inMatrix() ? MATRIX_SECRET : PINK_SECRET; },
    get size() { return new TextEncoder().encode(this.content).length; },
};

const ROOT = dir({
    bin: dir(),
    etc: dir({
        'os-release': file('name="nullstar"\nversion="2024.12"\nid=nullstar\npretty_name="nullstar 2024.12"\nansi_color="0;34"'),
    }),
    home: dir({
        anon: dir({
            '.secrets': secretsFile,
            artwork: link('/artwork'),
            lists: LISTS_ROOT,
        }),
    }),
    usr: dir(),
    artwork: dir({
        'summer.jpg': image(),
        'love.jpg': image(),
        'lion.jpg': image(),
        'memories.jpg': image(),
    }),
});

/**
 * Splits a command line into arguments. Whitespace separates arguments, and
 * single or double quotes keep spaces inside one argument.
 * Throws when a quote is never closed.
 */
export function tokenize(line) {
    const tokens = [];
    let current = null;
    let quote = null;
    for (const ch of line) {
        if (quote) {
            if (ch === quote) quote = null;
            else current += ch;
            continue;
        }
        if (ch === '"' || ch === "'") {
            quote = ch;
            current = current ?? '';
            continue;
        }
        if (/\s/.test(ch)) {
            if (current !== null) {
                tokens.push(current);
                current = null;
            }
            continue;
        }
        current = (current ?? '') + ch;
    }
    if (quote) throw new Error(`unexpected EOF while looking for matching \`${quote}'`);
    if (current !== null) tokens.push(current);
    return tokens;
}

function formatDate(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${MONTHS[date.getMonth()]} ${String(date.getDate()).padStart(2, ' ')} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatLong(name, info) {
    const perms = info.isDir ? LS_DIR_PERMS : LS_FILE_PERMS;
    return `${perms}  1 ${LS_OWNER} ${LS_OWNER}  ${String(info.size).padStart(5)} ${formatDate(info.mtime)} ${name}`;
}

const splitPath = (path) => path.split('/').filter(Boolean);
const startsWithSegments = (segs, prefix) => prefix.every((part, i) => segs[i] === part);
const quoteIfNeeded = (name) => (/\s/.test(name) ? `"${name}"` : name);
const commonPrefix = (values) => values.reduce((prefix, value) => {
    let i = 0;
    while (i < prefix.length && i < value.length && prefix[i] === value[i]) i++;
    return prefix.slice(0, i);
});

/**
 * Creates one shell session.
 * @param {object} deps
 * @param {() => ({rootEntries?: Function, entriesForFolder?: Function} | undefined)} deps.getLists
 *   Returns the lists folder app, or undefined when it is not loaded.
 * @param {() => Date} deps.now  Current time, used for dates that are not stored on a node.
 * @param {() => Array<{text: string, author: string}>} deps.getQuotes  Quotes for `fortune`.
 * @param {() => number} deps.random  Returns a number in [0, 1).
 * @param {() => string[]} deps.getHistory  Earlier commands, oldest first, for `history`.
 * @param {() => boolean} deps.isMatrix  True while the matrix theme is on (changes the secret note).
 * @param {{available: Function, isPlaying: Function, toggle: Function, next: Function, previous: Function} | null} deps.player
 *   Music player controls for play, pause, next and prev.
 */
export function createTerminal({
    getLists = () => undefined,
    now = () => new Date(),
    getQuotes = () => [],
    random = Math.random,
    getHistory = () => [],
    player = null,
    isMatrix = () => false,
    getPlaylists = () => [],
    getNotes = () => [],
    getTodos = () => [],
} = {}) {
    let cwd = [...HOME];
    inMatrix = isMatrix;
    const startedAt = now();

    const ok = (output) => ({ output, effect: null });
    const withEffect = (type, extra = {}) => ({ output: null, effect: { type, ...extra } });

    function displayPath(segs) {
        if (startsWithSegments(segs, HOME)) {
            const rest = segs.slice(HOME.length);
            return rest.length ? `${HOME_LABEL}/${rest.join('/')}` : HOME_LABEL;
        }
        return `/${segs.join('/')}`;
    }

    function prompt() {
        return `${PROMPT_USER}${displayPath(cwd)}$ `;
    }

    // Turns user input into an absolute list of path segments (no links followed yet).
    function normalize(input) {
        let base = cwd;
        let rest = input;
        if (input.startsWith('/')) {
            base = [];
        } else if (input === HOME_LABEL || input.startsWith(`${HOME_LABEL}/`)) {
            base = HOME;
            rest = input.slice(1);
        }
        const segs = [...base];
        for (const part of rest.split('/')) {
            if (part === '' || part === '.') continue;
            if (part === '..') segs.pop();
            else segs.push(part);
        }
        return segs;
    }

    function listEntries(folderId) {
        const app = getLists();
        if (!app) return [];
        const entries = folderId === null ? app.rootEntries?.() : app.entriesForFolder?.(folderId);
        return Array.isArray(entries) ? entries : [];
    }

    function visibleListEntries(folderId) {
        // Podcast episode names are left out of listings, as before.
        return listEntries(folderId).filter((entry) => entry.kind !== 'podcast');
    }

    // Walks label names inside the lists folder. `rest` starts just inside `folderId`.
    function listsWalk(folderId, rest, at) {
        if (!getLists()) return null;
        let id = folderId;
        let path = at;
        for (let i = 0; i < rest.length; i++) {
            const hit = listEntries(id).find((entry) => entry.label === rest[i]);
            if (!hit) return null;
            path = [...path, rest[i]];
            if (hit.kind !== 'folder') {
                if (i !== rest.length - 1) return null;
                return { node: { type: 'listfile', entry: hit }, at: path };
            }
            id = hit.id;
        }
        return { node: { type: 'listdir', folderId: id }, at: path };
    }

    // Resolves absolute segments to a node. Links are followed. Returns { node, at } or null.
    function lookup(segs, depth = 0) {
        if (depth > MAX_LINK_DEPTH) return null;
        let node = ROOT;
        let at = [];
        for (let i = 0; i < segs.length; i++) {
            if (node.type === 'link') {
                const hit = lookup(splitPath(node.target), depth + 1);
                if (!hit) return null;
                node = hit.node;
                at = hit.at;
            }
            if (node.type === 'listdir') return listsWalk(node.folderId, segs.slice(i), at);
            if (node.type !== 'dir') return null;
            if (!Object.hasOwn(node.children, segs[i])) return null;
            node = node.children[segs[i]];
            at = [...at, segs[i]];
        }
        if (node.type === 'link') return lookup(splitPath(node.target), depth + 1);
        return { node, at };
    }

    const isDirNode = (node) => node.type === 'dir' || node.type === 'listdir';

    function isDirEntry(node) {
        if (node.type !== 'link') return isDirNode(node);
        const hit = lookup(splitPath(node.target));
        return Boolean(hit && isDirNode(hit.node));
    }

    // Entries directly inside a directory-like node, sorted by name.
    function childrenOf(node) {
        if (node.type === 'dir') {
            return Object.keys(node.children)
                .sort()
                .map((name) => ({ name, node: node.children[name] }));
        }
        if (node.type === 'listdir') {
            return visibleListEntries(node.folderId).map((entry) => ({
                name: entry.label,
                node: entry.kind === 'folder'
                    ? { type: 'listdir', folderId: entry.id }
                    : { type: 'listfile', entry },
            }));
        }
        return [];
    }

    // Like childrenOf, but in matrix mode the home folder shows only .secrets.
    // ls, grep and tab completion all read through here.
    function visibleChildren(node, segs) {
        const entries = childrenOf(node);
        const isHome = segs.length === HOME.length && startsWithSegments(segs, HOME);
        if (!inMatrix() || !isHome) return entries;
        return entries.filter(({ name }) => name === '.secrets');
    }

    // Size, type and date for `ls -l`.
    function describe(node) {
        switch (node.type) {
            case 'dir':
                return { isDir: true, size: DIR_SIZE, mtime: node.mtime };
            case 'listdir':
                return { isDir: true, size: DIR_SIZE, mtime: now() };
            case 'link': {
                const hit = lookup(splitPath(node.target));
                return hit ? describe(hit.node) : { isDir: false, size: 0, mtime: FIXTURE_MTIME };
            }
            case 'file':
            case 'image':
                return { isDir: false, size: node.size, mtime: node.mtime };
            default:
                return { isDir: false, size: 0, mtime: now() };
        }
    }

    function treeOf(label, folderId) {
        const lines = [label];
        let dirs = 0;
        let files = 0;
        const walk = (id, prefix) => {
            const items = visibleListEntries(id);
            items.forEach((entry, i) => {
                const last = i === items.length - 1;
                lines.push(`${prefix}${last ? '└── ' : '├── '}${entry.label}`);
                if (entry.kind === 'folder') {
                    dirs++;
                    walk(entry.id, `${prefix}${last ? '    ' : '│   '}`);
                } else {
                    files++;
                }
            });
        };
        walk(folderId, '');
        lines.push('');
        lines.push(`${t('tree.dirs', { n: dirs })}, ${t('tree.files', { n: files })}`);
        return lines.join('\n');
    }

    function ls(args) {
        let long = false;
        const paths = [];
        for (const arg of args) {
            if (arg.startsWith('-') && arg.length > 1) {
                for (const flag of arg.slice(1)) {
                    if (flag === 'l') long = true;
                    else if (flag !== 'a') return ok(t('ls.invalidOption', { flag }));
                }
            } else {
                paths.push(arg);
            }
        }
        if (paths.length === 0) paths.push('.');

        const errors = [];
        const blocks = [];
        for (const path of paths) {
            const found = lookup(normalize(path));
            if (!found) {
                errors.push(t('ls.noAccess', { path }));
                continue;
            }
            const { node, at } = found;
            let body;
            if (node.type === 'listdir') {
                if (!getLists()) {
                    errors.push(t('ls.noLists', { path }));
                    continue;
                }
                body = treeOf(at.at(-1) ?? '/', node.folderId);
            } else if (isDirNode(node)) {
                const entries = visibleChildren(node, at);
                body = long
                    ? entries.map((e) => formatLong(e.name, describe(e.node))).join('\n')
                    : entries.map((e) => e.name).join('  ');
            } else {
                const name = at.at(-1) ?? path;
                body = long ? formatLong(name, describe(node)) : name;
            }
            blocks.push(paths.length > 1 ? `${path}:\n${body}` : body);
        }
        return ok([errors.join('\n'), blocks.join('\n\n')].filter(Boolean).join('\n'));
    }

    function cd(args) {
        if (args.length > 1) return ok(t('cd.tooMany'));
        if (args.length === 0) {
            cwd = [...HOME];
            return ok(null);
        }
        const target = args[0];
        const found = lookup(normalize(target));
        if (!found) return ok(t('cd.noSuch', { target }));
        if (!isDirNode(found.node)) return ok(t('cd.notDir', { target }));
        cwd = found.at;
        return ok(null);
    }

    function cat(args) {
        if (args.length === 0) return ok(t('cat.missing'));
        const outputs = args.map((path) => {
            const found = lookup(normalize(path));
            if (!found) return t('cat.noSuch', { path });
            const { node } = found;
            if (node.type === 'file') return node.content;
            if (node.type === 'image') return t('cat.binary', { path });
            if (isDirNode(node)) return t('cat.isDir', { path });
            return t('cat.noText', { path });
        });
        return ok(outputs.join('\n'));
    }

    function view(args) {
        if (args.length === 0) return ok(t('view.missing'));
        const name = args[0];
        let found = lookup(normalize(name));
        // A bare file name is looked up in the artwork folder too.
        if (!found && !name.includes('/')) found = lookup(['artwork', name]);
        if (!found) return ok(t('view.noFile', { name }));
        if (found.node.type !== 'image') return ok(t('view.notPicture', { name }));
        const fileName = found.at.at(-1);
        return withEffect('view', { src: `/pages/artwork/${fileName}` });
    }

    function openApp(args) {
        const target = (args[0] || '').toLowerCase();
        if (!target) return ok(t('open.missing'));
        if (target.startsWith('lists/')) {
            return withEffect('open', { app: 'lists', folder: target.slice('lists/'.length) });
        }
        if (!APP_TARGETS.includes(target)) return ok(t('open.unknown', { target }));
        return withEffect('open', { app: target });
    }

    // `enter` is a matrix-mode-only command: outside matrix mode it does not exist.
    function enter() {
        if (!inMatrix()) return ok(t('notFound', { name: 'enter' }));
        return withEffect('url', { href: NULLSTAR_URL });
    }

    function fortune() {
        const quotes = getQuotes();
        if (quotes.length === 0) return ok(t('fortune.none'));
        const quote = quotes[Math.floor(random() * quotes.length)];
        return ok(`"${quote.text}"\n  - ${quote.author}`);
    }

    function showHistory() {
        const entries = getHistory();
        if (entries.length === 0) return ok(null);
        return ok(entries.map((command, i) => `${String(i + 1).padStart(4)}  ${command}`).join('\n'));
    }

    function music(action) {
        return () => {
            if (!player || !player.available()) return ok(t('music.notLoaded'));
            const playing = player.isPlaying();
            if (action === 'play' && !playing) player.toggle();
            else if (action === 'pause' && playing) player.toggle();
            else if (action === 'next') player.next();
            else if (action === 'prev') player.previous();
            return ok(null);
        };
    }

    function countListItems() {
        // Match the lists folder badge: count entries directly inside each root folder.
        return listEntries(null)
            .reduce((total, entry) => total + (entry.kind === 'folder' ? visibleListEntries(entry.id).length : 0), 0);
    }

    function neofetch() {
        const seconds = Math.floor((now() - startedAt) / 1000);
        const uptime = seconds < 60
            ? t('uptime.seconds', { s: seconds })
            : t('uptime.minutes', { m: Math.floor(seconds / 60), s: seconds % 60 });
        // Counts only playlists that have songs, across all mixtapes.
        const playlistCount = getPlaylists().filter((p) => Array.isArray(p.songs) && p.songs.length > 0).length;
        const art = [
            '0  1  0  1  0  1  0  1  0  1  0  1  0  1  0',
            '  1   ██████╗ ███████╗     ██╗ ██████╗      1',
            '  0   ╚════██╗╚════██║    ███║ ╚════██╗     0',
            '  1    █████╔╝    ██╔╝    ╚██║  █████╔╝     1',
            '  0    ╚═══██╗   ██╔╝      ██║  ╚═══██╗     0',
            '  1   ██████╔╝   ██║   ██╗ ██║ ██████╔╝     1',
            '  0   ╚═════╝    ╚═╝   ╚═╝ ╚═╝ ╚═════╝      0',
            '  1  0  1  0  1  0  1  0  1  0  1  0  1  0  1',
            '  0  |  1  0  |  1  |  0  1  |  0  |  1  0  |',
            '  1  |  0  |  1  |  0  |  1  |  1  0  |  1  |',
            '  |  0  |  1  |  0  |  1  |  0  |  1  |  0  |',
            '  0     |     0     |     1     0     |     0',
            '        0           1           |           1',
        ];
        const artWidth = Math.max(...art.map((line) => line.length));
        const border = `+${'-'.repeat(artWidth + 2)}+`;
        const banner = [border, ...art.map((line) => `| ${line.padEnd(artWidth)} |`), border];
        const info = [
            inMatrix() ? t('neo.os') : t('neo.os.pink'),
            t('neo.uptime', { uptime }),
            t('neo.artwork', { count: Object.keys(ROOT.children.artwork.children).length }),
            t('neo.quotes', { count: getQuotes().length }),
            t('neo.notes', { count: getNotes().length }),
            t('neo.lists', { count: countListItems(null) }),
            t('neo.playlists', { count: playlistCount }),
            t('neo.todos', { count: getTodos().length }),
        ];
        const labelWidth = (label) => Array.from(label).reduce((width, char) => {
            const code = char.codePointAt(0);
            return width + (code >= 0x1100 && (
                code <= 0x115f || code === 0x2329 || code === 0x232a ||
                (code >= 0x2e80 && code <= 0xa4cf) ||
                (code >= 0xac00 && code <= 0xd7a3) ||
                (code >= 0xf900 && code <= 0xfaff) ||
                (code >= 0xfe10 && code <= 0xfe19) ||
                (code >= 0xfe30 && code <= 0xfe6f) ||
                (code >= 0xff00 && code <= 0xff60) ||
                (code >= 0xffe0 && code <= 0xffe6) ||
                (code >= 0x20000 && code <= 0x3fffd)
            ) ? 2 : 1);
        }, 0);
        const rows = info.map((line) => {
            const colon = line.indexOf(':');
            return colon < 0 ? { line } : { label: line.slice(0, colon + 1), value: line.slice(colon + 1).trimStart() };
        });
        const maxLabelWidth = Math.max(...rows.filter((row) => row.label).map((row) => labelWidth(row.label)));
        const alignedInfo = rows.map((row) => row.label
            ? `${row.label}${' '.repeat(maxLabelWidth - labelWidth(row.label) + 2)}${row.value}`
            : row.line);
        const output = [...banner, '', ...alignedInfo].join('\n');
        return { output, effect: { type: 'clear' } };
    }

    function grep(args) {
        let ignoreCase = false;
        const rest = [];
        for (const arg of args) {
            if (arg === '-i') ignoreCase = true;
            else if (arg.startsWith('-') && arg.length > 1) return ok(t('grep.invalidOption', { flag: arg.slice(1) }));
            else rest.push(arg);
        }
        if (rest.length === 0) return ok(t('grep.missingPattern'));
        const [pattern, path = '.'] = rest;
        const found = lookup(normalize(path));
        if (!found) return ok(t('grep.noSuch', { path }));

        const needle = ignoreCase ? pattern.toLowerCase() : pattern;
        const matches = (text) => (ignoreCase ? text.toLowerCase() : text).includes(needle);
        const hits = [];
        // Symbolic links are matched by name only, so a link back to /artwork is not searched twice.
        const walk = (node, segs) => {
            if (segs.length && matches(segs.at(-1))) hits.push(displayPath(segs));
            if (node.type === 'file') {
                node.content.split('\n').forEach((line) => {
                    if (matches(line)) hits.push(`${displayPath(segs)}:${line}`);
                });
                return;
            }
            for (const { name, node: child } of visibleChildren(node, segs)) {
                if (child.type === 'link') {
                    if (matches(name)) hits.push(displayPath([...segs, name]));
                    continue;
                }
                walk(child, [...segs, name]);
            }
        };
        walk(found.node, found.at);
        return ok(hits.length ? hits.join('\n') : null);
    }

    const COMMANDS = new Map([
        ['help', () => ok(t('help'))],
        ['fortune', fortune],
        ['grep', grep],
        ['history', showHistory],
        ['neofetch', neofetch],
        ['open', openApp],
        ['play', music('play')],
        ['pause', music('pause')],
        ['next', music('next')],
        ['prev', music('prev')],
        ['matrix', () => withEffect('matrix')],
        ['enter', enter],
        ['sudo', () => ok(t('sudo'))],
        ['ls', ls],
        ['pwd', () => ok(displayPath(cwd))],
        ['cd', cd],
        ['cat', cat],
        ['echo', (args) => ok(args.join(' '))],
        ['clear', () => withEffect('clear')],
        ['date', () => ok(terminalLocale() === 'ja' ? now().toLocaleString('ja-JP') : now().toString())],
        ['view', view],
        ['exit', () => withEffect('exit')],
    ]);

    /**
     * Runs one line. Returns { output, effect }.
     * output is text to print, or null for none.
     * effect is null, or { type: 'clear' | 'exit' | 'view' | 'url', src?, href? } for the UI to act on.
     */
    function execute(line) {
        let tokens;
        try {
            tokens = tokenize(line.trim());
        } catch (error) {
            return ok(t('error', { message: error.message }));
        }
        if (tokens.length === 0) return ok(null);
        const [name, ...args] = tokens;
        const command = COMMANDS.get(name.toLowerCase());
        if (!command) return ok(t('notFound', { name: name.toLowerCase() }));
        return command(args);
    }

    /**
     * Completion for the word at the end of `line`.
     * Returns { raw, matches }: raw is the text being completed, matches are full replacements for it.
     */
    function complete(line) {
        const raw = line.match(/\S*$/)[0];
        const before = line.slice(0, line.length - raw.length);
        if (before.trim() === '') {
            const names = inMatrix() ? [...COMMAND_NAMES, ...MATRIX_COMMAND_NAMES] : COMMAND_NAMES;
            return { raw, matches: names.filter((name) => name.startsWith(raw)).sort() };
        }
        const partial = raw.replace(/^["']/, '');
        const slash = partial.lastIndexOf('/');
        const dirPart = partial.slice(0, slash + 1);
        const base = partial.slice(slash + 1);
        const found = dirPart === '' ? lookup(cwd) : lookup(normalize(dirPart));
        if (!found) return { raw, matches: [] };
        const matches = visibleChildren(found.node, found.at)
            .filter(({ name }) => name.startsWith(base))
            .map(({ name, node }) => `${dirPart}${quoteIfNeeded(name)}${isDirEntry(node) ? '/' : ''}`);
        return { raw, matches };
    }

    return { execute, complete, prompt, commonPrefix };
}
