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

      const minutes = parseInt(durationStr.replace(/[^0-9]/g, ''), 10);
      const durationMs = minutes * 60 * 1000;
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
          el.textContent = 'abgelaufen';
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