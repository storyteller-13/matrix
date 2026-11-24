/**
 * terminal-core – the DOM-free shell: tokenizing, paths, ls/cd/cat/view, lists, completion.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTerminal, tokenize } from '../applications/terminal/terminal-core.js';

const lists = {
    rootEntries: () => [
        { id: 'books', label: 'books', kind: 'folder' },
        { id: 'podcast-folder', label: 'my guides', kind: 'folder' },
        { id: 'pod', label: 'episode one', kind: 'podcast' },
    ],
    entriesForFolder: (id) => ({
        books: [{ id: 'b1', label: 'book one', kind: 'list' }],
        'podcast-folder': [{ id: 'g1', label: 'guide one', kind: 'list' }],
    })[id] || [],
};

describe('tokenize', () => {
    it('splits on whitespace and keeps quoted spans together', () => {
        expect(tokenize('echo  "a   b"  c')).toEqual(['echo', 'a   b', 'c']);
        expect(tokenize("cat 'my file'")).toEqual(['cat', 'my file']);
        expect(tokenize('echo ""')).toEqual(['echo', '']);
    });

    it('throws on an unclosed quote', () => {
        expect(() => tokenize('echo "oops')).toThrow(/unexpected EOF/);
    });
});

describe('createTerminal', () => {
    let shell;
    let run;

    beforeEach(() => {
        window.ListsFolderApp = lists;
        shell = createTerminal({ getLists: () => window.ListsFolderApp, now: () => new Date(2026, 10, 18, 9, 5) });
        run = (line) => shell.execute(line);
    });

    afterEach(() => {
        delete window.ListsFolderApp;
    });

    it('starts at home and shows it as ~', () => {
        expect(shell.prompt()).toBe('anon@nullstar:~$ ');
        expect(run('pwd').output).toBe('~');
    });

    it('cd .. goes to the parent directory, not always home', () => {
        run('cd /etc');
        expect(run('cd ..').output).toBeNull();
        expect(run('pwd').output).toBe('/');
        run('cd ~/lists/books');
        run('cd ..');
        expect(run('pwd').output).toBe('~/lists');
    });

    it('cd to a file reports that it is not a directory', () => {
        expect(run('cd .secrets').output).toBe('cd: not a directory: .secrets');
    });

    it('cd can enter the lists folder and its sub-folders by label', () => {
        run('cd lists');
        expect(run('pwd').output).toBe('~/lists');
        run('cd "my guides"');
        expect(run('pwd').output).toBe('~/lists/my guides');
        expect(run('ls').output).toContain('└── guide one');
    });

    it('ls supports combined flags and reports bad options', () => {
        expect(run('ls -al').output).toContain('drwxr-xr-x');
        expect(run('ls -l /artwork').output.split('\n')[0]).toMatch(/^-rw-r--r--\s+1 anon anon/);
        expect(run('ls -x').output).toBe("ls: invalid option -- 'x'");
    });

    it('ls -l dates come from the node and the lists fallback, not one fixed string', () => {
        const longHome = run('ls -l').output.split('\n');
        expect(longHome.find((l) => l.endsWith(' lists'))).toMatch(/Nov 18 09:05/);
        expect(run('ls -l /etc/os-release').output).toMatch(/Dec 15 14:30 os-release/);
    });

    it('ls on a file prints that file', () => {
        expect(run('ls .secrets').output).toBe('.secrets');
    });

    it('ls with several paths labels each block', () => {
        expect(run('ls /etc /bin').output).toBe('/etc:\nos-release\n\n/bin:\n');
    });

    it('echo keeps quoted spacing', () => {
        expect(run('echo "a   b"').output).toBe('a   b');
    });

    it('cat reads text, rejects directories, images and missing files', () => {
        expect(run('cat /etc/os-release').output).toContain('pretty_name');
        expect(run('cat /artwork').output).toBe('cat: /artwork: Is a directory');
        expect(run('cat /artwork/love.jpg').output).toBe('cat: /artwork/love.jpg: binary file, use view');
        expect(run('cat nope').output).toBe('cat: nope: No such file or directory');
    });

    it('view returns an effect for pictures, with bare names looked up in artwork', () => {
        expect(run('view love.jpg').effect).toEqual({ type: 'view', src: '/pages/artwork/love.jpg' });
        expect(run('view ~/artwork/lion.jpg').effect).toEqual({ type: 'view', src: '/pages/artwork/lion.jpg' });
        expect(run('view .secrets').output).toBe('view: .secrets: not a picture');
        expect(run('view nope.png').output).toBe('error: file does not exist: nope.png');
    });

    it('clear and exit return effects for the UI', () => {
        expect(run('clear').effect).toEqual({ type: 'clear' });
        expect(run('exit').effect).toEqual({ type: 'exit' });
    });

    it('names that exist on Object.prototype are unknown commands', () => {
        expect(run('constructor').output).toBe("command not found: constructor. type 'help' for available commands.");
        expect(run('toString').output).toMatch(/command not found: tostring/);
    });

    it('unclosed quotes report an error instead of running', () => {
        expect(run('echo "open').output).toMatch(/^error: unexpected EOF/);
    });

    it('tab completion lists commands, then paths, quoting names with spaces', () => {
        expect(shell.complete('ca')).toEqual({ raw: 'ca', matches: ['cat'] });
        expect(shell.complete('cat /et').matches).toEqual(['/etc/']);
        expect(shell.complete('ls ~/li').matches).toEqual(['~/lists/']);
        run('cd lists');
        expect(shell.complete('cd my').matches).toEqual(['"my guides"/']);
        expect(shell.complete('ls ').matches).toEqual(['books/', '"my guides"/']);
    });

    it('works without the lists app loaded', () => {
        delete window.ListsFolderApp;
        expect(run('ls lists').output).toBe("ls: cannot access 'lists': lists are not available");
        expect(run('cd lists').output).toBeNull();
    });
});

describe('fun commands', () => {
    const quotes = [{ text: 'first', author: 'a' }, { text: 'second', author: 'b' }];

    it('open returns an app effect, folder ids for lists, and errors for unknown names', () => {
        const shell = createTerminal();
        expect(shell.execute('open books').effect).toEqual({ type: 'open', app: 'books' });
        expect(shell.execute('OPEN lists/adventures').effect).toEqual({ type: 'open', app: 'lists', folder: 'adventures' });
        expect(shell.execute('open terminal').output).toBe('open: unknown app: terminal');
        expect(shell.execute('open').output).toMatch(/missing app name/);
    });

    it('fortune prints a quote chosen by the random source', () => {
        const shell = createTerminal({ getQuotes: () => quotes, random: () => 0.9 });
        expect(shell.execute('fortune').output).toBe('"second"\n  - b');
        expect(createTerminal().execute('fortune').output).toBe('fortune: no quotes available');
    });

    it('history lists earlier commands, numbered', () => {
        const shell = createTerminal({ getHistory: () => ['ls', 'cd /etc'] });
        expect(shell.execute('history').output).toBe('   1  ls\n   2  cd /etc');
        expect(createTerminal().execute('history').output).toBeNull();
    });

    it('play, pause, next and prev drive the music player only when it is needed', () => {
        const player = {
            available: () => true,
            playing: false,
            isPlaying() { return this.playing; },
            toggle: vi.fn(function toggle() { this.playing = !this.playing; }),
            next: vi.fn(),
            previous: vi.fn(),
        };
        const shell = createTerminal({ player });
        shell.execute('play');
        expect(player.toggle).toHaveBeenCalledTimes(1);
        shell.execute('play');
        expect(player.toggle).toHaveBeenCalledTimes(1);
        shell.execute('pause');
        expect(player.toggle).toHaveBeenCalledTimes(2);
        shell.execute('next');
        shell.execute('prev');
        expect(player.next).toHaveBeenCalledTimes(1);
        expect(player.previous).toHaveBeenCalledTimes(1);
        expect(createTerminal().execute('play').output).toBe('music: the player is not loaded');
    });

    it('neofetch summarises the site, with uptime from the start time', () => {
        let clock = new Date(2026, 0, 1, 12, 0, 0);
        const shell = createTerminal({ now: () => clock, getQuotes: () => quotes, getLists: () => undefined });
        clock = new Date(2026, 0, 1, 12, 2, 5);
        const text = shell.execute('neofetch').output;
        expect(text).toMatch(/^uptime:\s+2m 5s$/m);
        expect(text).toMatch(/^artwork:\s+4 pictures$/m);
        expect(text).toMatch(/^quotes:\s+2 thoughts$/m);
        const infoRows = text.split('\n').filter((line) => /^(?:os|uptime|artwork|quotes|notes|lists|mixtapes|todos):/.test(line));
        const valueColumns = infoRows.map((line) => line.indexOf(':') + line.match(/^.*?:\s+/)[0].split(':')[1].length);
        expect(new Set(valueColumns).size).toBe(1);
    });

    it('neofetch lists only playlists with songs, and counts notes and todos', () => {
        const shell = createTerminal({
            getQuotes: () => quotes,
            getPlaylists: () => [
                { name: 'full mix', songs: [{ id: 'a', title: 'a' }, { id: 'b', title: 'b' }] },
                { name: 'empty one', songs: [] },
            ],
            getNotes: () => [{ id: 1 }, { id: 2 }, { id: 3 }],
            getTodos: () => [{ completed: true }, { completed: false }],
        });
        const text = shell.execute('neofetch').output;
        expect(text).toMatch(/^mixtapes:\s+1 moods$/m);
        expect(text).not.toContain('full mix');
        expect(text).not.toContain('empty one');
        expect(text).toMatch(/^notes:\s+3 entries$/m);
        expect(text).toMatch(/^todos:\s+2 items$/m);
        expect(text).toMatch(/^lists:\s+\d+ entries$/m);
        expect(text).not.toContain('anon@nullstar');
    });

    it('sudo refuses politely', () => {
        expect(createTerminal().execute('sudo rm -rf /').output)
            .toBe('anon is not in the sudoers file. this incident will be reported.');
    });

    it('in matrix mode the home folder lists only .secrets', () => {
        const shell = createTerminal({ isMatrix: () => true, getLists: () => lists });
        expect(shell.execute('ls').output).toBe('.secrets');
        expect(shell.execute('ls -l').output).toMatch(/ \.secrets$/);
        expect(shell.execute('ls ~').output).toBe('.secrets');
        expect(shell.execute('grep friend ~').output).toBe('~/.secrets:the future is about friendship.');
        expect(shell.execute('grep love ~').output).toBeNull();
        expect(shell.execute('ls /artwork').output).toContain('love.jpg');
    });

    it('outside matrix mode the home folder lists everything', () => {
        const shell = createTerminal({ getLists: () => lists });
        expect(shell.execute('ls').output).toBe('.secrets  artwork  lists');
    });

    it('matrix returns the matrix effect', () => {
        expect(createTerminal().execute('matrix').effect).toEqual({ type: 'matrix' });
    });

    it('enter opens nullstar.games in matrix mode only', () => {
        const matrixShell = createTerminal({ isMatrix: () => true });
        expect(matrixShell.execute('enter')).toEqual({
            output: null,
            effect: { type: 'url', href: 'https://nullstar.games/' },
        });
        expect(createTerminal().execute('enter')).toEqual({
            output: "command not found: enter. type 'help' for available commands.",
            effect: null,
        });
    });

    it('tab completion offers enter only in matrix mode', () => {
        expect(createTerminal({ isMatrix: () => true }).complete('en').matches).toEqual(['enter']);
        expect(createTerminal().complete('en').matches).toEqual([]);
    });

    it('grep searches file text and names, case-sensitive unless -i', () => {
        const shell = createTerminal();
        expect(shell.execute('grep love ~').output).toBe("~/.secrets:let's be in love with life");
        expect(shell.execute('grep LOVE ~').output).toBeNull();
        expect(shell.execute('grep -i LOVE ~').output).toBe("~/.secrets:let's be in love with life");
        expect(shell.execute('grep love /artwork').output).toBe('/artwork/love.jpg');
        expect(shell.execute('grep -z x').output).toBe("grep: invalid option -- 'z'");
        expect(shell.execute('grep').output).toBe('grep: missing pattern');
        expect(shell.execute('grep x /nope').output).toBe('grep: /nope: No such file or directory');
    });

    it('grep searches list titles without following links back to artwork', () => {
        window.ListsFolderApp = {
            rootEntries: () => [{ id: 'books', label: 'books', kind: 'folder' }],
            entriesForFolder: () => [{ id: 'b1', label: 'book one', kind: 'list' }],
        };
        const shell = createTerminal({ getLists: () => window.ListsFolderApp });
        expect(shell.execute('grep book ~/lists').output).toBe('~/lists/books\n~/lists/books/book one');
        delete window.ListsFolderApp;
    });

    it('completion offers the new commands', () => {
        expect(createTerminal().complete('ne').matches).toEqual(['neofetch', 'next']);
        expect(createTerminal().complete('pa').matches).toEqual(['pause']);
    });
});
