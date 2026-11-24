/**
 * Matrix theme (easter egg, toggled by typing `matrix` in the terminal): a neon city of purple and green, in Marina's palette.
 * Behind everything is a night-city backdrop drawn on a canvas, in three layers:
 *   - code rain, in three depths (small and dim far away, big and bright up close), with rare cyan and magenta glyphs;
 *   - a skyline of towers with windows that flicker on and off, and blinking antenna lights;
 *   - a neon grid running out to the horizon, scrolling toward the viewer.
 * Now and then the picture glitches: a few horizontal bands slide sideways for a moment.
 * Typing `matrix` again restores the normal theme.
 * The theme is a class on <html> (styles/matrix-theme.css) plus a canvas behind the page.
 */

const THEME_CLASS = 'matrix-theme';
const CANVAS_ID = 'matrix-rain';

// Columns that fall with a phrase: the numbers 13 and 37.
const PHRASES = ['13', '37'];
// Other columns fall with half-width katakana and digits.
const RANDOM_GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
const DIGITS = '0123456789';
const PHRASE_SHARE = 0.3;
const DIGIT_SHARE = 0.62;
const RESTART_CHANCE = 0.96; // restart almost every column that passes the bottom, so the rain stays present

// Marina's neon palette as RGB triples, used by the Matrix rain and city.
const COLORS = {
    green: '18, 246, 87',
    cyan: '0, 255, 255',
    ice: '255, 255, 255',
    magenta: '255, 0, 255',
    violet: '191, 0, 255',
};
const BACKGROUND = '#0A0A0A';
// The skyline's blue: the blog date blue in Marina (#66D9FF).
const BUILDING_BLUE = '102, 217, 255';
const HEAD_COLOR = COLORS.ice; // the leading glyph of each column is the brightest
const ACCENT_SHARE = 0.04; // one column in 25 glows cyan or magenta instead of green

// Three lighter layers of rain: wider spacing leaves more open background while keeping the depth effect.
const RAIN_LAYERS = [
    { fontSize: 12, columnWidth: 13, stepFrames: 34, alpha: 0.14 },
    { fontSize: 16, columnWidth: 18, stepFrames: 20, alpha: 0.3 },
    { fontSize: 24, columnWidth: 26, stepFrames: 11, alpha: 0.58 },
];

const HORIZON = 0.7; // where the city meets the grid, as a share of the screen height
const SKYLINE_MAX_HEIGHT = 0.3; // tallest tower, as a share of the screen height
const WINDOW_FLICKER = 0.002; // chance per frame that a window switches on or off
const ANTENNA_BLINK_FRAMES = 60;
const GRID_LINES = 14; // horizontal lines on the floor
const GRID_SCROLL = 0.02; // share of one grid cell that the floor moves each frame
const GRID_SPREAD = 8; // vertical lines on each side of the centre
const GLITCH_CHANCE = 0.004; // chance per frame that a glitch starts (about once every few seconds)
const GLITCH_BANDS = 4;

let state = null;

// While matrix mode is on, the tab shows a door and a question. The pink theme's icon and title come back when it is off.
const MATRIX_TITLE = 'will you enter it?';
const MATRIX_ICON = 'assets/favicon-matrix.svg';
let savedIconHref = null;

/** The matrix tab title in the page language. */
const matrixTitle = (win) => win?.I18n?.t?.('doc.matrixTitle') ?? MATRIX_TITLE;

function setMatrixChrome(on, doc, win) {
    const link = doc.querySelector('link[rel="icon"]');
    if (on) {
        if (link) {
            savedIconHref = link.getAttribute('href');
            link.setAttribute('href', MATRIX_ICON);
        }
        doc.title = matrixTitle(win);
    } else {
        if (link && savedIconHref !== null) link.setAttribute('href', savedIconHref);
        savedIconHref = null;
        doc.title = win.I18n?.t?.('doc.title') ?? doc.title;
    }
}

/** True while the matrix theme is on. */
export function isMatrixTheme(doc = document) {
    return doc.documentElement.classList.contains(THEME_CLASS);
}

const mod = (n, m) => ((n % m) + m) % m;

function pickAccent() {
    const roll = Math.random();
    if (roll < ACCENT_SHARE / 2) return 'cyan';
    if (roll < ACCENT_SHARE) return 'magenta';
    return 'green';
}

function newColumn(height, fontSize, startOnScreen = false) {
    const phrase = Math.random() < PHRASE_SHARE;
    const digits = !phrase && Math.random() < DIGIT_SHARE;
    const text = phrase ? PHRASES[Math.floor(Math.random() * PHRASES.length)] : digits ? DIGITS : RANDOM_GLYPHS;
    const row = startOnScreen
        ? Math.floor(Math.random() * (height / fontSize))
        : Math.floor(Math.random() * -(height / fontSize));
    return { text, phrase, color: pickAccent(), row };
}

function makeRain(width, height) {
    return RAIN_LAYERS.map((layer) => ({
        ...layer,
        columns: Array.from({ length: Math.ceil(width / layer.columnWidth) }, () => newColumn(height, layer.fontSize, true)),
    }));
}

// A few fixed digits in the open sky, redrawn every frame, so the background always shows a 3 or a 7.
// They sit above the tallest tower and are not part of the rain, so the trail fade cannot wear them away.
const TARGET_COUNT = 3;
const TARGET_DIGITS = '37';
const TARGET_SIZE = 22;

function makeTargets(width, height) {
    return Array.from({ length: TARGET_COUNT }, (_, i) => ({
        x: ((i + 1) / (TARGET_COUNT + 1)) * width,
        y: height * (0.08 + Math.random() * 0.1),
    }));
}

function drawTargets(ctx, targets, frame) {
    ctx.font = `${TARGET_SIZE}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(${HEAD_COLOR}, 0.75)`;
    targets.forEach((target, i) => {
        const digit = TARGET_DIGITS[(frame + i) % TARGET_DIGITS.length];
        ctx.fillText(digit, target.x, target.y);
    });
    ctx.textAlign = 'start';
}

function drawRain(ctx, layers, height, advanceFrame) {
    for (const layer of layers) {
        ctx.font = `${layer.fontSize}px monospace`;
        const advance = advanceFrame % layer.stepFrames === 0;
        layer.columns.forEach((column, i) => {
            const { text, phrase } = column;
            const index = phrase ? mod(column.row, text.length) : Math.floor(Math.random() * text.length);
            const x = i * layer.columnWidth;
            const y = column.row * layer.fontSize;
            ctx.fillStyle = `rgba(${HEAD_COLOR}, ${layer.alpha})`;
            ctx.fillText(text[index], x, y);
            if (advance) {
                if (y > height && Math.random() < RESTART_CHANCE) {
                    layer.columns[i] = newColumn(height, layer.fontSize);
                } else {
                    column.row += 1;
                }
            }
        });
    }
}

// The skyline is generated once per size. Its windows keep their own on/off state and flicker.
// Five kinds of tower: needles with a pod and beacon, orbital towers ringed in light, sails with a steep slanted roof,
// setback towers with a crown, and plain glass slabs. Every glass face carries a faint diagonal lattice.
function makeSkyline(width, height) {
    const horizon = height * HORIZON;
    const buildings = [];
    let x = -10;
    while (x < width) {
        const roll = Math.random();
        const kind = roll < 0.16 ? 'needle' : roll < 0.36 ? 'ring' : roll < 0.54 ? 'sail' : roll < 0.74 ? 'setback' : 'slab';
        const w = kind === 'needle' ? 10 + Math.random() * 8 : 30 + Math.random() * 48;
        const h = height * (0.06 + Math.random() ** 2 * SKYLINE_MAX_HEIGHT) * (kind === 'needle' ? 1.3 : 1);
        const top = horizon - h;
        const bands = [];
        const bandGap = kind === 'ring' ? 38 : 24;
        for (let y = top + 22; y < horizon - 6; y += bandGap) bands.push(y);
        const windows = [];
        if (kind !== 'needle') {
            for (let y = top + 12; y < horizon - 8; y += 12) {
                for (let wx = x + 5; wx < x + w - 5; wx += 7) {
                    if (Math.random() < 0.2) windows.push({ x: wx, y, lit: true, color: pickAccent() });
                }
            }
        }
        buildings.push({
            x,
            w,
            top,
            kind,
            chamfer: kind === 'sail' ? w * (0.5 + Math.random() * 0.3) : kind === 'slab' ? Math.random() * w * 0.2 : 0,
            crown: kind === 'setback' ? h * (0.12 + Math.random() * 0.12) : 0,
            pod: kind === 'needle' ? h * 0.18 : 0,
            antenna: kind === 'needle' ? h * 0.1 : 0,
            bands,
            windows,
        });
        x += w + 3 + Math.random() * 4;
    }
    return { horizon, buildings };
}

function drawSkyline(ctx, skyline, frame) {
    ctx.save();
    ctx.shadowColor = `rgba(${BUILDING_BLUE}, 0.6)`;
    ctx.shadowBlur = 6;
    for (const b of skyline.buildings) {
        const { x, w, top, chamfer, kind } = b;
        const right = x + w;
        const bottom = skyline.horizon;
        // The body: a block whose top-left corner is chamfered into a slanted roof (more for sails).
        ctx.beginPath();
        ctx.moveTo(x, bottom);
        ctx.lineTo(x, top + chamfer);
        ctx.lineTo(x + chamfer, top);
        ctx.lineTo(right, top);
        ctx.lineTo(right, bottom);
        ctx.closePath();
        ctx.fillStyle = BACKGROUND;
        ctx.fill();
        ctx.strokeStyle = `rgba(${BUILDING_BLUE}, 0.55)`;
        ctx.stroke();

        // Glass lattice: diagonal lines clipped to the facade.
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = `rgba(${COLORS.ice}, 0.08)`;
        ctx.beginPath();
        const span = bottom - top;
        for (let d = -span; d < w; d += 14) {
            ctx.moveTo(x + d, bottom);
            ctx.lineTo(x + d + span, top);
        }
        ctx.stroke();
        ctx.restore();

        // Light bands: flat lines, or orbital rings for the ring towers.
        ctx.strokeStyle = `rgba(${COLORS.ice}, 0.22)`;
        ctx.beginPath();
        for (const y of b.bands) {
            if (kind === 'ring') {
                ctx.moveTo(right, y);
                ctx.ellipse(x + w / 2, y, w / 2, 3, 0, 0, Math.PI * 2);
            } else {
                ctx.moveTo(x, y);
                ctx.lineTo(right, y);
            }
        }
        ctx.stroke();

        // A thin glowing strip down the right edge.
        ctx.fillStyle = `rgba(${BUILDING_BLUE}, 0.45)`;
        ctx.fillRect(right - 1, top, 1, bottom - top);

        if (kind === 'setback' && b.crown) {
            const cx = x + w * 0.22;
            const cw = w * 0.56;
            ctx.fillStyle = BACKGROUND;
            ctx.fillRect(cx, top - b.crown, cw, b.crown);
            ctx.strokeStyle = `rgba(${COLORS.ice}, 0.6)`;
            ctx.strokeRect(cx + 0.5, top - b.crown + 0.5, cw, b.crown);
        }

        if (kind === 'needle') {
            const mid = x + w / 2;
            const podY = top + b.pod;
            // A pod hanging off the needle, ringed in light, with an antenna above it.
            ctx.strokeStyle = `rgba(${COLORS.ice}, 0.7)`;
            ctx.beginPath();
            ctx.ellipse(mid, podY, w * 0.9, 3, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = `rgba(${BUILDING_BLUE}, 0.6)`;
            ctx.beginPath();
            ctx.moveTo(mid, podY);
            ctx.lineTo(mid, podY - b.antenna);
            ctx.stroke();
            if (frame % ANTENNA_BLINK_FRAMES < ANTENNA_BLINK_FRAMES / 2) {
                ctx.fillStyle = `rgb(${COLORS.magenta})`;
                ctx.fillRect(mid - 1, podY - b.antenna - 2, 3, 3);
            }
        }

        for (const window of b.windows) {
            if (Math.random() < WINDOW_FLICKER) window.lit = !window.lit;
            if (window.lit) {
                ctx.fillStyle = `rgba(${COLORS[window.color]}, 0.75)`;
                ctx.fillRect(window.x, window.y, 2, 6);
            }
        }
    }
    ctx.restore();
}

// Flying cars: sleek hover cars in lanes above the city, each with a light trail. Far cars are smaller and dimmer.
const CAR_COUNT = 7;
const CAR_LANES = [0.08, 0.16, 0.24, 0.32, 0.4, 0.48]; // share of the screen height

function makeCars(width, height) {
    return Array.from({ length: CAR_COUNT }, () => {
        const depth = Math.random(); // 0 far away, 1 close
        return {
            x: Math.random() * width,
            y: height * CAR_LANES[Math.floor(Math.random() * CAR_LANES.length)] + Math.random() * height * 0.04,
            dir: Math.random() < 0.5 ? -1 : 1,
            speed: (0.6 + Math.random() * 1.6) * (0.5 + depth),
            size: 10 + depth * 16,
            tail: Math.random() < 0.5 ? 'magenta' : 'violet',
        };
    });
}

function moveCars(cars, width) {
    for (const car of cars) {
        car.x += car.dir * car.speed;
        if (car.x > width + 80) car.x = -80;
        if (car.x < -80) car.x = width + 80;
    }
}

function drawCars(ctx, cars) {
    ctx.save();
    ctx.lineCap = 'round';
    for (const car of cars) {
        const { x, y, dir, size, tail } = car;
        const len = size * 2.2;
        const h = size * 0.45;
        const back = x - dir * len * 0.5;
        // Light trail behind the car.
        ctx.strokeStyle = `rgba(${COLORS[tail]}, 0.35)`;
        ctx.lineWidth = Math.max(1, size * 0.12);
        ctx.beginPath();
        ctx.moveTo(back, y);
        ctx.lineTo(back - dir * len * 2.5, y);
        ctx.stroke();
        // Body: a wedge with a pointed nose and a glowing cyan outline.
        ctx.beginPath();
        ctx.moveTo(x - dir * len / 2, y);
        ctx.lineTo(x - dir * len / 4, y - h);
        ctx.lineTo(x + dir * len / 2, y - h * 0.2);
        ctx.lineTo(x + dir * len / 2, y);
        ctx.closePath();
        ctx.fillStyle = BACKGROUND;
        ctx.fill();
        ctx.strokeStyle = `rgba(${COLORS.cyan}, 0.8)`;
        ctx.shadowColor = `rgba(${COLORS.cyan}, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.stroke();
        // Headlight at the nose, tail light at the back.
        ctx.shadowColor = `rgba(${COLORS.ice}, 0.9)`;
        ctx.shadowBlur = 10;
        ctx.fillStyle = `rgb(${COLORS.ice})`;
        ctx.beginPath();
        ctx.arc(x + dir * len / 2, y - h * 0.1, Math.max(1.2, size * 0.07), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = `rgba(${COLORS[tail]}, 0.9)`;
        ctx.fillStyle = `rgb(${COLORS[tail]})`;
        ctx.beginPath();
        ctx.arc(x - dir * len / 2, y - h * 0.2, Math.max(1, size * 0.06), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// The bridge, in violet, on the right-hand corner of the horizon. Its main cable carries a slow light.
function drawGoldenGate(ctx, width, height, frame) {
    const horizon = height * HORIZON;
    const span = Math.min(width * 0.32, 560);
    const left = width * 0.98 - span;
    const right = left + span;
    const deckY = horizon - span * 0.02;
    const towerH = span * 0.42;
    const towerTop = deckY - towerH;
    const t1 = left + span * 0.27;
    const t2 = left + span * 0.73;
    const sag = span * 0.2;
    const pillar = Math.max(2, span * 0.022);
    const cableAt = (u) => [t1 + (t2 - t1) * u, towerTop + sag * 4 * u * (1 - u)];

    ctx.save();
    ctx.strokeStyle = `rgba(${COLORS.violet}, 0.9)`;
    ctx.fillStyle = BACKGROUND;
    ctx.lineWidth = Math.max(1.5, span * 0.007);
    ctx.shadowColor = `rgba(${COLORS.violet}, 0.9)`;
    ctx.shadowBlur = 12;

    // Deck and its lower girder.
    ctx.beginPath();
    ctx.moveTo(left, deckY);
    ctx.lineTo(right, deckY);
    ctx.moveTo(left + span * 0.03, deckY + 4);
    ctx.lineTo(right - span * 0.03, deckY + 4);
    ctx.stroke();

    // Towers with their portal bars.
    for (const tx of [t1, t2]) {
        ctx.fillRect(tx - pillar / 2, towerTop, pillar, towerH);
        ctx.strokeRect(tx - pillar / 2, towerTop, pillar, towerH);
        ctx.beginPath();
        for (const share of [0.3, 0.72]) {
            const by = towerTop + towerH * share;
            ctx.moveTo(tx - pillar * 2, by);
            ctx.lineTo(tx + pillar * 2, by);
        }
        ctx.stroke();
    }

    // Main cables: steep at the anchorages, a parabola in the middle span.
    ctx.lineWidth = Math.max(1, span * 0.004);
    ctx.beginPath();
    ctx.moveTo(left + span * 0.01, deckY);
    ctx.quadraticCurveTo(t1, deckY, t1, towerTop);
    for (let i = 1; i <= 40; i += 1) {
        const [x, y] = cableAt(i / 40);
        ctx.lineTo(x, y);
    }
    ctx.quadraticCurveTo(t2, deckY, right - span * 0.01, deckY);
    ctx.stroke();

    // Suspender ropes down to the deck.
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 1; k < 20; k += 1) {
        const [x, y] = cableAt(k / 20);
        ctx.moveTo(x, y);
        ctx.lineTo(x, deckY);
    }
    ctx.stroke();

    // A slow light running along the main cable.
    const [lx, ly] = cableAt((frame * 0.0025) % 1);
    ctx.fillStyle = `rgb(${COLORS.violet})`;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(lx, ly, Math.max(1.5, span * 0.006), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// The neon floor: a grid in perspective that scrolls toward the viewer, with a glowing cyan horizon.
function drawGrid(ctx, width, height, phase) {
    const horizon = height * HORIZON;
    const floor = height - horizon;
    const centre = width / 2;
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${COLORS.green}, 0.3)`;
    ctx.shadowColor = `rgba(${COLORS.green}, 0.8)`;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let k = 0; k <= GRID_LINES; k += 1) {
        const t = (k + phase) / GRID_LINES;
        if (t > 1) continue;
        const y = horizon + floor * t * t; // lines bunch up near the horizon, as they would on a real floor
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    const spacing = width / 6;
    for (let j = -GRID_SPREAD; j <= GRID_SPREAD; j += 1) {
        ctx.moveTo(centre, horizon);
        ctx.lineTo(centre + j * spacing, height);
    }
    ctx.stroke();

    ctx.strokeStyle = `rgba(${COLORS.cyan}, 0.7)`;
    ctx.shadowColor = `rgba(${COLORS.cyan}, 0.9)`;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(width, horizon);
    ctx.stroke();
    ctx.restore();
}

// The word LOGIC in purple neon, centred above the tallest towers of the skyline.
function drawTitle(ctx, width, height, skyline) {
    const size = Math.min(Math.max(height * 0.11, 40), 136);
    // Sit above the highest point of any tower (including setback crowns), so the letters never touch a building.
    const tallestTop = Math.min(...skyline.buildings.map((b) => b.top - (b.crown || 0)));
    const baseline = Math.min(tallestTop, skyline.horizon) - size * 0.45;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `800 ${size}px monospace`;
    ctx.fillStyle = `rgb(${COLORS.violet})`; // the same violet as the "enter" label, fully opaque
    ctx.shadowColor = `rgba(${COLORS.violet}, 0.4)`; // a soft, faint glow
    ctx.shadowBlur = size * 0.12;
    // The word follows the site language: LOGIC in English, ロジック in Japanese. Read on every frame, so a switch shows at once.
    const word = globalThis.I18n?.locale === 'ja' ? 'ロジック' : 'LOGIC';
    ctx.fillText(word, width / 2, baseline);
    ctx.restore();
}

/** Draws one full picture: rain, then the city, then the floor. */
function compose(ctx, rainCanvas, skyline, cars, width, height, frame, phase) {
    ctx.drawImage(rainCanvas, 0, 0, width, height);
    drawSkyline(ctx, skyline, frame);
    drawTitle(ctx, width, height, skyline);
    drawCars(ctx, cars);
    drawGoldenGate(ctx, width, height, frame);
    drawGrid(ctx, width, height, phase);
}

/** Slides a few thin bands of the picture sideways, with a magenta flash: a short glitch. */
function glitch(ctx, width, height) {
    for (let i = 0; i < GLITCH_BANDS; i += 1) {
        const y = Math.random() * height;
        const bandHeight = 3 + Math.random() * 28;
        const shift = (Math.random() - 0.5) * 60;
        ctx.drawImage(ctx.canvas, 0, y, width, bandHeight, shift, y, width, bandHeight);
    }
    ctx.fillStyle = `rgba(${COLORS.magenta}, 0.08)`;
    ctx.fillRect(0, Math.random() * height, width, 6 + Math.random() * 20);
}

function startRain(doc, win) {
    const reduceMotion = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = doc.createElement('canvas');
    canvas.id = CANVAS_ID;
    canvas.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    // The rain is drawn off screen, so its trails can fade without smearing the city and the grid.
    const rainCanvas = doc.createElement('canvas');
    const rainCtx = rainCanvas.getContext('2d');
    if (!ctx || !rainCtx) {
        canvas.remove();
        return null;
    }

    let width = 0;
    let height = 0;
    let rain = [];
    let targets = [];
    let skyline = null;
    let cars = [];
    let rafId = 0;
    let frame = 0;
    let glitchFrames = 0;

    const sizeCanvases = () => {
        width = win.innerWidth;
        height = win.innerHeight;
        canvas.width = width;
        canvas.height = height;
        rainCanvas.width = width;
        rainCanvas.height = height;
    };
    const resize = () => {
        sizeCanvases();
        rain = makeRain(width, height);
        targets = makeTargets(width, height);
        skyline = makeSkyline(width, height);
        cars = makeCars(width, height);
    };
    const draw = () => {
        rafId = win.requestAnimationFrame(draw);
        frame += 1;
        rainCtx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        rainCtx.fillRect(0, 0, width, height);
        drawRain(rainCtx, rain, height, frame);
        drawTargets(rainCtx, targets, frame);
        moveCars(cars, width);
        compose(ctx, rainCanvas, skyline, cars, width, height, frame, (frame * GRID_SCROLL) % 1);
        if (glitchFrames > 0) {
            glitch(ctx, width, height);
            glitchFrames -= 1;
        } else if (Math.random() < GLITCH_CHANCE) {
            glitchFrames = 2 + Math.floor(Math.random() * 4);
        }
    };
    const onVisibility = () => {
        if (doc.hidden) win.cancelAnimationFrame(rafId);
        else rafId = win.requestAnimationFrame(draw);
    };

    if (reduceMotion) {
        // Users who ask for less motion get a still picture that is redrawn on resize, and no animation.
        const paintStill = () => {
            sizeCanvases();
            rainCtx.fillStyle = BACKGROUND;
            rainCtx.fillRect(0, 0, width, height);
            rain = makeRain(width, height);
            targets = makeTargets(width, height);
            rain.forEach((layer) => layer.columns.forEach((column) => {
                column.row = Math.floor(Math.random() * (height / layer.fontSize));
            }));
            drawRain(rainCtx, rain, height, 1);
            drawTargets(rainCtx, targets, 0);
            skyline = makeSkyline(width, height);
            ctx.clearRect(0, 0, width, height);
            cars = makeCars(width, height);
            compose(ctx, rainCanvas, skyline, cars, width, height, 0, 0);
        };
        paintStill();
        win.addEventListener('resize', paintStill);
        return () => {
            win.removeEventListener('resize', paintStill);
            canvas.remove();
        };
    }

    resize();
    rainCtx.fillStyle = BACKGROUND;
    rainCtx.fillRect(0, 0, width, height);
    win.addEventListener('resize', resize);
    doc.addEventListener('visibilitychange', onVisibility);
    rafId = win.requestAnimationFrame(draw);

    return () => {
        win.cancelAnimationFrame(rafId);
        win.removeEventListener('resize', resize);
        doc.removeEventListener('visibilitychange', onVisibility);
        canvas.remove();
    };
}

// The "today's ..." panels. In matrix mode they are hidden on load and only appear when their icon
// (top-right tray or the menu) opens them; their close button hides them again.
const OPEN_CLASS = 'matrix-open';
const TODAY_PANEL_BY_ACTION = {
    openQuotesWindow: 'quotes-box',
    openChessWindow: 'chess-box',
    openSkyWindow: 'sky-box',
    openBirdWindow: 'bird-box',
    openApodWindow: 'apod-box',
    openSoundtrack: 'music-player',
};
const TODAY_PANEL_SELECTOR = Object.values(TODAY_PANEL_BY_ACTION).map((name) => `.${name}`).join(', ');

function onMatrixClick(event) {
    if (!isMatrixTheme(document) || !(event.target instanceof Element)) return;
    const action = event.target.closest('[data-action]')?.dataset.action;
    const panelName = TODAY_PANEL_BY_ACTION[action];
    if (panelName) {
        document.querySelector(`.${panelName}`)?.classList.add(OPEN_CLASS);
        return;
    }
    const closeButton = event.target.closest('[class$="-close"]');
    closeButton?.closest(TODAY_PANEL_SELECTOR)?.classList.remove(OPEN_CLASS);
}

/** Turns the theme on or off. Returns the new state. */
export function setMatrixTheme(on, { doc = document, win = window } = {}) {
    const root = doc.documentElement;
    if (on === isMatrixTheme(doc)) return on;
    if (on) {
        root.classList.add(THEME_CLASS);
        state = { stopRain: startRain(doc, win) };
        setMatrixChrome(true, doc, win);
    } else {
        root.classList.remove(THEME_CLASS);
        state?.stopRain?.();
        setMatrixChrome(false, doc, win);
        state = null;
        doc.querySelectorAll(`.${OPEN_CLASS}`).forEach((panel) => panel.classList.remove(OPEN_CLASS));
    }
    return on;
}

if (typeof document !== 'undefined') {
    document.addEventListener('click', onMatrixClick);
    // The language switch rewrites the page title; in matrix mode the question stays.
    document.addEventListener('localechange', () => {
        if (isMatrixTheme(document)) document.title = matrixTitle(window);
    });
}

/** Flips the theme. Returns the new state. */
export function toggleMatrixTheme(options) {
    return setMatrixTheme(!isMatrixTheme(options?.doc), options);
}

if (typeof window !== 'undefined') {
    window.MatrixTheme = { isMatrixTheme, setMatrixTheme, toggleMatrixTheme };
}
