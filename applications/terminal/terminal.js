// Terminal functionality for index.html. Shell logic lives in terminal-core.js.

import { createTerminal } from './terminal-core.js';
import { createPictureViewer } from './terminal-picture.js';
import { openApp } from '../../core/app-catalog.js';
import { toggleMatrixTheme } from '../../core/matrix-theme.js';
import { readStorage, writeStorage } from '../../core/storage.js';
import { t } from './terminal-text.js';

(function() {
    const HISTORY_KEY = 'terminal-history';
    const HISTORY_LIMIT = 100;

    function loadHistory() {
        try {
            const saved = JSON.parse(readStorage(HISTORY_KEY) || '[]');
            return Array.isArray(saved) ? saved.filter((item) => typeof item === 'string').slice(-HISTORY_LIMIT) : [];
        } catch {
            return [];
        }
    }

    // Unavailable storage (private mode, blocked site data) means history lasts for this page only.
    function saveHistory(history) {
        writeStorage(HISTORY_KEY, JSON.stringify(history));
    }

    // Playlists of every mixtape (soundtrack), read the same way the music player loads them.
    const MIXTAPE_IDS = ['2026', '2027', '2028'];
    function allMixtapePlaylists() {
        const player = window.MusicPlayer;
        if (!player?.storageFor) return [];
        return MIXTAPE_IDS.flatMap((id) => {
            try {
                return player.storageFor(id).load().playlists ?? [];
            } catch {
                return [];
            }
        });
    }

    function initTerminal() {
        const terminal = document.getElementById('main-terminal');
        const terminalOutput = document.getElementById('terminal-output-container');
        const terminalInput = document.getElementById('terminal-input-main');

        if (!terminal || !terminalOutput || !terminalInput) {
            return;
        }

        const commandHistory = loadHistory();
        let historyIndex = commandHistory.length;

        const musicPlayer = {
            available: () => Boolean(window.MusicPlayer),
            isPlaying: () => Boolean(document.getElementById('music-player')?.classList.contains('playing')),
            toggle: () => window.MusicPlayer?.togglePlayPause(),
            next: () => window.MusicPlayer?.playNextSong(true),
            previous: () => window.MusicPlayer?.playPreviousSong(true),
        };

        const shellOptions = {
            getLists: () => window.ListsFolderApp,
            now: () => new Date(),
            getQuotes: () => window.QUOTES || [],
            random: Math.random,
            getHistory: () => commandHistory,
            player: musicPlayer,
            isMatrix: () => Boolean(window.MatrixTheme?.isMatrixTheme()),
            getPlaylists: allMixtapePlaylists,
            getNotes: () => window.NotesApp?.entries ?? [],
            getTodos: () => window.TodoApp?.todos ?? [],
        };
        const shell = createTerminal(shellOptions);
        const makeShell = () => createTerminal(shellOptions);

        terminalInput.focus();

        // Helper functions
        function getMaxZIndex() {
            const allWindows = document.querySelectorAll('.window');
            let maxZIndex = 100;
            allWindows.forEach(w => {
                const z = parseInt(getComputedStyle(w).zIndex) || 100;
                if (z > maxZIndex) maxZIndex = z;
            });
            return maxZIndex;
        }

        function getScrollContainer() {
            return terminal.closest('.window-content') || terminal;
        }

        function scrollToBottom() {
            setTimeout(() => {
                getScrollContainer().scrollTop = getScrollContainer().scrollHeight;
            }, 0);
        }

        // Everything printed so far, kept so the screen can be drawn again in the other language.
        // `clear` only moves visibleFrom: the lines stay in the log so commands can be replayed in order.
        // Entries: {type: 'prompt', prompt, command, run}, {type: 'output', text, derived}, {type: 'message', key, fallback}.
        // A derived output is what a command printed; it is produced again by the replay, so it is not kept.
        const transcript = [];
        let visibleFrom = 0;

        function messageText(entry) {
            return window.I18n ? window.I18n.t(entry.key) : entry.fallback;
        }

        function renderEntry(entry) {
            if (entry.type === 'prompt') {
                const commandLine = document.createElement('div');
                commandLine.className = 'terminal-line';
                const promptSpan = document.createElement('span');
                promptSpan.className = 'prompt';
                promptSpan.textContent = entry.prompt;
                const commandSpan = document.createElement('span');
                commandSpan.className = 'command';
                commandSpan.textContent = entry.command;
                commandLine.append(promptSpan, commandSpan);
                return commandLine;
            }
            const text = entry.type === 'message' ? messageText(entry) : entry.text;
            const output = document.createElement('div');
            output.className = 'terminal-output';
            // The page is lowercase by CSS; the brand name keeps its capitals in its own span.
            String(text).split(/(NULLSTAR)/).forEach((part) => {
                if (!part) return;
                if (part === 'NULLSTAR') {
                    const brand = document.createElement('span');
                    brand.className = 'brand-caps';
                    brand.textContent = part;
                    output.appendChild(brand);
                } else {
                    output.appendChild(document.createTextNode(part));
                }
            });
            return output;
        }

        function record(entry) {
            transcript.push(entry);
            terminalOutput.appendChild(renderEntry(entry));
        }

        function appendOutput(text, derived = false) {
            record({ type: 'output', text, derived });
        }

        function appendMessage(key, fallback) {
            record({ type: 'message', key, fallback });
        }

        function appendPromptLine(command, run = false) {
            record({ type: 'prompt', prompt: shell.prompt(), command, run });
        }

        // Draws the visible part of the transcript again, with each message in the current language.
        function redraw() {
            terminalOutput.innerHTML = '';
            transcript.slice(visibleFrom).forEach((entry) => terminalOutput.appendChild(renderEntry(entry)));
        }

        // Runs every typed command again on a fresh shell, so the printed results follow the current language.
        // The replay also brings the folder back to where it was, even across a `clear`.
        function rebuildTranscript() {
            const replay = makeShell();
            const rebuilt = [];
            let nextVisibleFrom = null;
            transcript.forEach((entry, index) => {
                if (index === visibleFrom) nextVisibleFrom = rebuilt.length;
                if (entry.type === 'output' && entry.derived) return;
                rebuilt.push(entry);
                if (entry.type === 'prompt' && entry.run) {
                    const { output } = replay.execute(entry.command);
                    if (output !== null && output !== undefined) {
                        rebuilt.push({ type: 'output', text: output, derived: true });
                    }
                }
            });
            transcript.splice(0, transcript.length, ...rebuilt);
            visibleFrom = nextVisibleFrom ?? rebuilt.length;
            redraw();
            scrollToBottom();
        }

        document.addEventListener('localechange', () => {
            rebuildTranscript();
            // The context menu is built once; drop it so the next open builds it in the new language.
            contextMenu?.remove();
            contextMenu = null;
        });

        function updateInputPrompt() {
            const terminalLine = terminalInput.closest('.terminal-line');
            if (terminalLine) {
                const prompt = terminalLine.querySelector('.prompt');
                if (prompt) {
                    prompt.textContent = shell.prompt();
                }
            } else {
                const promptElement = terminalInput.previousElementSibling;
                if (promptElement && promptElement.classList.contains('prompt')) {
                    promptElement.textContent = shell.prompt();
                }
            }
        }

        const pictures = createPictureViewer({
            onMissing: (imagePath) => {
                appendOutput(`error: file does not exist: ${imagePath}`);
                scrollToBottom();
            },
        });

        function clearOutput() {
            visibleFrom = transcript.length;
            terminalOutput.innerHTML = '';
        }

        function closeWindow() {
            const terminalWindow = terminal.closest('.window');
            if (!terminalWindow) return;
            window.TerminalApp?.writeOpenState(false);

            const dockItem = document.getElementById('terminal-dock-item');
            if (window.WindowManager) {
                window.WindowManager.close(terminalWindow, dockItem);
            } else {
                terminalWindow.style.display = 'none';
                if (dockItem) dockItem.classList.remove('active');
            }
        }

        function pushHistory(command) {
            if (commandHistory[commandHistory.length - 1] !== command) {
                commandHistory.push(command);
                if (commandHistory.length > HISTORY_LIMIT) {
                    commandHistory.splice(0, commandHistory.length - HISTORY_LIMIT);
                }
                saveHistory(commandHistory);
            }
            historyIndex = commandHistory.length;
        }

        function openAppFromTerminal({ app, folder }) {
            if (!openApp(app, folder)) {
                appendOutput(`open: ${app} is not loaded`);
            }
        }

        function runCommand(input) {
            const trimmed = input.trim();
            if (!trimmed) return;

            pushHistory(trimmed);
            appendPromptLine(trimmed, true);

            const { output, effect } = shell.execute(trimmed);
            if (effect && effect.type === 'clear') {
                clearOutput();
                if (output !== null && output !== undefined) appendOutput(output, true);
            } else if (effect && effect.type === 'exit') {
                closeWindow();
            } else if (effect && effect.type === 'view') {
                pictures.open(effect.src);
            } else if (effect && effect.type === 'open') {
                openAppFromTerminal(effect);
            } else if (effect && effect.type === 'url') {
                window.open(effect.href, '_blank', 'noopener,noreferrer');
            } else if (effect && effect.type === 'matrix') {
                clearOutput();
                if (toggleMatrixTheme()) {
                    appendMessage('terminal.matrixOn', 'wake up, anon... NULLSTAR has you.');
                } else {
                    appendMessage('terminal.matrixOff', 'back to the simulation.');
                }
            } else if (output !== null && output !== undefined) {
                appendOutput(output, true);
            }

            updateInputPrompt();
            scrollToBottom();
        }

        function cancelLine() {
            appendPromptLine(`${terminalInput.value}^C`);
            terminalInput.value = '';
            historyIndex = commandHistory.length;
            scrollToBottom();
        }

        function completeInput() {
            const value = terminalInput.value;
            const { raw, matches } = shell.complete(value);
            if (matches.length === 0) return;

            const head = value.slice(0, value.length - raw.length);
            if (matches.length === 1) {
                const [match] = matches;
                terminalInput.value = head + match + (match.endsWith('/') ? '' : ' ');
                return;
            }

            const shared = shell.commonPrefix(matches);
            if (shared.length > raw.length) {
                terminalInput.value = head + shared;
                return;
            }

            appendPromptLine(value);
            appendOutput(matches.join('  '));
            scrollToBottom();
        }

        terminalInput.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (e.ctrlKey && key === 'l') {
                e.preventDefault();
                clearOutput();
            } else if (e.ctrlKey && key === 'c') {
                e.preventDefault();
                cancelLine();
            } else if (e.key === 'Enter') {
                const command = terminalInput.value;
                runCommand(command);
                terminalInput.value = '';
                historyIndex = commandHistory.length;
            } else if (e.key === 'Tab') {
                e.preventDefault();
                completeInput();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    terminalInput.value = commandHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    terminalInput.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    terminalInput.value = '';
                }
            }
        });

        // Phones: keep the input visible when the on-screen keyboard opens, and offer the keys a keyboard would.
        terminalInput.setAttribute('autocapitalize', 'off');
        terminalInput.setAttribute('autocorrect', 'off');
        terminalInput.enterKeyHint = 'go';
        terminalInput.addEventListener('focus', () => {
            setTimeout(() => terminalInput.scrollIntoView?.({ block: 'nearest' }), 300);
        });
        if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
            const bar = document.createElement('div');
            bar.className = 'terminal-touch-bar';
            bar.setAttribute('role', 'toolbar');
            bar.setAttribute('aria-label', t('keys.bar'));
            const keys = [
                ['tab', 'keys.complete', { key: 'Tab' }],
                ['↑', 'keys.previous', { key: 'ArrowUp' }],
                ['↓', 'keys.next', { key: 'ArrowDown' }],
                ['^C', 'keys.cancel', { key: 'c', ctrlKey: true }],
                ['^L', 'keys.clear', { key: 'l', ctrlKey: true }],
            ];
            const labelledButtons = [];
            for (const [label, nameKey, init] of keys) {
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = label;
                button.setAttribute('aria-label', t(nameKey));
                labelledButtons.push([button, nameKey]);
                // Keep focus in the input, so the on-screen keyboard stays open.
                button.addEventListener('pointerdown', (e) => e.preventDefault());
                button.addEventListener('click', () => {
                    terminalInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }));
                    terminalInput.focus();
                });
                bar.appendChild(button);
            }
            document.addEventListener('localechange', () => {
                bar.setAttribute('aria-label', t('keys.bar'));
                labelledButtons.forEach(([button, nameKey]) => button.setAttribute('aria-label', t(nameKey)));
            });
            terminal.insertAdjacentElement('afterend', bar);
        }

        terminal.addEventListener('click', (e) => {
            if (!e.target.closest('a') && !e.target.closest('button')) {
                terminalInput.focus();
            }

            const terminalWindow = terminal.closest('.window');
            if (terminalWindow && typeof window.bringToFront === 'function') {
                window.bringToFront(terminalWindow);
            } else if (terminalWindow) {
                terminalWindow.style.zIndex = getMaxZIndex() + 1;
            }
        });

        let contextMenu = null;

        function createContextMenu() {
            if (contextMenu) return contextMenu;

            contextMenu = document.createElement('div');
            contextMenu.className = 'terminal-context-menu';
            contextMenu.style.display = 'none';

            const viewGroup = document.createElement('div');
            viewGroup.className = 'context-menu-group';

            const viewLabel = document.createElement('div');
            viewLabel.className = 'context-menu-label';
            viewLabel.textContent = t('context.view');
            viewGroup.appendChild(viewLabel);

            const openPictureItem = document.createElement('div');
            openPictureItem.className = 'context-menu-item';
            openPictureItem.innerHTML = `<span class="context-menu-item-text">${t('context.openPicture')}</span>`;
            openPictureItem.addEventListener('click', () => {
                // Fill in the view command so the user types only the file name.
                terminalInput.value = 'view ';
                terminalInput.focus();
                hideContextMenu();
            });
            viewGroup.appendChild(openPictureItem);

            contextMenu.appendChild(viewGroup);
            document.body.appendChild(contextMenu);

            return contextMenu;
        }

        function showContextMenu(e) {
            e.preventDefault();
            const menu = createContextMenu();
            menu.style.display = 'block';
            menu.style.left = e.pageX + 'px';
            menu.style.top = e.pageY + 'px';
            menu.style.zIndex = getMaxZIndex() + 10;
        }

        function hideContextMenu() {
            if (contextMenu) {
                contextMenu.style.display = 'none';
            }
        }

        terminal.addEventListener('contextmenu', showContextMenu);

        document.addEventListener('click', (e) => {
            if (contextMenu && !contextMenu.contains(e.target)) {
                hideContextMenu();
            }
        });

        updateInputPrompt();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTerminal);
    } else {
        initTerminal();
    }
})();
