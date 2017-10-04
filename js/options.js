function saveSettings() {
  const entered = document.getElementById('tlang').value;
  if (entered) {
    localStorage.settings = JSON.stringify({translation_lang: entered});
  }
}

function startup() {
  const stored = localStorage.settings
  try {
    const settings = JSON.parse(stored);
    if (settings.translation_lang) {
      document.getElementById('tlang').value = settings.translation_lang; 
    }
  } catch (e) {
    localStorage.settings = JSON.stringify({translation_lang: 'English'});
  }
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
}

window.addEventListener('load', startup);