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
                    el.textContent = '0:00';
                    localStorage.removeItem(storageKey);
                    return;
                }
                const seconds = Math.ceil(remaining / 1000);
                el.textContent = `${seconds}s`;

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
