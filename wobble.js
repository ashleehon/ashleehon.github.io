/* ---------------------------------------------------------------------------
   Wobbling rules.

   The grid's lines are CSS borders, which are the honest way to draw them: they
   print, they survive this file failing to load, and they need no script to
   hold the layout together. What they cannot do is bend. So where a cursor is
   available, this hides the border colours — the 1px they occupy stays, so
   nothing shifts — and redraws the same lines as SVG paths, which can.

   A line struck by the cursor is displaced away from it and then oscillates
   back to rest, like a plucked wire. The ripple is local: it fades along the
   line either side of the cursor rather than swinging the whole length.

   Bows out entirely, leaving plain borders, when there is no fine pointer to
   follow or the reader has asked for reduced motion.
   --------------------------------------------------------------------------- */

(() => {
  'use strict';

  const grid = document.querySelector('.grid');
  if (!grid || !window.matchMedia || !window.ResizeObserver) return;
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const REACH = 95;     // how near the cursor must pass before a line reacts
  const AMP = 7;        // px of displacement at the closest approach
  const WAVE = 74;      // px per full oscillation along the line
  const SPREAD = 100;   // px over which the ripple fades out along the line
  /* A heavy, slack line rather than a taut one: about 1.5 swings a second,
     taking a second and a half to come to rest. DECAY and FLOOR set that tail
     between them, so slowing one without loosening the other just cuts the
     movement off early. */
  const DECAY = 0.955;  // share of the amplitude kept each frame
  const SPIN = 0.16;    // radians the wave advances each frame
  const STEP = 5;       // px between sampled points inside the ripple
  const FLOOR = 0.1;    // amplitude at which a line counts as back at rest
  const TAU = Math.PI * 2;
  const SIDE = { top: 'Top', right: 'Right', bottom: 'Bottom', left: 'Left' };
  const NS = 'http://www.w3.org/2000/svg';

  /* Deliberately no viewBox and no width/height: CSS sizes the overlay to the
     grid, so one user unit is one CSS pixel and no scaling can creep in. */
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'wobble-layer');
  svg.setAttribute('aria-hidden', 'true');

  const specs = [
    [grid, 'left', 0],
    [grid, 'right', 0],
    [grid, 'bottom', 0],
    [document.querySelector('.masthead > .label'), 'right', 0],
  ];

  for (const block of document.querySelectorAll('.block')) {
    specs.push([block, 'top', 0]);
    const label = block.querySelector(':scope > .label');
    /* Beside its content a label divides vertically; stacked above it, the same
       rule is a bottom border in the softer tier. Only one of the pair ever
       carries a width, and measuring is what decides which. */
    specs.push([label, 'right', 0], [label, 'bottom', 1]);
  }

  const lines = [];
  for (const [el, edge, soft] of specs) {
    if (!el) continue;
    const path = document.createElementNS(NS, 'path');
    if (soft) path.setAttribute('class', 'soft');
    svg.appendChild(path);
    lines.push({ el, edge, path, drawn: false, amp: 0, dir: 1, pos: 0, phase: 0, live: false });
  }

  grid.appendChild(svg);
  document.documentElement.classList.add('js-lines');

  const n = (v) => Math.round(v * 100) / 100;

  function flat(l) {
    return l.down
      ? `M${n(l.x)} ${n(l.y)}V${n(l.y + l.len)}`
      : `M${n(l.x)} ${n(l.y)}H${n(l.x + l.len)}`;
  }

  function rippled(l) {
    const from = Math.max(0, l.pos - 3 * SPREAD);
    const to = Math.min(l.len, l.pos + 3 * SPREAD);
    let d = l.down
      ? `M${n(l.x)} ${n(l.y)}V${n(l.y + from)}`
      : `M${n(l.x)} ${n(l.y)}H${n(l.x + from)}`;

    for (let s = from; s <= to; s += STEP) {
      const k = (s - l.pos) / SPREAD;
      const off = l.dir * l.amp *
        Math.cos(((s - l.pos) / WAVE) * TAU + l.phase) *
        Math.exp(-k * k);
      d += l.down
        ? `L${n(l.x + off)} ${n(l.y + s)}`
        : `L${n(l.x + s)} ${n(l.y + off)}`;
    }

    return d + (l.down ? `V${n(l.y + l.len)}` : `H${n(l.x + l.len)}`);
  }

  /* Everything is measured against the overlay's own box rather than the grid's,
     so the grid's borders and any future padding cannot put the paths a pixel
     out from the borders they stand in for. */
  function measure() {
    const box = svg.getBoundingClientRect();

    for (const l of lines) {
      const style = getComputedStyle(l.el);
      const weight = parseFloat(style[`border${SIDE[l.edge]}Width`]) || 0;
      l.on = weight > 0 && style.display !== 'none';
      if (!l.on) {
        if (l.drawn) { l.path.removeAttribute('d'); l.drawn = false; }
        continue;
      }

      /* A border is drawn inside its element's box, so the line to match runs
         down the middle of the width that border occupies. */
      const r = l.el.getBoundingClientRect();
      const half = weight / 2;
      l.down = l.edge === 'left' || l.edge === 'right';
      if (l.down) {
        l.x = (l.edge === 'left' ? r.left + half : r.right - half) - box.left;
        l.y = r.top - box.top;
        l.len = r.height;
      } else {
        l.x = r.left - box.left;
        l.y = (l.edge === 'top' ? r.top + half : r.bottom - half) - box.top;
        l.len = r.width;
      }

      l.path.setAttribute('d', l.live ? rippled(l) : flat(l));
      l.drawn = true;
    }
  }

  let pointer = null;
  let running = false;

  function strike() {
    if (!pointer) return;
    /* Scrolling moves the overlay under a stationary cursor, so its position is
       worth re-reading rather than caching. */
    const box = svg.getBoundingClientRect();
    const px = pointer.x - box.left;
    const py = pointer.y - box.top;
    pointer = null;

    for (const l of lines) {
      if (!l.on) continue;
      const along = l.down ? py - l.y : px - l.x;
      if (along < -REACH || along > l.len + REACH) continue;
      const across = l.down ? px - l.x : py - l.y;
      if (Math.abs(across) > REACH) continue;

      /* The ripple follows the cursor along the line while it stays in range,
         and is pushed to whichever side the cursor is not on. */
      l.pos = Math.min(Math.max(along, 0), l.len);
      l.dir = across > 0 ? -1 : 1;
      l.amp = Math.max(l.amp, (1 - Math.abs(across) / REACH) * AMP);
      l.live = true;
    }
  }

  function tick() {
    strike();
    let busy = false;

    for (const l of lines) {
      if (!l.on || !l.live) continue;
      l.path.setAttribute('d', rippled(l));
      l.amp *= DECAY;
      l.phase += SPIN;
      if (l.amp < FLOOR) {
        l.amp = 0;
        l.phase = 0;
        l.live = false;
        l.path.setAttribute('d', flat(l));
      } else {
        busy = true;
      }
    }

    running = busy;
    if (busy) requestAnimationFrame(tick);
  }

  addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    if (!running) { running = true; requestAnimationFrame(tick); }
  }, { passive: true });

  /* Covers the two things that move the lines: the window resizing, and a case
     study being opened or closed further up the page. */
  new ResizeObserver(measure).observe(grid);
  if (document.fonts) document.fonts.ready.then(measure);
})();
