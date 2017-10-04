const port = chrome.runtime.connect({name: 'musixmatch_listener'});
const lyricsPrefix = 'https://www.musixmatch.com/lyrics/';

function searchForLyrics() {
  const len = document.links.length;
  for (var i = 0; i < len; i++) {
    const link = document.links[i];
    if (link.href) {
      const url = link.href;
      if (url.startsWith(lyricsPrefix)) {
        port.postMessage({topic: 'found_lyrics', url});
        break;
      }
    }
  }
}

port.onMessage.addListener(msg => {
  if (msg.should_search) {
    searchForLyrics();
  }
});

port.postMessage({topic: 'should_search'});