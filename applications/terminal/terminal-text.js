/**
 * Terminal messages in English and Japanese. The shell (terminal-core.js) asks for a text by key;
 * the language is the one the site is in (window.I18n.locale), so the terminal follows the EN / あ toggle.
 */

const MESSAGES = {
    en: {
        'help': `available commands:
  ls [-l] [path]  list directory contents (lists/ prints the tree)
  cd [dir]        change directory (no argument goes home)
  pwd             print working directory
  cat [file...]   display file contents
  grep [-i] pat [path]  find text in files and names under a path
  echo [text]     echo text (quotes keep spaces)
  view [file]     open picture file
  open <app>      open an app window (try: open books, open lists/adventures)
  play/pause      start or stop the music player
  next/prev       change song
  fortune         print a random quote
  neofetch        summary of this site
  history         list earlier commands
  matrix          will you enter it?
  date            display current date and time
  clear           clear terminal (ctrl+l)
  ctrl+k          open the command palette
  tab             complete commands and paths
  up/down         walk command history
  ctrl+c          cancel the current line
  exit            close terminal`,
        'ls.invalidOption': "ls: invalid option -- '{flag}'",
        'ls.noAccess': "ls: cannot access '{path}': No such file or directory",
        'ls.noLists': "ls: cannot access '{path}': lists are not available",
        'tree.dirs': '{n} {dirs}',
        'tree.files': '{n} {files}',
        'cd.tooMany': 'cd: too many arguments',
        'cd.noSuch': 'cd: no such file or directory: {target}',
        'cd.notDir': 'cd: not a directory: {target}',
        'cat.missing': 'cat: missing file operand',
        'cat.noSuch': 'cat: {path}: No such file or directory',
        'cat.binary': 'cat: {path}: binary file, use view',
        'cat.isDir': 'cat: {path}: Is a directory',
        'cat.noText': 'cat: {path}: no text content',
        'view.missing': 'view: missing file operand',
        'view.noFile': 'error: file does not exist: {name}',
        'view.notPicture': 'view: {name}: not a picture',
        'open.missing': "open: missing app name, try 'open books'",
        'open.unknown': 'open: unknown app: {target}',
        'fortune.none': 'fortune: no quotes available',
        'music.notLoaded': 'music: the player is not loaded',
        'grep.invalidOption': "grep: invalid option -- '{flag}'",
        'grep.missingPattern': 'grep: missing pattern',
        'grep.noSuch': 'grep: {path}: No such file or directory',
        'sudo': 'anon is not in the sudoers file. this incident will be reported.',
        'notFound': "command not found: {name}. type 'help' for available commands.",
        'error': 'error: {message}',
        'neo.os': 'os: NULLSTAR 2037.13',
        'neo.os.pink': 'os: MATRIX 2037.13',
        'neo.uptime': 'uptime: {uptime}',
        'neo.artwork': 'artwork: {count} pictures',
        'neo.lists': 'lists: {count} entries',
        'neo.playlists': 'mixtapes: {count} moods',
        'neo.notes': 'notes: {count} entries',
        'neo.todos': 'todos: {count} items',
        'neo.quotes': 'quotes: {count} thoughts',
        'uptime.seconds': '{s}s',
        'uptime.minutes': '{m}m {s}s',
        'keys.bar': 'terminal keys',
        'keys.complete': 'complete',
        'keys.previous': 'previous command',
        'keys.next': 'next command',
        'keys.cancel': 'cancel line',
        'keys.clear': 'clear screen',
        'context.view': 'view',
        'context.openPicture': 'open picture...',
    },
    ja: {
        'help': `使えるコマンド:
  ls [-l] [path]  ディレクトリの中身を表示（lists/ はツリーを表示）
  cd [dir]        ディレクトリを移動（引数なしでホームへ）
  pwd             今いるディレクトリを表示
  cat [file...]   ファイルの中身を表示
  grep [-i] pat [path]  パス内のファイルと名前から文字列を検索
  echo [text]     テキストを表示（引用符でスペースを残す）
  view [file]     画像ファイルを開く
  open <app>      アプリのウィンドウを開く（例: open books, open lists/adventures）
  play/pause      音楽プレーヤーを再生・停止
  next/prev       曲を切り替え
  fortune         ランダムな引用を表示
  neofetch        このサイトの概要
  history         これまでのコマンドを一覧表示
  matrix          入ってみる？
  date            今の日付と時刻を表示
  clear           ターミナルを消去（ctrl+l）
  ctrl+k          コマンドパレットを開く
  tab             コマンドとパスを補完
  up/down         コマンド履歴を移動
  ctrl+c          現在の入力をキャンセル
  exit            ターミナルを閉じる`,
        'ls.invalidOption': "ls: 無効なオプション -- '{flag}'",
        'ls.noAccess': "ls: '{path}' にアクセスできません: そのようなファイルもフォルダもありません",
        'ls.noLists': "ls: '{path}' にアクセスできません: リストは使えません",
        'tree.dirs': '{n} 個のフォルダ',
        'tree.files': '{n} 個のファイル',
        'cd.tooMany': 'cd: 引数が多すぎます',
        'cd.noSuch': 'cd: そのようなフォルダはありません: {target}',
        'cd.notDir': 'cd: フォルダではありません: {target}',
        'cat.missing': 'cat: ファイルが指定されていません',
        'cat.noSuch': 'cat: {path}: そのようなファイルもフォルダもありません',
        'cat.binary': 'cat: {path}: バイナリファイルです。view で開いてください',
        'cat.isDir': 'cat: {path}: フォルダです',
        'cat.noText': 'cat: {path}: テキストの中身がありません',
        'view.missing': 'view: ファイルが指定されていません',
        'view.noFile': 'error: ファイルが存在しません: {name}',
        'view.notPicture': 'view: {name}: 画像ではありません',
        'open.missing': "open: アプリ名がありません。例: 'open books'",
        'open.unknown': 'open: 不明なアプリ: {target}',
        'fortune.none': 'fortune: 引用がありません',
        'music.notLoaded': 'music: プレーヤーが読み込まれていません',
        'grep.invalidOption': "grep: 無効なオプション -- '{flag}'",
        'grep.missingPattern': 'grep: 検索する文字列がありません',
        'grep.noSuch': 'grep: {path}: そのようなファイルもフォルダもありません',
        'sudo': 'anon は sudoers に登録されていません。この件は報告されます。',
        'notFound': "コマンドが見つかりません: {name}。'help' で使えるコマンドを確認できます。",
        'error': 'エラー: {message}',
        'neo.os': 'OS: NULLSTAR 2037.13',
        'neo.os.pink': 'OS: MATRIX 2037.13',
        'neo.uptime': '稼働時間: {uptime}',
        'neo.artwork': 'アート: {count} 点',
        'neo.lists': 'リスト: {count} 件',
        'neo.playlists': 'ミックステープ: {count} 種類',
        'neo.notes': 'メモ: {count} 件',
        'neo.todos': 'ToDo: {count} 件',
        'neo.quotes': '引用: {count} 件の考え',
        'uptime.seconds': '{s}秒',
        'uptime.minutes': '{m}分{s}秒',
        'keys.bar': 'ターミナルのキー',
        'keys.complete': '補完',
        'keys.previous': '前のコマンド',
        'keys.next': '次のコマンド',
        'keys.cancel': '入力をとりけす',
        'keys.clear': '画面をクリア',
        'context.view': '表示',
        'context.openPicture': '絵を開く...',
    },
};

/** Words that depend on the count, in each language. */
const PLURALS = {
    en: {
        'tree.dirs': ({ n }) => ({ dirs: n === 1 ? 'directory' : 'directories' }),
        'tree.files': ({ n }) => ({ files: n === 1 ? 'file' : 'files' }),
    },
    ja: {},
};

/** The language the terminal writes in: Japanese when the site is in Japanese, otherwise English. */
export function terminalLocale() {
    return globalThis.I18n?.locale === 'ja' ? 'ja' : 'en';
}

/** Text for a key, with {name} parts filled from vars. Falls back to English. */
export function t(key, vars = {}) {
    const locale = terminalLocale();
    const table = MESSAGES[locale];
    const extra = PLURALS[locale]?.[key]?.(vars) ?? {};
    const template = table[key] ?? MESSAGES.en[key] ?? key;
    return String(template).replace(/\{(\w+)\}/g, (_, name) => {
        const value = extra[name] ?? vars[name];
        return value != null ? String(value) : `{${name}}`;
    });
}
