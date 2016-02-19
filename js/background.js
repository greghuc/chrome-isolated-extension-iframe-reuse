var runTests = function(resultPort, managedFrame) {
    console.log('** Running tests **');

    var resultTimeoutMs = 2000;

    var urls = [
        'http://localhost:8000/tests/testcase-one.html',
        'http://localhost:8000/tests/testcase-two.html'
    ];

    console.log('\nTesting reuse of frame: ' + managedFrame.name());

    return Promise.cast(urls).mapSeries(function (url) {

        var startTime = null;
        var urlPort = null;
        var urlPortHandler = null;

        return new Promise(function (resolve) {

            chrome.runtime.onConnect.addListener(function (port) {
                if (port.name === url) {
                    urlPort = port;
                    urlPortHandler = function (message) {
                        console.log('Seen port message for: ' + port.name);
                        resolve(result(url, message, elapsedTime(startTime), false));
                    };
                    urlPort.onMessage.addListener(urlPortHandler);
                }
            });


            startTime = new Date();
            console.log('Opening url in iframe: ' + url);
            console.log('Waiting for port message..');
            managedFrame.open(url);

        }).timeout(resultTimeoutMs).catch(Promise.TimeoutError, function () {
            console.log('Failed to see port message. Timing out with default result');
            return result(url, null, elapsedTime(startTime), true);
        }).finally(function () {
            if (urlPort && urlPortHandler) {
                urlPort.onMessage.removeListener(urlPortHandler);
            }
        });

    }).then(function (results) {
        managedFrame.close();

        var wasSuccess = results.reduce(function(currentSuccess, result) {
            return currentSuccess && !result.timeout;
        }, true);

        var message = wasSuccess ? 'Frame successfully reused: content-script ran on each loaded web-page' :
                                   'Frame not successfully used: content-script did not run of each loaded web-page';

        var annotatedResults = {
            frameType: managedFrame.name(),
            success: wasSuccess,
            message: message,
            details: results
        }

        console.log('Ran tests: ');
        console.log(JSON.stringify(annotatedResults, null, '\t'));

        resultPort.postMessage(annotatedResults);

        return null;
    });

};

var newIframeInBackgroundPage = function(doc) {

    var managedIframe = iframeLoader.newManagedIframe(doc);

    return {
        name: function() {
            return 'background-page-iframe';
        },
        open: function(url) {
            managedIframe.openUrl(url);
        },
        close: function() {
            managedIframe.destroy();
        }
    };
};

var newIframeInTab = function(isActive) {
    var iframeLoaderTabUrl = chrome.extension.getURL('iframe-load.html');

    var isCreated = new Promise(function(resolve) {
        chrome.tabs.create({ active: isActive, url: iframeLoaderTabUrl }, function(tab) { resolve(tab.id); });
    });

    return {
        name: function() {
            return isActive ? 'iframe-in-active-tab' : 'iframe-in-inactive-tab';
        },
        open: function(url) {
            isCreated.then(function(tabId) {
                var frameUrl = iframeLoader.messagedUrlForListeningManagedIframe(iframeLoaderTabUrl, {
                    url: url
                });

                chrome.tabs.update(tabId, { url: frameUrl });
            });
        },
        close: function() {
            isCreated.then(function(tabId) {
                chrome.tabs.remove(tabId);
            });
        }
    };
};


var newTopLevelFrameInTab = function(isActive) {
    var isCreated = new Promise(function(resolve) {
        chrome.tabs.create({ active: isActive, url: 'about:blank' }, function(tab) { resolve(tab.id); });
    });

    return {
        name: function() {
            return isActive ? 'active-tab' : 'inactive-tab';
        },
        open: function(url) {
            isCreated.then(function(tabId) {
                console.log('Opening: ' + url);
                chrome.tabs.update(tabId, { url: url });
            });
        },
        close: function() {
            isCreated.then(function(tabId) {
                chrome.tabs.remove(tabId);
            });
        }
    };
};

var result = function(url, message, elapsedTime, timeout) {
    return {
        url: url,
        message: message,
        elapsedTime: elapsedTime,
        timeout: timeout
    };
};

var elapsedTime = function(time) {
    return new Date() - time;
};

var getManagedFrame = function(type) {
    if (type === 'background-iframe') { return newIframeInBackgroundPage(window.document); }
    if (type === 'inactive-tab-iframe') { return newIframeInTab(false); }
    if (type === 'inactive-tab-top-frame') { return newTopLevelFrameInTab(false); }
    throw new TypeError('Unknown frame type: ' + type);
};

chrome.runtime.onConnect.addListener(function(port) {
    var isRunTestRequest = port.name.lastIndexOf('run-tests#', 0) === 0;
    if (isRunTestRequest) {
        var frameType = port.name.split('#')[1];
        var managedFrame = getManagedFrame(frameType);

        runTests(port, managedFrame);
    }
});

chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({ url: chrome.extension.getURL('run-tests.html'), active: true });
});