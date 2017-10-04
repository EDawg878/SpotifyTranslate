if (typeof port !== "undefined") {
  notify(document.title);
} else {
  const port = chrome.runtime.connect({name: 'spotify_listener'});
  var lastTitle = null;

  function isSong(title) {
    return title.includes(' · ');
  }

  function hasChanged(title) {
    return lastTitle !== title;
  }

  function notify(title) {
    if (isSong(title) && hasChanged(title)) {
      this.lastTitle = title;
      port.postMessage({title: document.title});
    }
  }

  const target = document.querySelector('head > title');

  const observer = new window.MutationObserver(mutations =>
    mutations.forEach(mutation =>
      notify(mutation.target.textContent)
    )
  );
  
  notify(document.title);
  observer.observe(target, { subtree: true, characterData: true, childList: true });
}