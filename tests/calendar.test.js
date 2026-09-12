/**
 * Calendar panel – month grid, events, navigation, badges, stacking
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';

const calendarDom = () => `
    <div id="calendar-box" style="display: none;">
        <button id="calendar-box-close"></button>
        <button id="calendar-prev" type="button">‹</button>
        <span id="calendar-box-title"></span>
        <button id="calendar-next" type="button">›</button>
        <div id="calendar-weekdays"></div>
        <div id="calendar-grid"></div>
    </div>
`;

describe('CalendarPanel', () => {
    beforeAll(async () => {
        window.matchMedia = window.matchMedia || (() => ({
            matches: false,
            addListener() {},
            removeListener() {},
        }));
        document.body.innerHTML = calendarDom();
        await import('../core/env.js');
        await import('../applications/calendar/calendar-events.js');
        await import('../applications/calendar/calendar.js');
    });

    beforeEach(() => {
        document.body.innerHTML = calendarDom();
        window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
        window.I18n = undefined;
        delete window.bringToFront;
        delete window.WindowManager;
        vi.stubGlobal('requestAnimationFrame', (cb) => cb());
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-09-13T12:00:00'));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('renders the current month grid with events inside day cells', () => {
        const panel = new window.CalendarPanelClass();
        expect(document.getElementById('calendar-box').style.display).toBe('none');
        panel.showBox();
        expect(document.getElementById('calendar-box').style.display).toBe('block');
        expect(document.getElementById('calendar-box-title').textContent).toContain('september');
        expect(document.getElementById('calendar-box-title').textContent).toContain('2026');
        expect(document.querySelectorAll('.calendar-day:not(.calendar-day-empty)').length).toBe(30);
        expect(document.querySelector('.calendar-day-today')).toBeTruthy();
        const newMoon = document.querySelector('.calendar-day-new-moon .calendar-day-event-new-moon');
        const fullMoon = document.querySelector('.calendar-day-full-moon .calendar-day-event-full-moon');
        const post = document.querySelector('.calendar-day-post .calendar-day-event-post');
        expect(newMoon?.querySelector('.calendar-day-event-text')?.textContent).toMatch(/new moon/i);
        expect(newMoon?.querySelector('.calendar-day-event-icon')?.textContent).toBeTruthy();
        expect(fullMoon?.querySelector('.calendar-day-event-text')?.textContent).toMatch(/full moon/i);
        expect(post?.querySelector('.calendar-day-event-text')?.textContent).toMatch(/new post/i);
    });

    it('starts minimized on load', () => {
        new window.CalendarPanelClass();
        expect(document.getElementById('calendar-box').style.display).toBe('none');
    });

    it('navigates months with prev and next arrows', () => {
        const panel = new window.CalendarPanelClass();
        panel.showBox();
        expect(document.getElementById('calendar-box-title').textContent).toContain('september');
        expect(document.querySelector('.calendar-day-new-moon')).toBeTruthy();

        document.getElementById('calendar-next').click();
        expect(document.getElementById('calendar-box-title').textContent).toContain('october');
        expect(document.getElementById('calendar-box-title').textContent).toContain('2026');
        expect(document.querySelectorAll('.calendar-day:not(.calendar-day-empty)').length).toBe(31);
        expect(document.querySelector('.calendar-day-new-moon')).toBeNull();

        document.getElementById('calendar-prev').click();
        expect(document.getElementById('calendar-box-title').textContent).toContain('september');
        expect(document.querySelector('.calendar-day-new-moon')).toBeTruthy();

        document.getElementById('calendar-prev').click();
        expect(document.getElementById('calendar-box-title').textContent).toContain('august');
        expect(document.getElementById('calendar-box-title').textContent).toContain('2026');
    });

    it('shiftMonth crosses year boundaries', () => {
        const panel = new window.CalendarPanelClass();
        panel.viewDate = new Date(2026, 11, 1);
        panel.shiftMonth(1);
        expect(document.getElementById('calendar-box-title').textContent).toContain('january');
        expect(document.getElementById('calendar-box-title').textContent).toContain('2027');
        panel.shiftMonth(-1);
        expect(document.getElementById('calendar-box-title').textContent).toContain('december');
        expect(document.getElementById('calendar-box-title').textContent).toContain('2026');
    });

    it('showBox and pointerdown bring the calendar to the front', () => {
        const bringToFront = vi.fn();
        window.bringToFront = bringToFront;
        const panel = new window.CalendarPanelClass();
        panel.showBox();
        expect(bringToFront).toHaveBeenCalledWith(document.getElementById('calendar-box'));

        bringToFront.mockClear();
        document.getElementById('calendar-box').dispatchEvent(new Event('pointerdown'));
        expect(bringToFront).toHaveBeenCalledWith(document.getElementById('calendar-box'));
    });

    it('bringToFront falls back to WindowManager when global helper is missing', () => {
        window.WindowManager = { bringToFront: vi.fn() };
        const panel = new window.CalendarPanelClass();
        panel.bringToFront();
        expect(window.WindowManager.bringToFront).toHaveBeenCalledWith(document.getElementById('calendar-box'));
    });

    it('bringToFront no-ops when the box is missing', () => {
        document.body.innerHTML = '';
        const panel = new window.CalendarPanelClass();
        expect(() => panel.bringToFront()).not.toThrow();
    });

    it('shows event count on dock and menu badges', () => {
        document.body.innerHTML = `
            <div id="calendar-box" style="display: none;">
                <button id="calendar-box-close"></button>
                <button id="calendar-prev" type="button">‹</button>
                <span id="calendar-box-title"></span>
                <button id="calendar-next" type="button">›</button>
                <div id="calendar-weekdays"></div>
                <div id="calendar-grid"></div>
            </div>
            <span id="calendar-count-badge" style="display: none;">0</span>
            <span id="calendar-menu-count" style="display: none;">0</span>
        `;
        const panel = new window.CalendarPanelClass();
        expect(document.getElementById('calendar-count-badge').style.display).toBe('flex');
        expect(document.getElementById('calendar-count-badge').textContent).toBe('3');
        expect(document.getElementById('calendar-menu-count').style.display).toBe('flex');
        expect(document.getElementById('calendar-menu-count').textContent).toBe('3');
        expect(panel.getEventCount()).toBe(3);
    });

    it('caps badge text at 99+ and hides badges when empty', () => {
        document.body.innerHTML = `
            ${calendarDom()}
            <span id="calendar-count-badge" style="display: none;">0</span>
            <span id="calendar-menu-count" style="display: none;">0</span>
        `;
        const panel = new window.CalendarPanelClass();
        panel.updateBadge(120);
        expect(document.getElementById('calendar-count-badge').textContent).toBe('99+');
        expect(document.getElementById('calendar-count-badge').style.display).toBe('flex');
        panel.updateBadge(0);
        expect(document.getElementById('calendar-count-badge').style.display).toBe('none');
        expect(document.getElementById('calendar-menu-count').style.display).toBe('none');
    });

    it('uses I18n labels and re-renders on localechange', () => {
        window.I18n = {
            t: (key) => ({
                'calendar.month.9': '9がつ',
                'calendar.weekday.sun': '日',
                'calendar.event.newMoon': 'しんげつ',
                'calendar.event.fullMoon': 'まんげつ',
                'calendar.event.newPost': 'あたらしい投稿'
            }[key] || key)
        };
        const panel = new window.CalendarPanelClass();
        panel.showBox();
        expect(document.getElementById('calendar-box-title').textContent).toContain('9がつ');
        expect(document.querySelector('.calendar-weekday')?.textContent).toBe('日');
        expect(document.querySelector('.calendar-day-new-moon .calendar-day-event-text')?.textContent).toBe('しんげつ');

        window.I18n = {
            t: (key) => ({
                'calendar.month.9': 'september',
                'calendar.weekday.sun': 's',
                'calendar.event.newMoon': 'new moon',
                'calendar.event.fullMoon': 'full moon',
                'calendar.event.newPost': 'new post'
            }[key] || key)
        };
        document.dispatchEvent(new CustomEvent('localechange', { detail: { locale: 'en' } }));
        expect(document.getElementById('calendar-box-title').textContent).toContain('september');
    });

    it('falls back to default event icon for unknown types', () => {
        const panel = new window.CalendarPanelClass();
        expect(panel.eventIcon('unknown')).toBe('\u2022');
        expect(panel.eventIcon('new-moon')).toBe('\u25CF');
        expect(panel.eventIcon('full-moon')).toBe('\u25CB');
        expect(panel.eventIcon('post')).toBe('\u270E');
    });

    it('isMobile follows matchMedia', () => {
        window.matchMedia = () => ({ matches: true, addListener() {}, removeListener() {} });
        const panel = new window.CalendarPanelClass();
        expect(panel.isMobile()).toBe(true);
        delete window.matchMedia;
        expect(panel.isMobile()).toBe(false);
    });

    it('close button and Escape hide the box', () => {
        const panel = new window.CalendarPanelClass();
        document.getElementById('calendar-box-close').click();
        vi.advanceTimersByTime(400);
        expect(document.getElementById('calendar-box').style.display).toBe('none');

        panel.showBox();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        vi.advanceTimersByTime(400);
        expect(document.getElementById('calendar-box').style.display).toBe('none');
    });

    it('toggleVisibility shows and hides the box', () => {
        const panel = new window.CalendarPanelClass();
        expect(document.getElementById('calendar-box').style.display).toBe('none');
        panel.toggleVisibility();
        expect(document.getElementById('calendar-box').style.display).toBe('block');
        panel.toggleVisibility();
        vi.advanceTimersByTime(400);
        expect(document.getElementById('calendar-box').style.display).toBe('none');
    });

    it('openCalendarWindow toggles the panel', () => {
        const panel = new window.CalendarPanelClass();
        window.CalendarPanel = panel;
        const spy = vi.spyOn(panel, 'toggleVisibility');
        window.openCalendarWindow();
        expect(spy).toHaveBeenCalled();
    });

    it('openCalendarWindow no-ops when the panel is missing', () => {
        window.CalendarPanel = undefined;
        expect(() => window.openCalendarWindow()).not.toThrow();
    });

    it('exposes CALENDAR_EVENTS with moon and post markers', () => {
        expect(window.CALENDAR_EVENTS).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ date: '2026-09-10', type: 'new-moon' }),
                expect.objectContaining({ date: '2026-09-25', type: 'post' }),
                expect.objectContaining({ date: '2026-09-26', type: 'full-moon' })
            ])
        );
    });
});
