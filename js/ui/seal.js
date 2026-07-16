/* ============================================================
   SEAL EMBLEM
   The signature visual element — an official-looking wax/ink
   seal used on the landing hero, topbar, processing screen,
   and stamped onto the result certificate.
   ============================================================ */

export function sealSVG(idSuffix = '') {
  const uid = `seal-${idSuffix || Math.random().toString(36).slice(2, 8)}`;
  return `
  <svg viewBox="0 0 100 100" role="img" aria-label="Bureau seal">
    <circle class="seal-ring" cx="50" cy="50" r="46" />
    <circle class="seal-ring-inner" cx="50" cy="50" r="38" />
    <path id="${uid}-top" d="M 50 12 A 38 38 0 0 1 88 50" fill="none" />
    <path id="${uid}-bot" d="M 12 50 A 38 38 0 0 1 50 88" fill="none" />
    <text class="seal-text">
      <textPath href="#${uid}-top" startOffset="2">BUREAU OF MATRIMONIAL</textPath>
    </text>
    <g class="seal-glyph" transform="translate(50 50)">
      <path d="M0,-20 L5,-6 L20,-6 L8,3 L13,17 L0,8 L-13,17 L-8,3 L-20,-6 L-5,-6 Z" transform="scale(0.85)" />
    </g>
    <text class="seal-text" text-anchor="middle" x="50" y="76">EST. FICTIONAL</text>
  </svg>`;
}
