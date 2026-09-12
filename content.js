const DEFAULT_LIGHT = '#eae9d2';
const DEFAULT_DARK = '#4b7399';

function getBoardCSS(lightHex, darkHex) {
  const lightEncoded = encodeURIComponent(lightHex);
  const darkEncoded = encodeURIComponent(darkHex);

  const svgDataUri = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect x="0" y="0" width="1" height="1" fill="${lightEncoded}"/><rect x="1" y="0" width="1" height="1" fill="${darkEncoded}"/><rect x="0" y="1" width="1" height="1" fill="${darkEncoded}"/><rect x="1" y="1" width="1" height="1" fill="${lightEncoded}"/></svg>`;

  return `
    body .cg-wrap cg-board::before,
    body cg-board::before,
    body .cg-wrap::before,
    body main cg-board::before {
      background-image: url('${svgDataUri}') !important;
      background-size: 25% 25% !important;
      background-repeat: repeat !important;
      opacity: 1 !important;
    }
  `;
}

function applyStyles(lightHex, darkHex) {
  let styleEl = document.getElementById('custom-lichess-board-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-lichess-board-style';
    (document.head || document.documentElement).appendChild(styleEl);
  }
  styleEl.textContent = getBoardCSS(lightHex, darkHex);
}

// Apply saved or default styles on initial page load
chrome.storage.local.get(['lightColor', 'darkColor'], (data) => {
  const light = data.lightColor || DEFAULT_LIGHT;
  const dark = data.darkColor || DEFAULT_DARK;
  applyStyles(light, dark);
});

// Listen for instant messages from popup.js
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "UPDATE_BOARD") {
    applyStyles(request.lightColor, request.darkColor);
  }
});
