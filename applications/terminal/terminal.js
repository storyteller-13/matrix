// Terminal functionality for index.html
(function() {
    // Constants
    const HOME_DIR = '~';
    const PROMPT_PREFIX = 'anon@nullstar:';
    const MODAL_ID = 'terminal-image-modal';
    const HOME_ALLOWED_ENTRIES = ['.secrets', 'artwork'];
    const LS_DETAILED_DATE = 'Dec 15 14:30';
    const LS_DETAILED_USER = 'anon';
    const LS_DIR_PERMS = 'drwxr-xr-x';
    const LS_FILE_PERMS = '-rw-r--r--';
    const LS_DIR_SIZE = '4096';
    const LS_FILE_SIZE = '220';

    function initTerminal() {
        const terminal = document.getElementById('main-terminal');
        const terminalOutput = document.getElementById('terminal-output-container');
        const terminalInput = document.getElementById('terminal-input-main');

        if (!terminal || !terminalOutput || !terminalInput) {
            return;
        }

        let commandHistory = [];
        let historyIndex = -1;
        let currentDirectory = HOME_DIR;

        const fileSystem = {
            '~': {
                '.secrets': "i think i am ascending...",
                'artwork': 'directory'
            },
            '/': {
                'bin': 'directory',
                'etc': 'directory',
                'home': 'directory',
                'usr': 'directory',
                'artwork': 'directory'
            },
            '/etc': {
                'os-release': 'name="nullstar"\nversion="2024.12"\nid=nullstar\npretty_name="nullstar 2024.12"\nansi_color="0;34"'
            },
            '/artwork': {
                'you_met_me_at_a_very_strange_time_in_my_life.png': 'file',
                'cypherpunk.png': 'file',
                'denver.jpg': 'file',
                'friday_love.jpg': 'file',
                'freeee.png': 'file',
                'perfect.png': 'file',
                'princess.png': 'file',
                'the_game_and_the_player.png': 'file',
                'new_pet.webp': 'file',
                'august_83.png': 'file',
                'life.png': 'file',
                'vai_brasil.png': 'file',
            }
        };

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

        function resolveDirectoryPath(path) {
            if (!path) return null;

            let dirPath = path.endsWith('/') ? path.slice(0, -1) : path;

            if (dirPath === 'artwork') {
                return '/artwork';
            }

            if (dirPath.startsWith('/')) {
                return dirPath;
            }

            const currentDir = currentDirectory === HOME_DIR ? HOME_DIR : currentDirectory;
            const files = fileSystem[currentDir] || {};
            if (files[dirPath] === 'directory') {
                return currentDir === HOME_DIR ? '/' + dirPath : currentDir + '/' + dirPath;
            }

            return null;
        }

        function resolveFilePath(filepath) {
            if (filepath.startsWith('/')) {
                const parts = filepath.split('/').filter(p => p);
                const filename = parts.pop();
                const dir = '/' + (parts.length > 0 ? parts.join('/') : '');
                return { dir, filename };
            }
            if (filepath.startsWith('~/')) {
                const parts = filepath.split('/').filter(p => p);
                const filename = parts.pop();
                return { dir: HOME_DIR, filename };
            }
            return {
                dir: currentDirectory === HOME_DIR ? HOME_DIR : currentDirectory,
                filename: filepath
            };
        }

        function formatLsEntry(name, isDir) {
            const perms = isDir ? LS_DIR_PERMS : LS_FILE_PERMS;
            const size = isDir ? LS_DIR_SIZE : LS_FILE_SIZE;
            return `${perms}  1 ${LS_DETAILED_USER} ${LS_DETAILED_USER}  ${size} ${LS_DETAILED_DATE} ${name}`;
        }

        function formatLsOutput(entries, files, useDetailed) {
            if (useDetailed) {
                return entries.map(name => {
                    const isDir = files[name] === 'directory';
                    return formatLsEntry(name, isDir);
                }).join('\n');
            }
            return entries.join('  ');
        }

        function updateInputPrompt() {
            const terminalLine = terminalInput.closest('.terminal-line');
            if (terminalLine) {
                const prompt = terminalLine.querySelector('.prompt');
                if (prompt) {
                    prompt.textContent = `${PROMPT_PREFIX}${currentDirectory}$ `;
                }
            } else {
                const promptElement = terminalInput.previousElementSibling;
                if (promptElement && promptElement.classList.contains('prompt')) {
                    promptElement.textContent = `${PROMPT_PREFIX}${currentDirectory}$ `;
                }
            }
        }

        function createImageModal() {
            let modal = document.getElementById(MODAL_ID);
            if (modal) return modal;

            modal = document.createElement('div');
            modal.id = MODAL_ID;
            Object.assign(modal.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '10000',
                cursor: 'pointer',
                opacity: '0',
                transition: 'opacity 0.3s ease'
            });

            modal.addEventListener('click', closePicture);

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display !== 'none') {
                    closePicture();
                }
            });

            document.body.appendChild(modal);
            return modal;
        }

        function openPicture(imagePath) {
            const testImg = new Image();

            testImg.onerror = () => {
                const error = document.createElement('div');
                error.className = 'terminal-output';
                error.textContent = `error: file does not exist: ${imagePath}`;
                terminalOutput.appendChild(error);
                scrollToBottom();
            };

            testImg.onload = () => {
                if (window.ArtworkApp && typeof window.ArtworkApp.openImage === 'function') {
                    window.ArtworkApp.openImage(imagePath);
                    return;
                }

                const modal = createImageModal();
                let img = modal.querySelector('img');

                if (!img) {
                    img = document.createElement('img');
                    Object.assign(img.style, {
                        maxWidth: '90%',
                        maxHeight: '90%',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        boxShadow: '0 0 40px rgba(219, 20, 147, 0.5)',
                        cursor: 'default'
                    });
                    img.addEventListener('click', (e) => e.stopPropagation());
                    modal.appendChild(img);
                }

                img.src = imagePath;
                modal.style.display = 'flex';
                requestAnimationFrame(() => {
                    modal.style.opacity = '1';
                });
            };

            testImg.src = imagePath;
        }

        function closePicture() {
            const modal = document.getElementById(MODAL_ID);
            if (modal) {
                modal.style.opacity = '0';
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        }

        // Command implementations
        const commands = {
            help: () => {
                return `available commands:
  ls          - list directory contents
  pwd         - print working directory
  cd [dir]    - change directory
  cat [file]  - display file contents
  echo [text] - echo text
  clear       - clear terminal
  date        - display current date and time
  view [file] - open picture file
  help        - show this help message`;
            },

            ls: (args) => {
                const useDetailed = args && args.includes('-la');
                const dirArg = args && args.find(arg => !arg.startsWith('-'));
                const targetDir = dirArg ? resolveDirectoryPath(dirArg) : null;

                if (targetDir) {
                    if (fileSystem[targetDir]) {
                        const files = fileSystem[targetDir] || {};
                        const entries = Object.keys(files).sort();
                        return formatLsOutput(entries, files, useDetailed);
                    }
                    return `ls: cannot access '${dirArg}': no such file or directory`;
                }

                // List current directory
                if (currentDirectory === HOME_DIR) {
                    return formatLsOutput(HOME_ALLOWED_ENTRIES,
                        { '.secrets': 'file', 'artwork': 'directory' },
                        useDetailed);
                }

                const dirToShow = currentDirectory;
                if (fileSystem[dirToShow]) {
                    const files = fileSystem[dirToShow] || {};
                    const entries = Object.keys(files).sort();
                    return formatLsOutput(entries, files, useDetailed);
                }

                return '';
            },

            pwd: () => currentDirectory,

            cd: (args) => {
                if (!args || args.length === 0 || args[0] === HOME_DIR) {
                    currentDirectory = HOME_DIR;
                    updateInputPrompt();
                    return '';
                }

                const targetDir = args[0];
                if (targetDir === '..') {
                    currentDirectory = HOME_DIR;
                    updateInputPrompt();
                    return '';
                }

                const dir = currentDirectory === HOME_DIR ? HOME_DIR : currentDirectory;
                const files = fileSystem[dir] || {};

                if (files[targetDir] === 'directory' || fileSystem[targetDir] || fileSystem['/' + targetDir]) {
                    if (targetDir.startsWith('/')) {
                        currentDirectory = targetDir;
                    } else if (fileSystem['/' + targetDir]) {
                        currentDirectory = '/' + targetDir;
                    } else {
                        currentDirectory = targetDir;
                    }
                    updateInputPrompt();
                    return '';
                }

                return `cd: no such file or directory: ${targetDir}`;
            },

            cat: (args) => {
                if (!args || args.length === 0) {
                    return 'cat: missing file operand';
                }

                const { dir, filename } = resolveFilePath(args[0]);
                const files = fileSystem[dir] || {};

                // Handle home directory files
                if (dir === HOME_DIR && filename === '.secrets' && fileSystem[HOME_DIR] && fileSystem[HOME_DIR][filename]) {
                    let content = fileSystem[HOME_DIR][filename];
                    return content;
                }

                if (files[filename]) {
                    if (files[filename] === 'directory') {
                        return `cat: ${filename}: is a directory`;
                    }
                    let content = files[filename];
                    return content;
                }

                return `cat: ${filename}: no such file or directory`;
            },

            echo: (args) => args ? args.join(' ') : '',

            clear: () => {
                terminalOutput.innerHTML = '';
                return null;
            },

            date: () => new Date().toString(),

            view: (args) => {
                if (!args || args.length === 0) {
                    return 'view: missing file operand';
                }

                let filepath = args[0];
                // Handle artwork/image_name format
                if (filepath.startsWith('artwork/')) {
                    filepath = `/pages/${filepath}`;
                }
                // If it's just a filename without path, assume it's in artwork directory
                else if (!filepath.includes('/') && !filepath.startsWith('pages/')) {
                    filepath = `/pages/artwork/${filepath}`;
                }
                openPicture(filepath);
                return '';
            }
        };

        function executeCommand(input) {
            const trimmed = input.trim();
            if (!trimmed) return;

            const parts = trimmed.split(/\s+/);
            const command = parts[0].toLowerCase();
            const args = parts.slice(1);

            commandHistory.push(trimmed);
            historyIndex = commandHistory.length;

            const commandLine = document.createElement('div');
            commandLine.className = 'terminal-line';
            commandLine.innerHTML = `<span class="prompt">${PROMPT_PREFIX}${currentDirectory}$ </span><span class="command">${trimmed}</span>`;
            terminalOutput.appendChild(commandLine);

            updateInputPrompt();

            if (commands[command]) {
                const result = commands[command](args);
                if (result !== null) {
                    const output = document.createElement('div');
                    output.className = 'terminal-output';
                    output.textContent = result;
                    terminalOutput.appendChild(output);
                }
            } else {
                const error = document.createElement('div');
                error.className = 'terminal-output';
                error.textContent = `command not found: ${command}. type 'help' for available commands.`;
                terminalOutput.appendChild(error);
            }

            scrollToBottom();
        }

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value;
                executeCommand(command);
                terminalInput.value = '';
                historyIndex = commandHistory.length;
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
            viewLabel.textContent = 'view';
            viewGroup.appendChild(viewLabel);


            const openPictureItem = document.createElement('div');
            openPictureItem.className = 'context-menu-item';
            openPictureItem.innerHTML = '<span class="context-menu-item-text">open picture...</span>';
            openPictureItem.addEventListener('click', () => {
                openPictureDialog();
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

        function openPictureDialog() {
            const picturePath = prompt('Enter picture path:');
            if (picturePath) {
                openPicture(picturePath);
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
