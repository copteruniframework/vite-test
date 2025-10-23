// countdown.ts
export function countdown() {
  // Alle Elemente mit data-countdown selektieren
  const nodes = document.querySelectorAll<HTMLElement>('[data-countdown]');

  // Schleife über alle Elemente und data-mode ausgeben
  nodes.forEach((el, idx) => {
    const mode = el.getAttribute('data-mode') ?? (el.dataset as any).mode ?? null;
    console.log(`countdown[${idx}] mode=`, mode);
  });
}