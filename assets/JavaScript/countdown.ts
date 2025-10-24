/**
 * Parst einen ISO‑8601-Dauerstring (z. B. "PT2H30M" oder "P1DT10M") in Millisekunden.
 * Unterstützt Tage, Stunden, Minuten und Sekunden.
 *
 * @param {string} iso - ISO‑8601-Dauerstring, beginnend mit 'P'.
 * @returns {number} Dauer in Millisekunden.
 * @throws {Error} Wenn der String ungültig oder nicht unterstützt ist.
 */
export function parseISODuration(iso: string): number {
    if (typeof iso !== 'string' || !iso.startsWith('P')) {
        throw new Error('Invalid ISO-8601 duration');
    }

    const re = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i;
    const m = iso.match(re);
    if (!m) {
        throw new Error('Unsupported ISO-8601 duration format');
    }

    const days = m[1] ? Number(m[1]) : 0;
    const hours = m[2] ? Number(m[2]) : 0;
    const minutes = m[3] ? Number(m[3]) : 0;
    const seconds = m[4] ? Number(m[4]) : 0;

    return ((((days * 24 + hours) * 60 + minutes) * 60) + seconds) * 1000;
}

/**
 * Fügt führende Nullen zu einstelligen Zahlen hinzu.
 *
 * @param {number} n - Zahl, die formatiert werden soll.
 * @returns {string} Zweistellige Zeichenkette (z. B. "09").
 */
function pad2(n: number): string { return String(n).padStart(2, '0'); }

/**
 * Zerlegt eine Millisekundendauer in Tage, Stunden, Minuten und Sekunden.
 *
 * @param {number} ms - Dauer in Millisekunden.
 * @returns {{days: number, hours: number, minutes: number, seconds: number, totalHours: number}}
 *   Objekt mit den aufgeschlüsselten Zeitanteilen.
 */
function breakdown(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return { days, hours, minutes, seconds, totalHours };
}

/**
 * Formatiert eine Zeitdauer in verschiedene Ausgabeformate (z. B. "HH:MM:SS" oder "DDd HH:MM:SS").
 *
 * @param {number} ms - Dauer in Millisekunden.
 * @param {string} [mode='hms'] - Formatmodus ("hms" oder "auto").
 * @returns {string} Formatierte Dauer als Text.
 */
function formatDuration(ms: number, mode: string = 'hms'): string {
    const { days, hours, minutes, seconds, totalHours } = breakdown(ms);
    if (mode === 'auto') {
        if (days > 0) return `${days}d ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
        return `${pad2(totalHours)}:${pad2(minutes)}:${pad2(seconds)}`;
    }
    // Default: hms (Gesamtstunden)
    return `${pad2(totalHours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

/**
 * Initialisiert und steuert alle Countdown-Elemente auf der Seite.
 *
 * Liest die Konfiguration über data-Attribute aus und unterscheidet zwei Modi:
 * - visit: Relativer Countdown ab Seitenbesuch mit Speicherung im localStorage.
 * - deadline: Absoluter Countdown bis zu einem festen Zeitpunkt.
 *
 * @example
 * <span data-countdown data-mode="visit" data-duration="PT20M"></span>
 * @example
 * <span data-countdown data-mode="deadline" data-end-at="2025-12-31T23:59:59Z"></span>
 */
export function countdown() {
    // Hilfsfunktion, um data-* Attribute auszulesen
    function getData(el: HTMLElement, name: string) {
        return el.getAttribute(`data-${name}`) ?? el.dataset[name] ?? null;
    }

    // Alle Elemente mit data-countdown selektieren
    const nodes = document.querySelectorAll<HTMLElement>('[data-countdown]');

    // Schleife über alle Elemente und data-mode, data-duration, data-format ausgeben
    nodes.forEach((el, idx) => {
        const id = getData(el, 'id') ?? 'unknown';
        const mode = getData(el, 'mode');

        if (mode === 'visit') {
            const durationStr = getData(el, 'duration');
            const format = getData(el, 'format') || 'hms';
            if (!durationStr) return;

            const durationMs = parseISODuration(durationStr);
            const storageKey = `countdown::${id}::endAt`;
            let endAt = parseInt(localStorage.getItem(storageKey) || '0', 10);
            if (!endAt || isNaN(endAt) || endAt < Date.now()) {
                endAt = Date.now() + durationMs;
                localStorage.setItem(storageKey, String(endAt));
            }

            let timeout: number | undefined;

            function render(now: number) {
                const remaining = endAt - now;
                if (remaining <= 0) {
                    if (timeout) clearTimeout(timeout);
                    el.textContent = formatDuration(0, format);
                    localStorage.removeItem(storageKey);
                    return;
                }
                const seconds = Math.ceil(remaining / 1000);
                const formatted = formatDuration(remaining + 999, format);
                el.textContent = formatted;

                const nextDelay = remaining - (seconds - 1) * 1000;
                const delay = Math.max(50, Math.min(1000, nextDelay));
                timeout = window.setTimeout(() => render(Date.now()), delay);
            }

            render(Date.now());

            const onVis = () => {
                if (!document.hidden) {
                    if (timeout) clearTimeout(timeout);
                    render(Date.now());
                }
            };
            document.addEventListener('visibilitychange', onVis);
        } else if (mode === 'deadline') {
            const endAtStr = getData(el, 'end-at');
            const format = getData(el, 'format') || 'hms';
            if (!endAtStr) {
                console.warn(`countdown[${idx}] id=${id} fehlendes data-end-at`);
                return;
            }
            const endAt = Date.parse(endAtStr);
            if (Number.isNaN(endAt)) {
                console.warn(`countdown[${idx}] id=${id} ungültiges data-end-at=${endAtStr}`);
                el.setAttribute('data-error', 'invalid-endAt');
                return;
            }

            let timeout: number | undefined;

            function render(nowMs: number) {
                const remaining = endAt - nowMs;
                if (remaining <= 0) {
                    if (timeout) clearTimeout(timeout);
                    el.textContent = formatDuration(0, format);
                    return;
                }
                const seconds = Math.ceil(remaining / 1000);
                el.textContent = formatDuration(remaining + 999, format);
                const nextDelay = remaining - (seconds - 1) * 1000;
                const delay = Math.max(50, Math.min(1000, nextDelay));
                timeout = window.setTimeout(() => render(Date.now()), delay);
            }

            render(Date.now());

            const onVis = () => {
                if (!document.hidden) {
                    if (timeout) clearTimeout(timeout);
                    render(Date.now());
                }
            };
            document.addEventListener('visibilitychange', onVis);
        } else {
            console.warn(`countdown[${idx}] id=${id} unbekannter mode=${mode}`);
        }
    });
}