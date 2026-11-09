/**
 * Podcast player window – plays a curated podcast episode (YouTube embed) opened from the lists folder.
 * The iframe is cleared on close so playback stops.
 */

const PODCAST_EMBED_BASE = 'https://www.youtube-nocookie.com/embed/';
const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/** Episodes by id; shared by the lists folder and the top-left menu. */
const PODCAST_EPISODES = [
    { id: 'ripperger-shawn-ryan', title: 'father chad ripperger on shawn ryan', videoId: 'XKNMThu3jQI' },
    { id: 'fei-fei-li-huberman', title: 'dr. fei-fei li on andrew huberman', videoId: 'N5AQFYtqx8Q' },
    { id: 'daves-garage-coding-80s', title: 'learning to code in the \'80s on dave\'s garage', videoId: 'vEAjtOI-Oaw' },
    { id: 'startalk-anatomy-of-the-sun', title: 'the anatomy of the sun on startalk', videoId: 'fIPs52WQs6g' },
    { id: 'greg-laurie-tetragrammaton', title: 'pastor greg laurie on tetragrammaton', videoId: 'KGR27hIf8Ow' },
    { id: 'alan-watts-after-skool', title: 'alan watts on after skool', videoId: '0Z7OUYy285w' },
    { id: 'lyn-alden-natalie-brunell', title: 'lyn alden on natalie brunell', videoId: 'Z8hpjcbNWMw' },
    { id: 'snakes-nat-geo', title: 'dangerous snakes on nat geo', videoId: 'QLPSmDCITHg' },
    { id: 'john-malkovich-club-random', title: 'john malkovich on club random', videoId: 'Oobj7GEVU6E' },
    { id: 'nathan-lambert-a16', title: 'nathan lambert on a16', videoId: 'BKuK0M6oDTI' },
    { id: 'sheryl-crow-rick-beato', title: 'sheryl crow on rick beato', videoId: '-7ik1NeS4lc' },
    { id: 'eric-jang-dwarkesh-patel', title: 'eric jang on dwarkesh patel', videoId: 'X_ZVSPcZhtw' },
    { id: 'rich-sutton-sequoia', title: 'rich sutton on sequoia', videoId: 'xH7U7w9Qzlo' },
    { id: 'jeff-kaplan-lex-fridman', title: 'jeff kaplan on lex fridman', videoId: 'H9rF1CSSh-w' },
    { id: 'nick-bostrom-joe-rogan', title: 'nick bostrom on joe rogan', videoId: '8qTZLqY-cnI' },
    { id: 'matthew-mcconaughey-something-to-brag', title: 'matthew mcconaughey\'s something to brag', videoId: '5yN9_sc_CTI' },
    { id: 'neil-degrasse-tyson-theo-von', title: 'neil degrasse tyson on theo von', videoId: 'AI4Ivk5AoZ8' },
    { id: 'emma-lofi-girl', title: 'emma on lofi girl', videoId: '3G3vzexbf64' },
    { id: 'diogo-almeida-latent-space', title: 'diogo almeida on latent space', videoId: 'cFx9Z3ZXca0' },
    { id: 'amjad-masad-paul-graham-ycombinator', title: 'amjad masad x paul graham on y combinator', videoId: 'Q78dJ0vkWe8' },
    { id: 'david-deutsch-world-science-festival', title: 'david deutsch on world science festival', videoId: 'Af5LICjFIBc' },
    { id: 'robert-greene-chris-williamson', title: 'robert greene on chris williamson', videoId: 'TQHgk-qft-8' },
    { id: 'arthur-brooks-daily-stoic', title: 'arthur brooks on the daily stoic', videoId: '9oI3NcbwEjI' },
    { id: 'nasa-artemis-moon-mission', title: 'nasa\'s artemis moon mission', videoId: 'IfRqrrBbT-Y' },
    { id: 'mario-zechner-pragmatic-engineer', title: 'mario zechner on the pragmatic engineer', videoId: 'n5f51gtuGHE' },
    { id: 'pope-pace-disarmata-disarmante', title: 'pope\'s pace disarmata e disarmante', videoId: 'CZqaTsNApII' },
    { id: 'fireship-code-is-dead', title: 'fireship\'s code is dead', videoId: 'OuNKBjuV7A4' },
    { id: 'madonna-jay-shetty', title: 'madonna on jay shetty', videoId: 'XZqdJ0tm7ZA' },
    { id: 'afloat-in-time-take-care-of-me', title: 'afloat in time\'s take care of me', videoId: 'UrwneiOBo1Q' },
    { id: 'joel-hamkins-ergo', title: 'joel david hamkins on ergo', videoId: '6yWpSgD4y9Y' },
    { id: 'bycloud-llm-inference-as-a-service', title: 'bycloud\'s llm inference-as-a-service', videoId: 'xP1kjDOisVw' },
    { id: 'andrew-huberman-megyn-kelly', title: 'andrew huberman on megyn kelly', videoId: 'pa6zqGpHNVg' },
    { id: 'stefania-druga-ai-engineer', title: 'stefania druga on ai engineer', videoId: 'R3-anFK1YM8' },
    { id: 'eric-weinstein-diary-of-a-ceo', title: 'eric weinstein on the diary of a ceo', videoId: 'IkhmdTqSvJw' },
    { id: 'neal-stephenson-free-press', title: 'neal stephenson on the free press', videoId: 'pUSWa5hOCtU' },
    { id: 'robert-greene-time-with-fifty', title: 'robert greene\'s time with fifty', videoId: 'fL_1w-f6_SA' },
    { id: 'sabine-hossenfelder-dinosaurs', title: 'sabine hossenfelder\'s dinosaurs death', videoId: '1tV3Qp0bwbI' },
    { id: 'tonbi-open-source-ai-tools', title: 'tonbi\'s open-source ai tools', videoId: 'qbTAJNkmex8' },
    { id: 'matthew-mcconaughey-criterion', title: 'matthew mcconaughey on criterion', videoId: 'G5BIhjXCJOY' },
    { id: 'primetime-am-i-alone', title: 'theprimetime\'s am i alone', videoId: 'pVMM23kUVH8' },
    { id: 'alexandr-wang-david-senra', title: 'alexandr wang on david senra', videoId: 'S6l3aRsecuE' },
    { id: 'horses-allen-iverson', title: 'horses on allen iverson', videoId: 'qR8BrLSIcdY' },
    { id: 'samuel-andreyev-peterson-academy', title: 'samuel andreyev on peterson academy', videoId: 'm40he3NqvxI' },
    { id: 'victoria-trumbull-institute-of-art-and-ideas', title: 'victoria trumbull at the institute of art and ideas', videoId: '3dryKlK8p38' },
    { id: 'alain-de-botton-sam-harrison', title: 'alain de botton on sam harrison', videoId: 'xCdUPhV_iSM' },
    { id: 'jared-isaacman-joe-lonsdale', title: 'jared isaacman on joe lonsdale', videoId: 'gCik1Ak6WVc' },
    { id: 'founders-creative-monopoly', title: 'founders podcast\'s how to build a creative monopoly', videoId: 'b9tB9Q1XOM0' },
    { id: 'alex-oconnor-closer-to-truth', title: 'alex o\'connor on closer to truth', videoId: '3MU2fNwhOxY' },
    { id: 'inspiraggion-goya-pure-horror', title: 'inspiraggio\'s goya is pure horror', videoId: '6TyAEVCxJ3w' },
    { id: 'jensen-huang-stanford-online', title: 'jensen huang on stanford online', videoId: 'tsQB0n0YV3k' },
    { id: 'naval-sell-the-truth', title: 'naval\'s sell the truth', videoId: 'l1DQgwomzxU' },
    { id: 'nobodys-everything-will-pass', title: 'nobody\'s everything will pass', videoId: 'SfpW6h1Mqlk' },
    { id: 'donald-hoffman-michael-levin', title: 'donald hoffman on michael levin', videoId: 'YnfaT5APPB0' },
    { id: 'michael-dalton-eric-wallace-black-hat', title: 'michael dalton and eric wallace on black hat', videoId: '87DyyMV0kCY' },
    { id: 'julia-turc-caleb-writes-code', title: 'julia turc on caleb writes code', videoId: 'UYVObn1HUeU' },
    { id: 'maggie-miller-quanta-magazine', title: 'maggie miller on quanta magazine', videoId: 'kCh0ynBTyCg' },
    { id: '3blue1brown-log-escher', title: '3blue1brown on log(escher)', videoId: 'ldxFjLJ3rVY' },
    { id: 'jonny-thomson-big-thing', title: 'jonny thomson on big thing', videoId: 'HbQ-t8GXYTA' },
    { id: 'nyc-mayor-antisemitism-instance', title: 'nyc mayor\'s antisemitism stance', videoId: 'Joo3PoSwAFM' },
    { id: 'lisa-kudrow-mayim-bialik', title: 'lisa kudrow on dr. mayim bialik', videoId: 'oix6y4IpSCA' },
    { id: 'grieg-essential-classics', title: 'grieg on essential classics', videoId: 'GjUBwBrCnTw' },
    { id: 'sunny-days-halidon-music', title: 'sunny days on halidon music', videoId: 'p88iGCFH7vQ' },
    { id: 'rupert-sheldrake-jesse-michels', title: 'rupert sheldrake on jesse michels', videoId: 'uvRzhb2Pef4' },
];
window.PODCAST_EPISODES = PODCAST_EPISODES;

class PodcastPlayerApp extends BaseApp {
    constructor() {
        super({ windowId: 'podcast-window' });
        this.elements = {};
        this.videoId = null;
        this.init();
    }

    init() {
        super.init();
        if (!this.window) return;
        this.elements.title = this.window.querySelector('.window-title');
        this.elements.iframe = this.window.querySelector('#podcast-iframe');
        // Capture phase: runs before the window manager's close handler stops propagation.
        this.window.addEventListener('click', (e) => {
            if (e.target.closest('.control.close')) this.stop();
        }, true);
    }

    embedUrl(videoId) {
        return `${PODCAST_EMBED_BASE}${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    }

    stop() {
        this.videoId = null;
        this.elements.iframe?.setAttribute('src', 'about:blank');
    }

    open({ title = '', videoId = '' } = {}) {
        if (!this.window || !YOUTUBE_ID_PATTERN.test(videoId)) return;
        const { title: titleEl, iframe } = this.elements;
        if (titleEl) titleEl.textContent = title.toUpperCase();
        if (iframe) {
            iframe.setAttribute('title', title);
            if (this.videoId !== videoId) iframe.setAttribute('src', this.embedUrl(videoId));
        }
        this.videoId = videoId;
        super.open();
        // Cascade on top of the curated-lists folder, like the list windows do.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const folder = document.getElementById('lists-folder-window');
                if (folder && getComputedStyle(folder).display !== 'none') {
                    this.window.style.top = 'calc(50% + 28px)';
                    this.window.style.left = 'calc(50% + 36px)';
                    this.window.style.transform = 'translate(-50%, -50%) scale(1)';
                }
                if (window.bringToFront) window.bringToFront(this.window);
                else window.WindowManager?.bringToFront?.(this.window);
            });
        });
    }
}

window.PodcastPlayerAppClass = PodcastPlayerApp;

const PODCAST_MENU_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">'
    + '<rect x="8.6" y="3.2" width="6.8" height="11" rx="3.4" fill="rgba(216, 70, 166, 0.18)" stroke="#E879A9" stroke-width="1.55"/>'
    + '<path d="M5.8 11.2 a6.2 6.2 0 0 0 12.4 0" fill="none" stroke="#E879A9" stroke-width="1.55" stroke-linecap="round"/>'
    + '<path d="M12 17.4 V20.6 M8.8 20.6 H15.2" stroke="#E879A9" stroke-width="1.55" stroke-linecap="round"/>'
    + '<path d="M10.9 7.1 L13.8 8.7 L10.9 10.3 Z" fill="#E879A9" stroke="#E879A9" stroke-width="0.7" stroke-linejoin="round"/>'
    + '</svg>';

/** Fills the top menu's episode submenu from PODCAST_EPISODES, so episodes live in one place. */
const renderPodcastMenu = () => {
    const menu = document.getElementById('podcast-menu-episodes');
    if (!menu) return;
    menu.replaceChildren();
    PODCAST_EPISODES.forEach((episode, i) => {
        if (i > 0) {
            const separator = document.createElement('div');
            separator.className = 'menu-separator';
            menu.appendChild(separator);
        }
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'menu-item';
        button.dataset.action = 'openPodcastEpisode';
        button.dataset.arg = episode.id;
        button.innerHTML = `<span class="menu-item-icon">${PODCAST_MENU_ICON}</span><span class="menu-item-text"></span>`;
        button.querySelector('.menu-item-text').textContent = episode.title;
        menu.appendChild(button);
    });
};

const initPodcastPlayerApp = () => {
    window.PodcastPlayerApp = new PodcastPlayerApp();
    renderPodcastMenu();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPodcastPlayerApp);
} else {
    initPodcastPlayerApp();
}

window.openPodcastWindow = (episode) => window.PodcastPlayerApp?.open(episode);
window.openPodcastEpisode = (id) => {
    const episode = PODCAST_EPISODES.find((e) => e.id === id);
    if (episode) window.openPodcastWindow({ title: episode.title, videoId: episode.videoId });
};
