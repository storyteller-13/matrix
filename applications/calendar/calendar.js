/**
 * Calendar Panel – current-month grid with moon / post markers.
 */
class CalendarPanel {
    constructor() {
        this.events = typeof window.CALENDAR_EVENTS !== 'undefined' ? window.CALENDAR_EVENTS : [];
        this.viewDate = new Date();
        this.elements = {
            badge: null,
            menuCount: null
        };
        this.init();
    }

    init() {
        this.elements.badge = document.getElementById('calendar-count-badge');
        this.elements.menuCount = document.getElementById('calendar-menu-count');

        const closeBtn = document.getElementById('calendar-box-close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.hideBox());

        const prevBtn = document.getElementById('calendar-prev');
        const nextBtn = document.getElementById('calendar-next');
        if (prevBtn) prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.shiftMonth(-1);
        });
        if (nextBtn) nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.shiftMonth(1);
        });

        const box = this.getBox();
        if (box) {
            box.addEventListener('pointerdown', () => this.bringToFront());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.getBox() && window.getComputedStyle(this.getBox()).display !== 'none') {
                this.hideBox();
            }
        });
        document.addEventListener('localechange', () => this.render());
        this.render();
        this.updateBadge();
    }

    getBox() {
        return document.getElementById('calendar-box');
    }

    isMobile() {
        return typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 768px)').matches;
    }

    bringToFront() {
        const box = this.getBox();
        if (!box) return;
        if (window.bringToFront) window.bringToFront(box);
        else if (window.WindowManager) window.WindowManager.bringToFront(box);
    }

    shiftMonth(delta) {
        this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + delta, 1);
        this.render();
    }

    t(key, fallback) {
        if (window.I18n) {
            const translated = window.I18n.t(key);
            if (translated && translated !== key) return translated;
        }
        return fallback;
    }

    monthLabel(year, monthIndex) {
        const key = `calendar.month.${monthIndex + 1}`;
        const names = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
        ];
        return `${this.t(key, names[monthIndex])} ${year}`;
    }

    weekdayLabels() {
        const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const fallback = ['s', 'm', 't', 'w', 't', 'f', 's'];
        return keys.map((k, i) => this.t(`calendar.weekday.${k}`, fallback[i]));
    }

    dateKey(year, monthIndex, day) {
        const m = String(monthIndex + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    }

    eventsForDay(year, monthIndex, day) {
        const key = this.dateKey(year, monthIndex, day);
        return this.events.filter((ev) => ev.date === key);
    }

    eventLabel(ev) {
        return this.t(ev.labelKey, ev.label || '');
    }

    eventIcon(type) {
        if (type === 'new-moon') return '\u25CF';
        if (type === 'full-moon') return '\u25CB';
        if (type === 'post') return '\u270E';
        return '\u2022';
    }

    getEventCount() {
        if (!Array.isArray(this.events)) return 0;
        const now = new Date();
        const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return this.events.filter((ev) => typeof ev.date === 'string' && ev.date.startsWith(prefix)).length;
    }

    updateBadge(countArg) {
        const count = countArg ?? this.getEventCount();
        const text = count > 99 ? '99+' : String(count);
        const show = count > 0;
        for (const el of [this.elements.badge, this.elements.menuCount]) {
            if (!el) continue;
            el.textContent = text;
            el.style.display = show ? 'flex' : 'none';
        }
    }

    render() {
        const titleEl = document.getElementById('calendar-box-title');
        const weekdaysEl = document.getElementById('calendar-weekdays');
        const gridEl = document.getElementById('calendar-grid');
        if (!gridEl) return;

        const now = new Date();
        const year = this.viewDate.getFullYear();
        const monthIndex = this.viewDate.getMonth();

        if (titleEl) {
            titleEl.textContent = this.monthLabel(year, monthIndex);
        }

        if (weekdaysEl) {
            weekdaysEl.innerHTML = '';
            this.weekdayLabels().forEach((label) => {
                const cell = document.createElement('span');
                cell.className = 'calendar-weekday';
                cell.textContent = label;
                weekdaysEl.appendChild(cell);
            });
        }

        gridEl.innerHTML = '';
        const firstDow = new Date(year, monthIndex, 1).getDay();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        for (let i = 0; i < firstDow; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day calendar-day-empty';
            empty.setAttribute('aria-hidden', 'true');
            gridEl.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            const dayEvents = this.eventsForDay(year, monthIndex, day);
            const isToday =
                now.getFullYear() === year &&
                now.getMonth() === monthIndex &&
                now.getDate() === day;

            cell.className = 'calendar-day';
            if (isToday) cell.classList.add('calendar-day-today');
            if (dayEvents.length) cell.classList.add('calendar-day-has-event');
            dayEvents.forEach((ev) => cell.classList.add(`calendar-day-${ev.type}`));

            const num = document.createElement('span');
            num.className = 'calendar-day-num';
            num.textContent = String(day);
            cell.appendChild(num);

            if (dayEvents.length) {
                const eventsWrap = document.createElement('div');
                eventsWrap.className = 'calendar-day-events';
                dayEvents.forEach((ev) => {
                    const label = document.createElement('span');
                    label.className = `calendar-day-event calendar-day-event-${ev.type}`;

                    const icon = document.createElement('span');
                    icon.className = 'calendar-day-event-icon';
                    icon.setAttribute('aria-hidden', 'true');
                    icon.textContent = this.eventIcon(ev.type);

                    const text = document.createElement('span');
                    text.className = 'calendar-day-event-text';
                    text.textContent = this.eventLabel(ev);

                    label.appendChild(icon);
                    label.appendChild(text);
                    eventsWrap.appendChild(label);
                });
                cell.appendChild(eventsWrap);
            }

            gridEl.appendChild(cell);
        }

        this.updateBadge();
    }

    toggleVisibility() {
        const box = this.getBox();
        if (!box) return;
        if (window.getComputedStyle(box).display !== 'none') this.hideBox();
        else this.showBox();
    }

    showBox() {
        const box = this.getBox();
        if (!box) return;
        this.render();
        box.style.display = 'block';
        this.bringToFront();
        box.style.opacity = '0';
        box.style.transform = 'translate(-50%, -50%) translateY(-10px) scale(0.95)';
        void box.offsetHeight;
        requestAnimationFrame(() => {
            box.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            box.style.opacity = '1';
            box.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    hideBox() {
        const box = this.getBox();
        if (!box) return;
        box.style.opacity = '0';
        box.style.transform = 'translate(-50%, -50%) translateY(-10px) scale(0.95)';
        setTimeout(() => { box.style.display = 'none'; }, 400);
    }
}

window.CalendarPanelClass = CalendarPanel;

const initCalendar = () => { window.CalendarPanel = new CalendarPanel(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCalendar);
else initCalendar();

window.openCalendarWindow = () => window.CalendarPanel?.toggleVisibility();
