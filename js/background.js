var runTests = function(resultPort) {
    console.log('** Running tests **');

    var resultTimeoutMs = 2000;

    var urls = [
        'http://localhost:8000/tests/testcase-one.html',
        'http://localhost:8000/tests/testcase-two.html'
    ];

    var iframeElement = null;

    return Promise.cast(urls).mapSeries(function (url) {

        iframeElement = loadIframe(window.document);
        var startTime = null;
        var urlPort = null;
        var urlPortHandler = null;

        return new Promise(function (resolve) {

            chrome.runtime.onConnect.addListener(function (port) {
                if (port.name === url) {
                    urlPort = port;
                    urlPortHandler = function (message) {
                        console.log('Seen port message');
                        resolve(result(url, message, elapsedTime(startTime), false));
                    };
                    urlPort.onMessage.addListener(urlPortHandler);
                }
            });


            startTime = new Date();
            console.log('Opening url in background page iframe: ' + url);
            console.log('Waiting for port message..');
            iframeElement.src = url;

        }).timeout(resultTimeoutMs).catch(Promise.TimeoutError, function () {
            console.log('Failed to see port message. Timing out with default result');
            return result(url, null, elapsedTime(startTime), true);
        }).finally(function () {
            if (urlPort && urlPortHandler) {
                urlPort.onMessage.removeListener(urlPortHandler);
            }
        });

    }).then(function (results) {
        iframeElement.parentNode.removeChild(iframeElement);

        console.log('DONE');
        console.log(JSON.stringify(results, null, '\t'));
    });

};


var result = function(url, data, elapsedTime, timeout) {
    return {
        url: url,
        data: data,
        elapsedTime: elapsedTime,
        timeout: timeout
    };
};

var loadIframe = function(doc) {
    var frame = doc.createElement('iframe');

    frame.width = '640px';
    frame.height = '480px';

    doc.body.appendChild(frame);

    return frame;
};

var elapsedTime = function(time) {
    return new Date() - time;
}

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name !== 'run-tests') {
        return;
    }

    runTests(port);
});

chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({ url: chrome.extension.getURL('run-tests.html'), active: true });
});