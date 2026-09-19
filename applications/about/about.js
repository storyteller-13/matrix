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

i am also a hermit. however, i am still a pretty happy human. i love myself, my life, my routine, and all the projects and adventures i work on. and i love studying and experiencing things such as astronomy, chess, languages, computer science, physics, mathematics, philosophy, literature, history, movies, art, traveling, and music.

that's it and thank you for reading!

`,
    disclaimer: `🩷 gentle disclaimer: you might notice that none of my public work have ever, at any point, had any option for feedback or comments. this is intentional: they are monologues. i am not trying to connect or send messages to anyone online. and, again, my personal life is and has always been offline and very private. any of my outreach projects are simply free-speech, handmade, authentic, expressive projects, with no desire or need to build an audience, make a profit, become popular, or anything like that.`
};

const ABOUT_JA = {
    name: 'マリーナ・フォン・シュタインキルヒ',
    role: 'せんさい · がんばりや · らくてんてき · てつがくしゃ',
    text: `こんにちは、マリナです。ここは私の個人的な場所で、自由な時間に、ちょっとした考えや物語を共有しています。

本業は、実はエンジニアであり科学者でもあります。ほぼ30年間、休むことなくフルタイムで続けてきて、時間の大半は、技術や科学に関する自分の取り組みにひっそりと費やしています。これこそが私の本当の目的なので、ぜひ私のウェブサイトも見てみてください！

学者として、ものづくりをする者としてのキャリアは、ずっと人生の中心にあり、これまで成し遂げてきたことをとても誇りに思っています。これから先の多くの成果も楽しみです。また、私はずっとプライベートを大切にする人間で、SNSをやったことは一度もなく、オーディエンスを増やすことにも、ブランドを築くことにも興味がありません（仕事にそれらは必要ありませんし、私の性格にも合わないからです）。それでも、物語を語り、創造的に表現できる場所がほしかったのです。この「matrix」というプロジェクトに取り組むのはとても楽しくて、私にとっては心が休まる時間でもあります。

私は隠者でもあります。それでも、かなり幸せな人間です。自分自身も、自分の人生も、日々のルーティンも、取り組んでいるすべてのプロジェクトや冒険も大好きです。そして、天文学、チェス、語学、コンピュータサイエンス、物理学、数学、哲学、文学、歴史、映画、アート、旅行、音楽といったものを学んだり体験したりすることも大好きです。以上です。読んでくれてありがとう！

🩷 やさしいお断り：私が公開している作品には、これまで一度もフィードバックやコメントの機能がないことにお気づきかもしれません。これは意図的なものです。どれもモノローグ（独白）だからです。私はオンラインで誰かとつながったり、メッセージを送ったりしようとしているわけではありません。繰り返しになりますが、私の私生活は、今もこれまでもずっとオフラインで、とてもプライベートなものです。私の発信のプロジェクトはどれも、手づくりで、本物の、表現としての自由な発言にすぎず、オーディエンスを築いたり、利益を得たり、人気者になったりしたいという願望も必要もありません。`
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
