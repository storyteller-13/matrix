/**
 * Tiny EN/JA i18n for chrome copy. Persists locale and paints [data-i18n*] nodes.
 */
const I18N_STORAGE_KEY = 'matrix-locale';
const I18N_LOCALES = ['en', 'ja'];

const I18N_STRINGS = {
    en: {
        'doc.title': "Marina von Steinkirch's Matrix",
        'menu.applications': 'applications',
        'menu.whoIAm': 'who i am',
        'menu.whatIDo': 'what i do',
        'menu.terminal': 'terminal',
        'menu.artwork': 'artwork',
        'menu.stories': 'stories',
        'menu.focusList': 'focus list',
        'menu.allOldStories': 'all old stories',
        'menu.innerExistentialism': 'inner existentialism',
        'menu.lunaCapra': 'luna capra',
        'menu.trueLove': 'true love',
        'menu.theCrime': 'the crime',
        'menu.television': 'television',
        'menu.loLoLore': 'lo lo lore',
        'menu.hackingAlgorithms': 'hacking algorithms',
        'menu.choices': '$choices',
        'menu.samhain': "samhain '25",
        'menu.timeTraveler': 'time traveler',
        'menu.fifthWall': 'the 5th wall',
        'menu.midsummer': 'midsumm3r',
        'menu.futuristEngineering': 'futurist engineering',
        'menu.futureAi': 'future.ai app',
        'menu.uraniTrade': 'urani trade',
        'menu.filmmakerDao': 'filmmaker dao',
        'menu.quantumCuriee': 'quantum curiee',
        'menu.singularity': 'singularity.sh',
        'menu.ghostInTheShell': 'ghost in the shell',
        'menu.doctorBt3gl': 'doctor bt3gl',
        'menu.robotsBt3gl': 'robots bt3gl',
        'menu.stringsBt3gl': 'strings bt3gl',
        'menu.cypherpunk': 'cypherpunk',
        'menu.physicist': 'physicist',
        'menu.bytegirl': 'bytegirl',
        'clock.aria': 'world clocks',
        'clock.hawaii': 'hawaii',
        'clock.nyc': 'nyc',
        'clock.curitiba': 'curitiba',
        'clock.iceland': 'iceland',
        'clock.berlin': 'berlin',
        'clock.japan': 'japan',
        'tray.wisdom': "today's wisdom",
        'tray.apod': 'astronomy picture of the day',
        'tray.bird': 'bird of the day',
        'tray.chess': "today's chess",
        'tray.sky': "today's sky",
        'tray.music': 'music player',
        'panel.wisdomTitle': "TODAY'S WISDOM",
        'panel.chessTitle': "TODAY'S CHESS",
        'panel.skyTitle': "TODAY'S SKY",
        'panel.birdTitle': "TODAY'S BIRD",
        'panel.universeTitle': "TODAY'S UNIVERSE",
        'panel.close': 'Close',
        'panel.loading': 'loading...',
        'panel.chessPlay': 'go play →',
        'panel.chessError': '(unable to load chess)',
        'panel.birdLearn': 'learn more →',
        'panel.musicPrev': 'Previous',
        'panel.musicNext': 'Next',
        'panel.musicToggle': 'Play/Pause',
        'window.todo': 'FOCUS LIST',
        'window.notes': 'STORIES, ART, PHILOSOPHY',
        'window.about': 'WHO I AM',
        'window.home': 'WHAT I DO',
        'window.artwork': 'ARTWORK',
        'todo.empty': 'no tasks yet',
        'todo.itemLeft': '{count} item left',
        'todo.itemsLeft': '{count} items left',
        'todo.item.dreams': 'never give up on my dreams',
        'todo.item.peace': 'be happy, free, and at peace',
        'todo.item.people': 'live a good life with good people',
        'notes.empty': 'no entries yet',
        'notes.entry': '{count} entry',
        'notes.entries': '{count} entries',
        'notes.hello.title': 'hello starlit world',
        'notes.hello.content': `i am a scholar always creating the sublime

in the next years, as i continue to grow
my career, home, family, and all my dreams

i'll be talking about good books, films, music, art
and all the beauties of this life; with you, in here

i'll be registering our journey on the weekends,
starting at some point, this fall

(for now, enjoy my carefully curated little playlists)`,
        'notes.weekday.sunday': 'sunday',
        'notes.weekday.monday': 'monday',
        'notes.weekday.tuesday': 'tuesday',
        'notes.weekday.wednesday': 'wednesday',
        'notes.weekday.thursday': 'thursday',
        'notes.weekday.friday': 'friday',
        'notes.weekday.saturday': 'saturday',
        'quotes.empty': 'No quotes loaded.',
        'apod.fallbackTitle': 'astronomical picture of the day',
        'bird.fallbackTitle': 'bird of the day',
        'sky.rx': 'rx',
        'sky.retrograde': 'retrograde',
        'sky.planet.sun': 'sun',
        'sky.planet.moon': 'moon',
        'sky.planet.mercury': 'mercury',
        'sky.planet.venus': 'venus',
        'sky.planet.mars': 'mars',
        'sky.planet.jupiter': 'jupiter',
        'sky.planet.saturn': 'saturn',
        'sky.planet.uranus': 'uranus',
        'sky.planet.neptune': 'neptune',
        'sky.planet.pluto': 'pluto',
        'sky.planet.north_node': 'n. node',
        'sky.planet.southnode': 's. node',
        'sky.planet.south_node': 's. node',
        'sky.planet.chiron': 'chiron',
        'sky.sign.aries': 'ari',
        'sky.sign.taurus': 'tau',
        'sky.sign.gemini': 'gem',
        'sky.sign.cancer': 'can',
        'sky.sign.leo': 'leo',
        'sky.sign.virgo': 'vir',
        'sky.sign.libra': 'lib',
        'sky.sign.scorpio': 'sco',
        'sky.sign.sagittarius': 'sag',
        'sky.sign.capricorn': 'cap',
        'sky.sign.aquarius': 'aqu',
        'sky.sign.pisces': 'pis',
        'locale.toJa': '日本語にする',
        'locale.toEn': 'switch to english',
    },
    ja: {
        'doc.title': 'マリーナ・フォン・シュタインキルヒのマトリックス',
        'menu.applications': 'アプリ',
        'menu.whoIAm': 'わたし',
        'menu.whatIDo': 'おしごと',
        'menu.terminal': 'ターミナル',
        'menu.artwork': 'アート',
        'menu.stories': 'ものがたり',
        'menu.focusList': 'フォーカス',
        'menu.allOldStories': 'むかしばなし',
        'menu.innerExistentialism': 'ないなるじつぞん',
        'menu.lunaCapra': 'ルナ・カプラ',
        'menu.trueLove': 'しんのあい',
        'menu.theCrime': 'ざいあく',
        'menu.television': 'テレビ',
        'menu.loLoLore': 'ロロロア',
        'menu.hackingAlgorithms': 'ハッキング',
        'menu.choices': '$choices',
        'menu.samhain': "サムハイン '25",
        'menu.timeTraveler': 'タイムトラベラー',
        'menu.fifthWall': 'だい5のかべ',
        'menu.midsummer': 'ミッドサマー',
        'menu.futuristEngineering': 'みらいこうがく',
        'menu.futureAi': 'future.ai',
        'menu.uraniTrade': 'ウラニ',
        'menu.filmmakerDao': 'フィルムメーカー dao',
        'menu.quantumCuriee': 'キュリー',
        'menu.singularity': 'singularity.sh',
        'menu.ghostInTheShell': '攻殻機動隊',
        'menu.doctorBt3gl': 'ドクター bt3gl',
        'menu.robotsBt3gl': 'ロボット bt3gl',
        'menu.stringsBt3gl': 'ストリングス bt3gl',
        'menu.cypherpunk': 'サイファーパンク',
        'menu.physicist': 'ぶつりがくしゃ',
        'menu.bytegirl': 'バイトガール',
        'clock.aria': 'せかいのとけい',
        'clock.hawaii': 'ハワイ',
        'clock.nyc': 'ニューヨーク',
        'clock.curitiba': 'クリチバ',
        'clock.iceland': 'アイスランド',
        'clock.berlin': 'ベルリン',
        'clock.japan': 'にほん',
        'tray.wisdom': 'きょうのちえ',
        'tray.apod': 'きょうのてんたいしゃしん',
        'tray.bird': 'きょうのとり',
        'tray.chess': 'きょうのチェス',
        'tray.sky': 'きょうのそら',
        'tray.music': 'おんがく',
        'panel.wisdomTitle': 'きょうのちえ',
        'panel.chessTitle': 'きょうのチェス',
        'panel.skyTitle': 'きょうのそら',
        'panel.birdTitle': 'きょうのとり',
        'panel.universeTitle': 'きょうのうちゅう',
        'panel.close': 'とじる',
        'panel.loading': 'よみこみちゅう...',
        'panel.chessPlay': 'あそびにいく →',
        'panel.chessError': '（チェスをよみこめません）',
        'panel.birdLearn': 'もっとみる →',
        'panel.musicPrev': 'まえ',
        'panel.musicNext': 'つぎ',
        'panel.musicToggle': 'さいせい',
        'window.todo': 'フォーカスリスト',
        'window.notes': 'ものがたり、アート、てつがく',
        'window.about': 'わたし',
        'window.home': 'おしごと',
        'window.artwork': 'アート',
        'todo.empty': 'まだタスクがないよ',
        'todo.itemLeft': 'のこり{count}こ',
        'todo.itemsLeft': 'のこり{count}こ',
        'todo.item.dreams': 'ゆめを、ぜったにあきらめない',
        'todo.item.peace': 'しあわせで、じゆうで、やすらかでいる',
        'todo.item.people': 'いいひとたちと、いいじんせいをおくる',
        'notes.empty': 'まだきろくがないよ',
        'notes.entry': '{count}けん',
        'notes.entries': '{count}けん',
        'notes.hello.title': 'こんにちは、ほしぞらのせかい',
        'notes.hello.content': `わたしはがくしゃ、いつもsublimeなものをつくりつづけている

これからさき、キャリアも、いえも、かぞくも、すべてのゆめも
そだてつづけていくなかで

いいほん、えいが、おんがく、アート、
そしてこのじんせいのうつくしさを、ここで、あなたとはなしていくね

しゅうまつのたびを、きろくしていくよ
いつか、このあきから

（いまは、だいじにえらんだちいさなプレイリストをたのしんでね）`,
        'notes.weekday.sunday': 'にちようび',
        'notes.weekday.monday': 'げつようび',
        'notes.weekday.tuesday': 'かようび',
        'notes.weekday.wednesday': 'すいようび',
        'notes.weekday.thursday': 'もくようび',
        'notes.weekday.friday': 'きんようび',
        'notes.weekday.saturday': 'どようび',
        'quotes.empty': 'ことばがまだないよ。',
        'apod.fallbackTitle': 'きょうのてんたいしゃしん',
        'bird.fallbackTitle': 'きょうのとり',
        'sky.rx': '逆行',
        'sky.retrograde': '逆行',
        'sky.planet.sun': 'たいよう',
        'sky.planet.moon': 'つき',
        'sky.planet.mercury': 'すいせい',
        'sky.planet.venus': 'きんせい',
        'sky.planet.mars': 'かせい',
        'sky.planet.jupiter': 'もくせい',
        'sky.planet.saturn': 'どせい',
        'sky.planet.uranus': 'てんのうせい',
        'sky.planet.neptune': 'かいおうせい',
        'sky.planet.pluto': 'めいおうせい',
        'sky.planet.north_node': '北交点',
        'sky.planet.southnode': '南交点',
        'sky.planet.south_node': '南交点',
        'sky.planet.chiron': 'キロン',
        'sky.sign.aries': 'おひつじ',
        'sky.sign.taurus': 'おうし',
        'sky.sign.gemini': 'ふたご',
        'sky.sign.cancer': 'かに',
        'sky.sign.leo': 'しし',
        'sky.sign.virgo': 'おとめ',
        'sky.sign.libra': 'てんびん',
        'sky.sign.scorpio': 'さそり',
        'sky.sign.sagittarius': 'いて',
        'sky.sign.capricorn': 'やぎ',
        'sky.sign.aquarius': 'みずがめ',
        'sky.sign.pisces': 'うお',
        'locale.toJa': '日本語にする',
        'locale.toEn': 'english にする',
    },
};

class I18n {
    static STORAGE_KEY = I18N_STORAGE_KEY;
    static LOCALES = I18N_LOCALES;

    constructor() {
        this.locale = this.readStoredLocale();
        this.init();
    }

    readStoredLocale() {
        try {
            const stored = localStorage.getItem(I18N_STORAGE_KEY);
            if (I18N_LOCALES.includes(stored)) {
                return stored;
            }
        } catch (_) {}
        return 'en';
    }

    t(key, vars = {}) {
        const table = I18N_STRINGS[this.locale] || I18N_STRINGS.en;
        const template = table[key] ?? I18N_STRINGS.en[key] ?? key;
        return String(template).replace(/\{(\w+)\}/g, (_, name) => (
            vars[name] != null ? String(vars[name]) : `{${name}}`
        ));
    }

    has(key) {
        const table = I18N_STRINGS[this.locale] || I18N_STRINGS.en;
        return Object.prototype.hasOwnProperty.call(table, key)
            || Object.prototype.hasOwnProperty.call(I18N_STRINGS.en, key);
    }

    setLocale(locale) {
        if (!I18N_LOCALES.includes(locale) || locale === this.locale) {
            return;
        }
        this.locale = locale;
        try {
            localStorage.setItem(I18N_STORAGE_KEY, locale);
        } catch (_) {}
        this.apply();
        document.dispatchEvent(new CustomEvent('localechange', { detail: { locale } }));
    }

    toggle() {
        this.setLocale(this.locale === 'ja' ? 'en' : 'ja');
    }

    apply() {
        const root = document.documentElement;
        if (root) {
            root.lang = this.locale === 'ja' ? 'ja' : 'en';
            root.classList.toggle('locale-ja', this.locale === 'ja');
        }
        if (document.title !== undefined) {
            document.title = this.t('doc.title');
        }
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const count = el.getAttribute('data-i18n-count');
            el.textContent = count != null ? this.t(key, { count }) : this.t(key);
        });
        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            el.setAttribute('title', this.t(el.getAttribute('data-i18n-title')));
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
            el.setAttribute('aria-label', this.t(el.getAttribute('data-i18n-aria-label')));
        });
        this.syncToggle();
    }

    syncToggle() {
        const button = document.getElementById('locale-toggle');
        if (!button) {
            return;
        }
        const isJa = this.locale === 'ja';
        button.classList.toggle('is-ja', isJa);
        button.setAttribute('aria-pressed', isJa ? 'true' : 'false');
        const hint = this.t(isJa ? 'locale.toEn' : 'locale.toJa');
        button.setAttribute('title', hint);
        button.setAttribute('aria-label', hint);
    }

    setupToggle() {
        const button = document.getElementById('locale-toggle');
        if (!button || button.dataset.i18nBound === 'true') {
            return;
        }
        button.dataset.i18nBound = 'true';
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });
        this.syncToggle();
    }

    init() {
        this.apply();
        this.setupToggle();
    }
}

window.I18nClass = I18n;
window.I18N_STRINGS = I18N_STRINGS;

const initI18n = () => {
    window.I18n = new I18n();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}
