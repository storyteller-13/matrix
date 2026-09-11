/**
 * About Window Application Module
 * A short "who i am" letter.
 */
const ABOUT = {
    name: 'marina von steinkirch',
    role: 'introverted · delicate · hardworking · autistic · passionate · optimistic · philosopher ',
    text: `i am marina, and this is a personal space where, during my free time, i share a little bit of my thoughts and stories. 
my real job is actually being an engineer and a scientist, which i have been doing full-time without stopping for almost three decades, and i spend most of my time privately working on my technical and scientific endeavors. this is my real purpose, and you should definitely check out my website!

i decided to create this project after a very traumatic and cruel experience — one for which i never received justice, apologies, compensation for the enormous amount of damage it caused to my life for many years, or even an explanation; one that forced me to learn to let go of my old dreams and many things i had worked so hard for, and to move forward with my life without closure; one that i don't think i will ever be able to fully heal from, but i know i can forget and move on — far away.

my career as a scholar and builder has always been my main focus in life, and i am pretty proud of what i have been able to achieve so far. i am looking forward to the many more achievements to come. in addition, i have always been a very private person and never had social media, nor any interest in growing an audience or building a brand (because none of that is necessary for my profession, nor is it part of my personality). but after the long healing process, i needed a space for storytelling and creative expression.

i am also a hermit. i haven't been with anyone for years. i am still searching for my soulmate and the one i will love until the end. and i dream every day about my family and my life when that happens. meanwhile, however, i am still a pretty happy human. i love myself, my life, my routine, and all the projects and adventures i work on. and i love studying and experiencing things such as astronomy, chess, languages, computer science, physics, mathematics, philosophy, literature, history, movies, art, traveling, and music. that's it and thank you for reading!

`,
    disclaimer: `🩷 gentle disclaimer: you might notice that none of my public work have ever, at any point, had any option for feedback or comments. this is intentional: they are monologues. i am not trying to connect or send messages to anyone online. and, again, my personal life is and has always been offline and very private. any of my outreach projects are simply free-speech, handmade, authentic, expressive projects, with no desire or need to build an audience, make a profit, become popular, or anything like that.`
};

const ABOUT_JA = {
    name: 'マリーナ・フォン・シュタインキルヒ',
    role: 'ないこうてき · せんさい · がんばりや · 自閉スペクトラム · じょうねつてき · らくてんてき · てつがくしゃ',
    text: `わたしはマリーナ。ここは、ひまなときに、すこしだけかんがえやものがたりをわかちあう、わたしのばしょです。
ほんとうのしごとはエンジニアとかがくしゃで、もうすぐ30ねんちかく、やすまずフルタイムでやってきました。じかんのほとんどは、ひそかにぎじゅつとかがくのしごとにささげています。それがわたしのほんとうのしめいで、ぜったいにウェブサイトもみてみてね。

このプロジェクトをつくろうとおもったのは、とてもつらく、ざんこくないけんのあとでした。せいぎも、あやまりも、ながいあいだじんせいにおおきなダメージをあたえたことへのほしょうも、せつめいさえも、いちどももらえなかったできごと。むかしのゆめや、いっしょうけんめいにつみあげてきたたくさんのものを手放すことをおしえられ、とじめもないまま、じんせいをすすまなければならなかったできごと。かんぜんにいやせるとはおもえないけれど、わすれて、とおくへ、まえにすすめることはしっています。

がくしゃとして、つくりてとしてのキャリアは、いつもじんせいのちゅうしんにありました。いままでできてきたことは、けっこうほこらしいです。これから先の、もっとたくさんのことも、たのしみにしています。それに、わたしはずっととてもプライベートなにんげんで、SNSをもったこともないし、オーディエンスをふやしたり、ブランドをつくったりするきもちもありませんでした（しょくぎょうにも、せいかくにも、いらないから）。でも、ながいいやしのプロセスのあと、ものがたりと、そうぞうのひょうげんのためのばしょがひつようになりました。

わたしは、いんじゃでもあります。なんねんも、だれかといっしょにいたことがありません。いまも、ソウルメイトと、さいごまであいするひとをさがしています。それがおとずれたときの、かぞくとじんせいを、まいにちゆめみています。それでも、いまのわたしは、けっこうしあわせなにんげんです。じぶんのことも、じんせいも、にっちゅうも、とりくんでいるプロジェクトやぼうけんも、だいすきです。てんもん、チェス、げんご、コンピュータサイエンス、ぶつり、すうがく、てつがく、ぶんがく、れきし、えいが、アート、たび、おんがく。そういうことをまなんだり、たいけんしたりするのもだいすきです。以上です。よんでくれてありがとう。
`,
    disclaimer: `🩷 やさしいことわり：わたしのこうかいさくひんには、いままでいちども、フィードバックやコメントのばしょがなかったことにきづくかもしれません。それはわざとです。これらはモノローグなんです。オンラインのだれかとつながったり、メッセージをおくったりしたいわけではありません。そして、くりかえしますが、わたしのプライベートは、ずっとオフラインで、とてもないみつです。アウトリーチのプロジェクトは、ただのひょうげんとじゆうなはなし、てづくりで、ほんもので、ヒューマニスティックなものです。オーディエンスをつくりたいわけでも、もうけたいわけでも、ゆうめいになりたいわけでもありません。`
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
