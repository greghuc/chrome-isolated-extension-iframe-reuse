var testFrame = function(frameType, onComplete) {
    var statusElement = document.getElementById('status');
    statusElement.innerHTML += '<div>Loading multiple web-pages (with content scripts) in ' + frameType + '..</div>';
    statusElement.innerHTML += '<div>Waiting for test results..</div>';

    var port = chrome.runtime.connect({ name: 'run-tests#' + frameType });

    port.onMessage.addListener(function(result) {
        statusElement.innerHTML += '<div>Got result: </div>';
        statusElement.innerHTML += '<pre>' + JSON.stringify(result, null, '\t') + '</pre>';

        var outcomeElement = document.getElementById('outcome');
        var outcome = result.success ? 'PASS' : 'FAIL';
        var outcomeColor = result.success ? 'rgba(76, 175, 80, 0.61)' : 'rgba(244, 67, 54, 0.35)';

        outcomeElement.innerHTML += '<div style="background-color: ' + outcomeColor + '">' + frameType + ': ' + outcome + ': ' + result.message + '</div>';

        onComplete()
    });
};

testFrame('background-iframe', function() {
    testFrame('inactive-tab-iframe', function() {
        testFrame('inactive-tab-top-frame', function() {});
    });
});
