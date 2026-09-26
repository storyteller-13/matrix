/**
 * Extra wallpaper stars clustered into a Milky Way band.
 * Phones/tablets get a lighter field so the compositor is not flooded.
 */
(() => {
    const COLORS = ['#FF85A2', '#F9A8C9', '#C4B5FD', '#E879A9', '#FFB3C6', '#F472B6'];
    const GOLDEN = 1.618033988749895;

    const root = document.querySelector('.wallpaper-stars');
    if (!root) return;

    const matches = (query) => typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
    const reducedMotion = matches('(prefers-reduced-motion: reduce)');
    const constrained = reducedMotion
        || matches('(max-width: 768px)')
        || matches('(pointer: coarse)');

    const EXTRA = reducedMotion ? 36 : constrained ? 96 : 360;
    const DUST = constrained ? 0 : 160;
    const lite = constrained;

    if (lite) root.classList.add('is-lite');
    if (reducedMotion) root.classList.add('is-static');

    const frac = (n) => n - Math.floor(n);

    const place = (n, field) => {
        if (field) {
            return {
                left: 3 + frac(n * GOLDEN) * 94,
                top: 5 + frac(n * GOLDEN * GOLDEN) * 86,
                plane: 2
            };
        }

        const t = frac(n * GOLDEN);
        const curve = Math.sin(t * Math.PI) * 7;
        const cx = -5 + t * 110;
        const cy = 92 - t * 84 + curve;
        const u1 = Math.max(1e-4, frac(n * 0.7548776662466927));
        const u2 = frac(n * 0.5698402909980532);
        let gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(u2 * Math.PI * 2);
        gauss = Math.max(-2.15, Math.min(2.15, gauss));
        const width = 5.2 + Math.sin(t * Math.PI) * 7.8;

        return {
            left: cx + 0.607 * gauss * width,
            top: cy + 0.795 * gauss * width,
            plane: Math.abs(gauss)
        };
    };

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < EXTRA; i++) {
        const n = i + 73;
        const field = frac(n * 0.61803398875) > 0.88;
        const { left, top, plane } = place(n, field);
        const sizeRoll = frac(n * 0.41421356237);
        const size = field
            ? (sizeRoll > 0.92 ? 7 : 5)
            : plane < 0.5
                ? (sizeRoll > 0.84 ? 11 : sizeRoll > 0.52 ? 8 : 7)
                : (sizeRoll > 0.72 ? 7 : 5);
        const twinkle = !reducedMotion && frac(n * 0.73205080757) > 0.36;
        const duration = twinkle
            ? (1.6 + frac(n * 0.236067977) * 0.9)
            : (2.4 + frac(n * 0.61803398875) * 1.2);
        const delay = frac(n * 0.38196601125) * 1.8;

        fragment.appendChild(makeStar({
            left,
            top,
            size,
            color: COLORS[i % COLORS.length],
            twinkle,
            duration,
            delay,
            dim: field || plane > 1.15,
            animate: !reducedMotion
        }));
    }

    for (let i = 0; i < DUST; i++) {
        const n = i + 997;
        const { left, top, plane } = place(n, false);
        if (plane > 1.05) continue;
        const size = 3 + (frac(n * 0.41421356237) > 0.7 ? 2 : 1);
        fragment.appendChild(makeStar({
            left,
            top,
            size,
            color: COLORS[i % COLORS.length],
            twinkle: frac(n * 0.73205080757) > 0.42,
            duration: 1.5 + frac(n * 0.236067977) * 0.9,
            delay: frac(n * 0.38196601125) * 1.8,
            dim: false,
            animate: true
        }));
    }

    root.appendChild(fragment);

    document.addEventListener('visibilitychange', () => {
        root.classList.toggle('is-paused', document.hidden);
    });

    function makeStar({ left, top, size, color, twinkle, duration, delay, dim, animate }) {
        const star = document.createElement('span');
        star.className = 'wallpaper-star';
        star.style.left = `${left.toFixed(2)}%`;
        star.style.top = `${top.toFixed(2)}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        if (animate) {
            star.style.animation = `${twinkle ? 'wallpaper-star-twinkle' : 'wallpaper-star-pulse'} ${duration.toFixed(2)}s ease-in-out infinite ${delay.toFixed(2)}s`;
        }
        if (dim) star.style.opacity = '0.55';

        if (lite) {
            star.classList.add('is-dot');
            star.style.background = color;
            star.style.boxShadow = `0 0 5px ${color}`;
            return star;
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttribute('href', '#wallpaper-star-shape');
        use.setAttribute('fill', color);
        svg.appendChild(use);
        star.appendChild(svg);
        return star;
    }
})();
