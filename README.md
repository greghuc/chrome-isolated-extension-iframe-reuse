# What is this?
This project is a Chrome-browser extension. It tests that extension content-scripts correctly run in web-pages loaded inside iframes.
An iframe is created, either on the extension's background page, or on a visible tab. The iframe loads two web-pages in sequence
(by setting iframe.src). On web-page load, an extension content-script runs, opens a port, and sends message back to the extension's
background script (value of document.title). We expect to see a message received from each loaded web-page. Chrome 50 behaves as expected.
        
To run this extension, and review the message-passing:
* Download this extension (git clone..)
* Load this extension into Chrome using chrome://extensions/
* Run a static webserver in the root of the extension's folder. Using Ruby:
  * cd extension-folder-location 
  * ruby -run -ehttpd . -p8000
* Click the extension's button in the browser top-right (a black circle with a 'i' in it)
  * A test web-page will open, showing progress of the test. Or you can see more output by reviewing the extension's log
