var port = chrome.runtime.connect({ name: 'run-tests' });

var statusElement = document.getElementById('status');
statusElement.innerHTML = '<div>Loading page in background page iframe..</div>';
statusElement.innerHTML += '<div>Waiting for port message from iframe..</div>';

port.onMessage.addListener(function(message) {
    statusElement.innerHTML += '<div>Got result: </div>';
    var textNode = document.createTextNode(JSON.stringify(message, null, '\t'));
    statusElement.appendChild(textNode);

    var gotMessage = (message.data !== null && message.data !== undefined) ? true : false;
    var timeout = message.timeout;
    var success = gotMessage && !timeout

    var outcomeElement = document.getElementById('outcome');
    outcomeElement.innerHTML = success ? '<div style="background-color: lightgreen">Success</div>' : '<div style="background-color: pink">Failure</div>';
    outcomeElement.innerHTML += '<div>Got iframe message: ' + gotMessage + '</div>';
    outcomeElement.innerHTML += '<div>Message timeout: ' + timeout + '</div>';
});

