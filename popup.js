const DEFAULT_LIGHT = '#eae9d2';
const DEFAULT_DARK = '#4b7399';

document.addEventListener('DOMContentLoaded', () => {
  const lightInput = document.getElementById('lightColor');
  const darkInput = document.getElementById('darkColor');

  // Load saved values into inputs
  chrome.storage.local.get(['lightColor', 'darkColor'], (data) => {
    if (data.lightColor) lightInput.value = data.lightColor;
    if (data.darkColor) darkInput.value = data.darkColor;
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    let lightVal = lightInput.value.trim();
    let darkVal = darkInput.value.trim();

    // Format hex strings
    if (lightVal && !lightVal.startsWith('#')) lightVal = '#' + lightVal;
    if (darkVal && !darkVal.startsWith('#')) darkVal = '#' + darkVal;

    const finalLight = lightVal || DEFAULT_LIGHT;
    const finalDark = darkVal || DEFAULT_DARK;

    // 1. Save to storage for tab refreshes
    chrome.storage.local.set({ lightColor: finalLight, darkColor: finalDark });

    // 2. Send message directly to current tab for instant update
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "UPDATE_BOARD",
          lightColor: finalLight,
          darkColor: finalDark
        });
      }
    });
  });
});
