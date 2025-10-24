function pad2(n: number): string { return String(n).padStart(2, '0'); }
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

// Schritt 1: Einfaches Format "hms" und "auto"
function formatDuration(ms: number, mode: string = 'hms'): string {
  const { days, hours, minutes, seconds, totalHours } = breakdown(ms);
  if (mode === 'auto') {
    if (days > 0) return `${days}d ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
    return `${pad2(totalHours)}:${pad2(minutes)}:${pad2(seconds)}`;
  }
  // Default: hms (Gesamtstunden)
  return `${pad2(totalHours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

// countdown.ts
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
            const endAt = getData(el, 'end-at');
            console.log(`countdown[${idx}] id=${id} mode=deadline endAt=${endAt}`);
        } else {
            console.warn(`countdown[${idx}] id=${id} unbekannter mode=${mode}`);
        }
    });
}

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
