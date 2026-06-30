/**
 * Quotes Panel – random quote from the curated list (panel above XKCD).
 */
class QuotesPanel {
    constructor() {
        this.quotes = typeof window.QUOTES !== 'undefined' ? window.QUOTES : [];
        this.init();
    }

    init() {
        const closeBtn = document.getElementById('quotes-box-close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.hideBox());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.getBox() && window.getComputedStyle(this.getBox()).display !== 'none') {
                this.hideBox();
            }
        });
        if (!this.isMobile()) this.showBox();
    }

    getBox() {
        return document.getElementById('quotes-box');
    }

    getRandomQuote() {
        if (!this.quotes.length) return { text: 'No quotes loaded.', author: '' };
        return this.quotes[Math.floor(Math.random() * this.quotes.length)];
    }

    displayQuote() {
        const container = document.getElementById('quotes-quote-container');
        const authorEl = document.getElementById('quotes-quote-author');
        if (!container) return;
        const { text, author } = this.getRandomQuote();
        container.textContent = text;
        if (authorEl) authorEl.textContent = author ? `— ${author}` : '';
    }

    toggleVisibility() {
        const box = this.getBox();
        if (!box) return;
        if (window.getComputedStyle(box).display !== 'none') this.hideBox();
        else this.showBox();
    }

    isMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    showBox() {
        const box = this.getBox();
        if (!box) return;
        const center = this.isMobile() ? 'translate(-50%, -50%) ' : '';
        this.displayQuote();
        box.style.display = 'block';
        box.style.opacity = '0';
        box.style.transform = center + 'translateY(-10px) scale(0.95)';
        void box.offsetHeight;
        requestAnimationFrame(() => {
            box.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            box.style.opacity = '1';
            box.style.transform = center + 'translateY(0) scale(1)';
        });
    }

    hideBox() {
        const box = this.getBox();
        if (!box) return;
        const center = this.isMobile() ? 'translate(-50%, -50%) ' : '';
        box.style.opacity = '0';
        box.style.transform = center + 'translateY(-10px) scale(0.95)';
        setTimeout(() => { box.style.display = 'none'; }, 400);
    }
}

const initQuotes = () => { window.QuotesPanel = new QuotesPanel(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initQuotes);
else initQuotes();

window.openQuotesWindow = () => window.QuotesPanel?.toggleVisibility();
