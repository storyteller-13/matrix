/**
 * About Window Application Module
 */

const ABOUT = {
    name: 'marina von steinkirch',
    role: 'kind · delicate · hardworking · optimistic · autistic · philosopher ',
    text: `i am marina, and this is my handmade personal space, where i share a little of my thoughts and stories during my free time.

my real job is being an engineer and a scientist, which i've been doing full-time, without interruption, for almost three decades. this is my true purpose, and if you're into that sort of thing too, you should definitely check out my website!  

besides that, i'm a pretty happy human. i love my life, my routine, and all the projects and adventures i get to work on. i love studying and experiencing things like computer science, physics, mathematics, philosophy, astronomy, literature, history, languages, chess, movies, art, music, traveling, surfing, and snowboarding.

that's it, welcome, and thank you for being here!`,
};

const ABOUT_JA = {
    name: 'マリーナ・フォン・シュタインキルヒ',
    role: 'せんさい · がんばりや · らくてんてき · てつがくしゃ',
    text: `わたしはマリナです。ここは、自由な時間に自分の考えや物語を少しずつ綴っている、手づくりの個人的な空間です。

わたしの本業はエンジニアと科学者です。もう30年近く、途切れることなくフルタイムでこの仕事を続けています。これがわたしの本当の使命です。同じようなことに興味がある方は、ぜひわたしのウェブサイトも覗いてみてください！

それ以外では、わたしは毎日を幸せに過ごしている、ごく普通の人間です。自分の人生も、日々のルーティンも、取り組んでいるさまざまなプロジェクトや冒険も大好きです。そして、コンピュータサイエンス、物理学、数学、哲学、天文学、文学、歴史、言語、チェス、映画、アート、音楽、旅、サーフィン、スノーボードなど、いろいろなことを学び、体験するのが大好きです。

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
        if (textEl) textEl.textContent = copy.text;
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
