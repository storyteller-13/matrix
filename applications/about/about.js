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
    text: `わたしはマリーナ。ここは、わたしが自分の手でつくりあげた小さな個人スペースです。自由な時間に、日々考えていることや、ちょっとした物語を綴っています。

本業はエンジニアであり、科学者でもあります。もう30年近く、途切れることなくフルタイムでこの仕事を続けています。時間の大半は、自分の技術的・科学的な探究にひっそりと費やしています。これこそが、わたしの本当の目的です。もしあなたもこういう世界に興味があるなら、ぜひウェブサイトも覗いてみてください！

そうそう、今、とてもワクワクするものをつくっています。これからの友情や人と人とのつながりのあり方を変えるものになると信じています。来年、この冒険にあなたも加わってくれたらうれしいです。

そんな一方で、わたしは毎日を楽しんでいる、けっこう幸せな人間です。自分の人生も、日々の習慣も、取り組んでいるプロジェクトや冒険も、みんな大好きです。

コンピューターサイエンス、物理学、数学、哲学、天文学、文学、歴史、言語、チェス、映画、アート、音楽。そうしたことを学び、実際に触れ、体験するのが大好きです。それから、気の合う仲間と冒険に出かけたり、旅をしたり、サーフィンやキャンプ、スノーボードを楽しんだりすることも。

そんなところです。ようこそ、そして読んでくれてありがとう！`
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
