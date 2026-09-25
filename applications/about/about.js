/**
 * About Window Application Module
 * A short "who i am" letter.
 */
const ABOUT = {
    name: 'marina von steinkirch',
    role: 'delicate · hardworking · optimistic · philosopher ',
    text: `i am marina, and this is a personal space where, during my free time, i share a little bit of my thoughts and stories.

my real job is actually being an engineer and a scientist, which i have been doing full-time without stopping for almost three decades, and i spend most of my time privately working on my technical and scientific endeavors. this is my real purpose, and you should definitely check out my website!

my career as a scholar and builder has always been my main focus in life, and i am pretty proud of what i have been able to achieve so far. i am looking forward to the many more achievements to come. in addition, i have always been a very private person and never had social media, nor any interest in growing an audience or building a brand (because none of that is necessary for my profession, nor is it part of my personality). but i wanted a space for storytelling and creative expression. working on this particular project — matrix — is so much fun. it’s really relaxing for me.

i am a pretty happy human. i love myself, my life, my routine, and all the projects and adventures i work on. and i love studying and experiencing things such as astronomy, chess, languages, computer science, physics, mathematics, philosophy, literature, history, movies, art, traveling, and music.

that's it and thank you for reading!

`,
};

const ABOUT_JA = {
    name: 'マリーナ・フォン・シュタインキルヒ',
    role: 'せんさい · がんばりや · らくてんてき · てつがくしゃ',
    text: `私はマリーナです。ここは私の個人的な空間で、自由な時間に、自分の考えや日々の物語を少しずつ綴っています。

本業はエンジニアであり、科学者です。もうほぼ30年にわたって、一度も途切れることなくフルタイムでこの仕事を続けています。普段は人目につかないところで、技術や科学に関するさまざまな活動に、ほとんどの時間を費やしています。これこそが私の本当の目的であり、人生の中心です。ぜひ私のウェブサイトも覗いてみてください！

研究者として、そしてものを生み出す人としてのキャリアは、いつも私の人生における最も大切なものです。そして、これまで成し遂げてきたことを、私はかなり誇りに思っています。これからさらに多くのことを成し遂げていけることを楽しみにしています。

また、私は昔からとてもプライベートな人間で、これまでソーシャルメディアを持ったこともありませんし、フォロワーを増やしたり、ブランドを築いたりすることにも興味がありませんでした。そもそも、そうしたことは私の職業には必要ありませんし、私自身の性格にも合っていません。

ただ、物語を綴ったり、創造的に自分を表現したりできる場所が欲しかったのです。この「Matrix」というプロジェクトに取り組むのは、とても楽しいです。私にとって本当にリラックスできる時間でもあります。

私は、自分ではかなり幸せな人間だと思っています。自分自身も、自分の人生も、日々の生活も、そして取り組んでいるすべてのプロジェクトや冒険も大好きです。

そして、天文学、チェス、言語、コンピューターサイエンス、物理学、数学、哲学、文学、歴史、映画、芸術、旅行、音楽など、さまざまなことを学んだり、実際に体験したりすることが大好きです。

そんなところです。読んでくださって、ありがとうございます！
`
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
