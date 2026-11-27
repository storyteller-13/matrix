/**
 * About Window Application Module
 */

const ABOUT = {
    name: 'marina von steinkirch',
    role: 'kind · delicate · hardworking · optimistic · autistic · philosopher ',
    text: `i am marina, and this is my handmade personal space, where, once a month, i share a few of my thoughts and stories.

my real job is being an engineer and a scientist, which i've been doing full-time, without interruption, for almost three decades. this is my true purpose, and it's an honor and a pleasure to spend the coming years building the future of friendships networks at «a:https://nullstar.games/»NULLSTAR«/a».

besides that, i'm a pretty happy human. i love my life, my routine, and all the projects and adventures i get to work on. i love studying and experiencing things like computer science, physics, mathematics, philosophy, astronomy, literature, history, languages, chess, movies, art, music, traveling, surfing, and snowboarding.

that's it. welcome and thank you for being here!`,
};

const ABOUT_JA = {
    name: 'マリーナ・フォン・シュタインキルヒ',
    role: 'やさしい · せんさい · がんばりや · らくてんてき · じへいしょうの当事者 · てつがくしゃ',
    text: `わたしはマリーナです。ここは、月に一度、考えや物語を少しずつ綴るために作った、手づくりの個人的な空間です。

わたしの本業はエンジニア兼科学者です。もう30年近く、途切れることなくフルタイムでこの仕事を続けています。これがわたしの本当の使命です。これからの年月をかけて、NULLSTARで友情のネットワークの未来を築いていけることを光栄に、そして嬉しく思います。

それ以外では、わたしはかなり幸せな人間です。自分の人生も、日々のルーティンも、取り組んでいるさまざまなプロジェクトや冒険も大好きです。そして、コンピュータサイエンス、物理学、数学、哲学、天文学、文学、歴史、言語、チェス、映画、アート、音楽、旅、サーフィン、スノーボードなど、いろいろなことを学び、体験するのが大好きです。

そんなところです。ようこそ、そして、ここに来てくれてありがとう！`
};

class AboutApp extends BaseApp {
    constructor() {
        super({ windowId: 'about-window', dockItemId: 'about-dock-item' });
        this.init();
    }

    init() {
        this.desktopIcon = document.getElementById('about-desktop-icon');
        super.init();
        if (!this.window) return;
        this.render();
        document.addEventListener('localechange', () => this.render());
    }

    currentCopy() {
        return window.I18n?.locale === 'ja' ? ABOUT_JA : ABOUT;
    }

    setupEventListeners() {
        super.setupEventListeners();
        if (this.desktopIcon) {
            this.desktopIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.open();
            });
        }
    }

    render() {
        const nameEl = this.window.querySelector('.about-name');
        const roleEl = this.window.querySelector('.about-role');
        const textEl = this.window.querySelector('.about-text');
        const disclaimerEl = this.window.querySelector('.about-disclaimer');
        const copy = this.currentCopy();
        if (nameEl) nameEl.textContent = copy.name;
        if (roleEl) roleEl.textContent = copy.role;
        if (textEl) {
            // Build links from the copy markers without interpreting the rest as HTML.
            const linkPattern = /«a:(https?:\/\/[^»\s"<>]+)»([\s\S]*?)«\/a»/g;
            let lastIndex = 0;
            let match;
            textEl.replaceChildren();
            while ((match = linkPattern.exec(copy.text))) {
                textEl.append(document.createTextNode(copy.text.slice(lastIndex, match.index)));
                const link = document.createElement('a');
                link.href = match[1];
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                const label = document.createElement('span');
                label.className = 'brand-caps';
                label.textContent = match[2];
                link.append(label);
                textEl.append(link);
                lastIndex = linkPattern.lastIndex;
            }
            textEl.append(document.createTextNode(copy.text.slice(lastIndex)));
        }
        if (disclaimerEl) disclaimerEl.textContent = copy.disclaimer;
    }
}

window.AboutAppClass = AboutApp;
window.ABOUT = ABOUT;
window.ABOUT_JA = ABOUT_JA;

const initAboutApp = () => {
    window.AboutApp = new AboutApp();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutApp);
} else {
    initAboutApp();
}

window.openAboutWindow = () => window.AboutApp?.open();
