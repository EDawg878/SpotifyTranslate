let disabled = false;
let id = null;

function getTranslationLanguage() {
  const defaultLang = 'english';
  const stored = localStorage.settings
  try {
    const settings = JSON.parse(stored);
    return settings.translation_lang ?
      settings.translation_lang.toLowerCase() : defaultLang;
  } catch (e) {
    return defaultLang;
  }
};

function searchForLyrics(query) {
  const searchUrl = 'https://www.musixmatch.com/search/' + encodeURIComponent(query);
  getTab(existingTab => chrome.tabs.update(id, {url: searchUrl, active: false}),
    () => chrome.tabs.create({url: searchUrl, active: false, pinned: true}, updateTabId)
  );
}

function getTab(exists, notExists) {
  if (id) {
    chrome.tabs.get(id, tab => {
      if (chrome.runtime.lastError) {
        notExists();
      } else {
        exists(tab);
      }
    });
  } else {
    notExists();
  }
}

function updateTabId(newTab) {
  id = newTab.id;
}

function openLyrics(lyricsUrl) {
  chrome.tabs.update(id, {url: lyricsUrl, active: false});
}

function normalize(title) {
  return title.replace(/[·.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
}

function getTranslationUrl(lyricsUrl) {
  return lyricsUrl + '/translation/' + getTranslationLanguage();
}

function handleSpotify(port) {
  port.onMessage.addListener(msg => {
    if (!disabled) {
      searchForLyrics(normalize(msg.title))
    }
  });
}

function handleMusixmatch(port) {
  port.onMessage.addListener((msg, sendingPort) => {
    if (!disabled) {
      if (msg.topic === 'should_search') {
        const isCurrentTab = sendingPort.sender.tab.id === id;
        const should_search = !disabled && isCurrentTab;
        sendingPort.postMessage({should_search});
      } else if (msg.topic === 'found_lyrics') {
         openLyrics(getTranslationUrl(msg.url));
      }
    }
  });
}

function startup(first) {
  if (first) {
    chrome.runtime.onConnect.addListener(port => {
        if (port.name === 'spotify_listener') {
          handleSpotify(port);
        } else if (port.name === 'musixmatch_listener') {
          handleMusixmatch(port);
        }
      }
    );
  }
  chrome.tabs.query(
    { url: 'https://open.spotify.com/*' },
    tabs =>
      tabs.forEach(tab =>
        chrome.tabs.executeScript(tab.id, {file: 'js/spotifyListener.js'})
      )
  );
}

function closeTab() {
  getTab(tab => chrome.tabs.remove(tab.id), () => {});
}

chrome.browserAction.onClicked.addListener(() => {
  disabled = !disabled;
  if (disabled) {
    chrome.browserAction.setIcon({path: 'icon/st_red_48.png'})
    closeTab();
  } else {
    chrome.browserAction.setIcon({path: 'icon/st_green_48.png'})
    startup(false);
  }
});

startup(true);