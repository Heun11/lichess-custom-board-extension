const pieceKeys = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];

document.addEventListener('DOMContentLoaded', () => {
  const lightInput = document.getElementById('lightColor');
  const darkInput = document.getElementById('darkColor');
  const highlightInput = document.getElementById('highlightColor');
  const arrowInput = document.getElementById('arrowColor');
  const moveDestInput = document.getElementById('moveDestColor');
  const jsonBox = document.getElementById('jsonBox');

  // Populate input fields from a settings object
  function populateUI(data) {
    if (!data) return;
    if (data.lightColor) lightInput.value = data.lightColor;
    if (data.darkColor) darkInput.value = data.darkColor;
    if (data.highlightColor) highlightInput.value = data.highlightColor;
    if (data.arrowColor) arrowInput.value = data.arrowColor;
    if (data.moveDestColor) moveDestInput.value = data.moveDestColor;

    if (data.pieces) {
      pieceKeys.forEach(key => {
        const input = document.getElementById(key);
        if (input) input.value = data.pieces[key] || '';
      });
    }
  }

  // Load saved configuration when popup opens
  chrome.storage.local.get(['lightColor', 'darkColor', 'highlightColor', 'arrowColor', 'moveDestColor', 'pieces'], (data) => {
    populateUI(data);
  });

  // Save to storage & send updates to active tab
  function saveAndApply() {
    let lightVal = lightInput.value.trim();
    let darkVal = darkInput.value.trim();
    let highlightVal = highlightInput.value.trim();
    let arrowVal = arrowInput.value.trim();
    let moveDestVal = moveDestInput.value.trim();

    if (lightVal && !lightVal.startsWith('#')) lightVal = '#' + lightVal;
    if (darkVal && !darkVal.startsWith('#')) darkVal = '#' + darkVal;
    if (highlightVal && !highlightVal.startsWith('#')) highlightVal = '#' + highlightVal;
    if (arrowVal && !arrowVal.startsWith('#')) arrowVal = '#' + arrowVal;
    if (moveDestVal && !moveDestVal.startsWith('#')) moveDestVal = '#' + moveDestVal;

    const config = {
      lightColor: lightVal || '#eae9d2',
      darkColor: darkVal || '#4b7399',
      highlightColor: highlightVal || '#faf',
      arrowColor: arrowVal || '#ffaa00',
      moveDestColor: moveDestVal || '#14551e',
      pieces: {}
    };

    pieceKeys.forEach(key => {
      const input = document.getElementById(key);
      config.pieces[key] = input ? input.value.trim() : '';
    });

    // Save to extension storage
    chrome.storage.local.set(config, () => {
      // Send updates live to Lichess tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "UPDATE_BOARD",
            ...config
          }).catch(() => {
            // Suppress error if active tab isn't Lichess
          });
        }
      });
    });

    return config;
  }

  document.getElementById('saveBtn').addEventListener('click', saveAndApply);

  // EXPORT PROFILE TO TEXT BOX
  document.getElementById('exportBtn').addEventListener('click', () => {
    const currentConfig = saveAndApply();
    jsonBox.value = JSON.stringify(currentConfig, null, 2);
    jsonBox.select();
    
    // Copy directly to clipboard
    navigator.clipboard.writeText(jsonBox.value).then(() => {
      alert("Profile JSON copied to clipboard!");
    }).catch(() => {
      // Fallback if clipboard API permission is missing
    });
  });

  // LOAD PROFILE FROM TEXT BOX
  document.getElementById('importBtn').addEventListener('click', () => {
    const rawText = jsonBox.value.trim();
    if (!rawText) {
      alert("Please paste a JSON profile string into the box first.");
      return;
    }

    try {
      const importedData = JSON.parse(rawText);
      populateUI(importedData);
      saveAndApply();
      alert("Profile loaded successfully!");
    } catch (err) {
      alert("Invalid JSON code. Please double-check what you pasted.");
    }
  });
});