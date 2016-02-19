var url = window.location.href;
console.log('Running content script in: ' + url);

var port = chrome.runtime.connect({ name: url });
port.postMessage({
    value: document.title
});