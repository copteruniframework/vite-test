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
    const duration = getData(el, 'duration');
    const format = getData(el, 'format');
    console.log(`countdown[${idx}] id=${id} mode=${mode} duration=${duration} format=${format}`);
  });
}