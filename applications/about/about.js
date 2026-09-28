/**
 * About Window Application Module
 */

const ABOUT = {
    name: 'marina von steinkirch',
    role: 'delicate · hardworking · optimistic · philosopher ',
    text: `i am marina, and this is a personal space where, during my free time, i share a little bit of my thoughts and stories.

my real job is actually being an engineer and a scientist, which i have been doing full-time, without interruption, for almost three decades. i spend most of my time privately working on my technical and scientific endeavors. this is my real purpose, and you should definitely check out my website!

my career as a scholar and builder has always been my main focus in life, and i am pretty proud of what i have been able to achieve so far. i am looking forward to the many more achievements to come.

matrix was born because i wanted a space for storytelling and creative expression. working on this particular side project is really relaxing for me.

besides all that, i am a pretty happy human. i love my life, my routine, and all the projects and adventures i work on. i also love studying and experiencing things such as astronomy, chess, languages, computer science, physics, mathematics, philosophy, literature, history, movies, art, travel, and music.

that's it, and thank you for reading!`,
};

const ABOUT_JA = {
    name: 'マリーナ・フォン・シュタインキルヒ',
    role: 'せんさい · がんばりや · らくてんてき · てつがくしゃ',
    text: `わたしはまりなです。ここは、わたしが自由な時間に、自分の考えていることやちょっとした物語を少しずつ綴っている、個人的な場所です。

本業はエンジニアであり、科学者でもあります。もう30年近く、途切れることなくフルタイムでこの仕事を続けています。普段はほとんどの時間を、自分の技術的・科学的な研究やプロジェクトにひっそりと費やしています。これがわたしの本当の目的であり、ぜひわたしのウェブサイトも覗いてみてください！

研究者として、そして何かを生み出す人間としてのキャリアは、これまでずっと人生の中心でした。そして、これまで自分が成し遂げてきたことを、かなり誇りに思っています。これから先、さらにたくさんのことを成し遂げていけることを楽しみにしています。

「matrix」は、物語を書いたり、創造的な表現をしたりするための場所が欲しくて始めました。この小さなサイドプロジェクトに取り組む時間は、わたしにとって本当にリラックスできるひとときです。

それはさておき、わたしはけっこう幸せな人間です。自分の人生も、日々のルーティンも、取り組んでいるたくさんのプロジェクトや冒険も大好きです。そして、天文学、チェス、言語、コンピューターサイエンス、物理学、数学、哲学、文学、歴史、映画、アート、旅行、音楽など、いろいろなことを学んだり、実際に体験したりするのも大好きです。

そんなところです。読んでくれて、ありがとう！`
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
