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
      const duration = getData(el, 'duration');
      console.log(`countdown[${idx}] id=${id} mode=visit duration=${duration}`);
    } else if (mode === 'deadline') {
      const endAt = getData(el, 'end-at');
      console.log(`countdown[${idx}] id=${id} mode=deadline endAt=${endAt}`);
    } else {
      console.warn(`countdown[${idx}] id=${id} unbekannter mode=${mode}`);
    }
  });
}