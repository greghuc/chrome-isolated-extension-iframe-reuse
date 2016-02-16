# What is this?
This project is a Chrome-browser extension. It tests the interaction between an extension background-script and a content-script running inside a webpage. The webpage is loaded inside an iframe on the extension's background page. On webpage load, the content-script runs, opens a port, and sends a message back to the extension's background (value of document.body.outerHTML). Chrome 47 behaves as expected: message is received.
        
To run this extension, and review the message-passing:
* Download this extension (git clone..)
* Load this extension into Chrome using chrome://extensions/
* Run a static webserver in the root of the extension's folder. Using Ruby:
  * cd extension-folder-location 
  * ruby -run -ehttpd . -p8000
* Click the extension's button in the browser top-right (a black circle with a 'i' in it)
  * A test web-page will open, showing progress of the test. Or you can see more output by reviewing the extension's log
