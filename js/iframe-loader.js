var iframeLoader = function() {

    var newManagedIframe = function(doc) {

        var iframe = doc.createElement('iframe');
        iframe.width = '640px';
        iframe.height = '480px';
        doc.body.appendChild(iframe);

        return {
            openUrl: function(url) {
                iframe.src = url;
            },
            destroy: function() {
                iframe.parentNode.removeChild(iframe);
            }
        };
    }

    var urlMessenger = {
        assembleMessagedUrl: function(baseUrl, messageValue) {
            return baseUrl + '#' + encodeURIComponent(messageValue);
        },
        disassembleMessagedUrl: function(messageUrl) {
            var splitUrl = messageUrl.split('#');
            return {
                baseUrl: splitUrl[0],
                messageValue: splitUrl[1] ? decodeURIComponent(splitUrl[1]) : null
            };
        }
    };

    var jsonMessenger = {
        toMessagedUrl: function(baseUrl, message) {
            return urlMessenger.assembleMessagedUrl(baseUrl, JSON.stringify(message));
        },
        getUrlMessage: function(messagedUrl) {
            return JSON.parse(urlMessenger.disassembleMessagedUrl(messagedUrl).messageValue);
        }
    };

    var newListeningManagedIframe = function(win) {
        var actOnMessage = function(iframe, message) {
            if (message.url) {
                iframe.openUrl(message.url);
            };
        };

        var iframe = newManagedIframe(win.document);
        actOnMessage(iframe, jsonMessenger.getUrlMessage(win.location.href));

        var handleControlMessages = function(event) {
            actOnMessage(iframe, jsonMessenger.getUrlMessage(event.newURL));
        }
        win.addEventListener('hashchange', handleControlMessages, false);
    };

    return {
        newManagedIframe: newManagedIframe,
        newListeningManagedIframe: newListeningManagedIframe,
        messagedUrlForListeningManagedIframe: jsonMessenger.toMessagedUrl
    };
}();