// plan.js - simple 2D floor plan preview from width and length. It is a sketch, not a drawing.
export function initPlan() {
  const widthInput = document.getElementById('plan-width');
  const lengthInput = document.getElementById('plan-length');
  const svgHost = document.getElementById('plan-svg');
  const areaOut = document.getElementById('plan-area');
  const perimeterOut = document.getElementById('plan-perimeter');

  const clamp = (v) => Math.min(30, Math.max(1, Number.isFinite(v) ? v : 1));
  const round1 = (n) => (Math.round(n * 10) / 10).toString();

  function draw() {
    const w = clamp(parseFloat(widthInput.value));
    const l = clamp(parseFloat(lengthInput.value));
    const scale = Math.min(300 / w, 190 / l);
    const W = w * scale;
    const L = l * scale;
    const x = (380 - W) / 2;
    const y = 30;
    const door = Math.min(W * 0.2, 36);
    svgHost.innerHTML =
      `<svg viewBox="0 0 380 ${Math.round(L + 70)}" width="100%" role="img" aria-label="Floor plan of a ${round1(w)} by ${round1(l)} metre room">` +
      `<rect x="${x}" y="${y}" width="${W}" height="${L}" fill="#f7f5f0" stroke="#111820" stroke-width="3"/>` +
      `<rect x="${x + W * 0.15}" y="${y + L - 3}" width="${door}" height="6" fill="#fff"/>` +
      `<rect x="${x + W - 3}" y="${y + L * 0.3}" width="6" height="${Math.min(L * 0.3, 44)}" fill="#D7B77B"/>` +
      `<text x="190" y="20" text-anchor="middle" font-size="13" fill="#3a444e">${round1(w)} m</text>` +
      `<text x="${x}" y="${y + L + 22}" font-size="12" fill="#3a444e">${round1(l)} m deep. Door at the bottom, window on the right.</text>` +
      `</svg>`;
    areaOut.textContent = `${round1(w * l)} m²`;
    perimeterOut.textContent = `${round1(2 * (w + l))} m`;
  }

  widthInput.addEventListener('input', draw);
  lengthInput.addEventListener('input', draw);
  draw();
}
