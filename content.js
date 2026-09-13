const DEFAULT_LIGHT = '#eae9d2';
const DEFAULT_DARK = '#4b7399';
const DEFAULT_HIGHLIGHT = '#faf';
const DEFAULT_ARROW = '#ffaa00';
const DEFAULT_MOVE_DEST = '#14551e';

// Opacity configuration variables (tweak these anytime)
const MOVE_DOT_OPACITY = 0.45;
const ATTACK_TARGET_OPACITY = MOVE_DOT_OPACITY-0.2;
const HOVER_OPACITY = 0.35;
const ATTACK_HOVER_OPACITY = HOVER_OPACITY-0.2;
const SELECTED_OPACITY = 0.45;

const pieceSelectors = {
  wP: 'body cg-board piece.white.pawn, body piece.white.pawn',
  wN: 'body cg-board piece.white.knight, body piece.white.knight',
  wB: 'body cg-board piece.white.bishop, body piece.white.bishop',
  wR: 'body cg-board piece.white.rook, body piece.white.rook',
  wQ: 'body cg-board piece.white.queen, body piece.white.queen',
  wK: 'body cg-board piece.white.king, body piece.white.king',
  bP: 'body cg-board piece.black.pawn, body piece.black.pawn',
  bN: 'body cg-board piece.black.knight, body piece.black.knight',
  bB: 'body cg-board piece.black.bishop, body piece.black.bishop',
  bR: 'body cg-board piece.black.rook, body piece.black.rook',
  bQ: 'body cg-board piece.black.queen, body piece.black.queen',
  bK: 'body cg-board piece.black.king, body piece.black.king'
};

function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(20, 85, 30, ${alpha})`;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  if (c.length !== 6) return `rgba(20, 85, 30, ${alpha})`;
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}

function getBoardCSS(lightHex, darkHex, highlightHex, arrowHex, moveDestHex, pieces = {}) {
  const lightEncoded = encodeURIComponent(lightHex);
  const darkEncoded = encodeURIComponent(darkHex);
  const encodedMoveDest = encodeURIComponent(moveDestHex);

  const destHover = hexToRgba(moveDestHex, HOVER_OPACITY);
  const destHoverAttack = hexToRgba(moveDestHex, ATTACK_HOVER_OPACITY);
  const destSelected = hexToRgba(moveDestHex, SELECTED_OPACITY);

  const moveDotSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="11" fill="${encodedMoveDest}" fill-opacity="${MOVE_DOT_OPACITY}"/></svg>`;

  const captureCornerSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path fill="${encodedMoveDest}" fill-opacity="${ATTACK_TARGET_OPACITY}" d="M 0,0 L 20,0 L 0,20 Z M 100,0 L 80,0 L 100,20 Z M 0,100 L 20,100 L 0,80 Z M 100,100 L 80,100 L 100,80 Z"/></svg>`;

  const svgDataUri = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect x="0" y="0" width="1" height="1" fill="${lightEncoded}"/><rect x="1" y="0" width="1" height="1" fill="${darkEncoded}"/><rect x="0" y="1" width="1" height="1" fill="${darkEncoded}"/><rect x="1" y="1" width="1" height="1" fill="${lightEncoded}"/></svg>`;

  let css = `
    :root, body, .cg-wrap, cg-board {
      --cg-color-light: ${lightHex} !important;
      --cg-color-dark: ${darkHex} !important;
      --cg-color-dest: ${moveDestHex} !important;
    }

    body cg-board,
    body .cg-wrap cg-board {
      background-image: url('${svgDataUri}') !important;
      background-size: 25% 25% !important;
      background-repeat: repeat !important;
      background-position: top left !important;
    }

    body cg-board::before,
    body .cg-wrap::before,
    body .cg-wrap cg-board::before,
    body main cg-board::before {
      display: none !important;
      background: none !important;
    }

    body cg-board square {
      background-color: transparent !important;
    }

    body cg-board square.selected {
      background-color: ${destSelected} !important;
    }

    body cg-board square.last-move {
      background-color: ${highlightHex} !important;
      opacity: 0.8 !important;
    }

    body cg-board square.move-dest,
    body cg-board square.premove-dest {
      background: none !important;
    }

    body cg-board square.move-dest::before,
    body cg-board square.premove-dest::before,
    body cg-board square.occurs::before,
    body cg-board square.oc::before {
      content: '' !important;
      display: block !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      pointer-events: none !important;
      border-radius: 0 !important;
      background: none !important;
    }

    body cg-board square.move-dest:not(.oc):not(.occurs):not(:has(piece))::before,
    body cg-board square.premove-dest:not(.oc):not(.occurs):not(:has(piece))::before {
      background: url('${moveDotSvg}') center / 100% 100% no-repeat transparent !important;
    }

    body cg-board square.move-dest:not(.oc):not(.occurs):not(:has(piece)):hover::before,
    body cg-board square.premove-dest:not(.oc):not(.occurs):not(:has(piece)):hover::before {
      background: url('${moveDotSvg}') center / 100% 100% no-repeat ${destHover} !important;
    }

    body cg-board square.oc,
    body cg-board square.occurs,
    body cg-board square.move-dest.oc,
    body cg-board square.move-dest.occurs,
    body cg-board square.premove-dest.oc,
    body cg-board square.premove-dest.occurs {
      background: url('${captureCornerSvg}') center / 100% 100% no-repeat transparent !important;
    }

    body cg-board square.oc.move-dest::before,
    body cg-board square.occurs.move-dest::before,
    body cg-board square.oc::before,
    body cg-board square.occurs::before {
      background: url('${captureCornerSvg}') center / 100% 100% no-repeat transparent !important;
    }

    body cg-board square.oc:hover,
    body cg-board square.occurs:hover,
    body cg-board square.move-dest.oc:hover,
    body cg-board square.move-dest.occurs:hover,
    body cg-board square.premove-dest.oc:hover,
    body cg-board square.premove-dest.occurs:hover,
    body cg-board square.oc.move-dest:hover::before,
    body cg-board square.occurs.move-dest:hover::before,
    body cg-board square.oc:hover::before,
    body cg-board square.occurs:hover::before {
      background: url('${captureCornerSvg}') center / 100% 100% no-repeat ${destHoverAttack} !important;
    }

    body cg-container svg.cg-shapes [stroke],
    body cg-board svg.cg-shapes [stroke] {
      stroke: ${arrowHex} !important;
    }

    body cg-container svg.cg-shapes [fill]:not([fill="none"]),
    body cg-board svg.cg-shapes [fill]:not([fill="none"]),
    body cg-container svg.cg-shapes marker path,
    body cg-board svg.cg-shapes marker path {
      fill: ${arrowHex} !important;
    }

    body cg-container svg.cg-shapes circle,
    body cg-board svg.cg-shapes circle {
      fill: none !important;
      stroke-width: 0.08 !important;
    }

    body cg-container svg.cg-shapes g path[stroke-width],
    body cg-board svg.cg-shapes g path[stroke-width] {
      stroke-width: 0.12 !important;
    }

    body cg-container svg.cg-shapes marker,
    body cg-board svg.cg-shapes marker {
      transform: scale(0.65) !important;
      transform-origin: center !important;
    }

    body cg-board piece.ghost {
      opacity: 0 !important;
    }
  `;

  Object.keys(pieceSelectors).forEach(key => {
    if (pieces[key]) {
      css += `
        ${pieceSelectors[key]} {
          background-image: url('${pieces[key]}') !important;
        }
      `;
    }
  });

  return css;
}

function applyStyles(lightHex, darkHex, highlightHex, arrowHex, moveDestHex, pieces) {
  let styleEl = document.getElementById('custom-lichess-board-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-lichess-board-style';
    (document.head || document.documentElement).appendChild(styleEl);
  }
  styleEl.textContent = getBoardCSS(lightHex, darkHex, highlightHex, arrowHex, moveDestHex, pieces);
}

chrome.storage.local.get(['lightColor', 'darkColor', 'highlightColor', 'arrowColor', 'moveDestColor', 'pieces'], (data) => {
  const light = data.lightColor || DEFAULT_LIGHT;
  const dark = data.darkColor || DEFAULT_DARK;
  const highlight = data.highlightColor || DEFAULT_HIGHLIGHT;
  const arrow = data.arrowColor || DEFAULT_ARROW;
  const moveDest = data.moveDestColor || DEFAULT_MOVE_DEST;
  const pieces = data.pieces || {};
  applyStyles(light, dark, highlight, arrow, moveDest, pieces);
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "UPDATE_BOARD") {
    applyStyles(
      request.lightColor,
      request.darkColor,
      request.highlightColor,
      request.arrowColor,
      request.moveDestColor,
      request.pieces
    );
  }
});