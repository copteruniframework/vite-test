// countdown.ts
export function countdown() {
  // Alle Elemente mit data-countdown selektieren
  const nodes = document.querySelectorAll<HTMLElement>('[data-countdown]');

  // Schleife über alle Elemente und data-mode, data-duration, data-format ausgeben
  nodes.forEach((el, idx) => {
    const id = el.getAttribute('data-id') ?? (el.dataset as any).id ?? 'unknown';
    const mode = el.getAttribute('data-mode') ?? (el.dataset as any).mode ?? null;
    const duration = el.getAttribute('data-duration') ?? (el.dataset as any).duration ?? null;
    const format = el.getAttribute('data-format') ?? (el.dataset as any).format ?? null;
    console.log(`countdown[${idx}] id=${id} mode=${mode} duration=${duration} format=${format}`);
  });
}