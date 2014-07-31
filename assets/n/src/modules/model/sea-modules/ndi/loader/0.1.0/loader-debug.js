define("ndi/loader/0.1.0/loader-debug", [ "ndi/events/0.1.0/events-debug" ], function(require, exports, module) {
    var Events = require("ndi/events/0.1.0/events-debug");
    function Loader(options) {
        var event = this.event = {};
        event.url = options.url;
        event.xhr = new XMLHttpRequest();
        event.total = 0;
        event.current = 0;
        event.progress = 0;
        this.load();
    }
    Events.mixTo(Loader);
    Loader.prototype.load = function() {
        var __this__ = this;
        var event = this.event;
        var xhr = event.xhr;
        var length = 0;
        xhr.onreadystatechange = function() {
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status === 200 || xhr.status === 0) {
                    if (xhr.responseText) {
                        event.data = JSON.parse(xhr.responseText);
                        __this__.trigger("complete", event);
                    } else {
                        console.warn("[" + event.url + "] seems to be unreachable or file there is empty");
                    }
                } else {
                    console.error("Couldn't load [" + event.url + "] [" + xhr.status + "]");
                }
            } else if (xhr.readyState === xhr.LOADING) {
                if (length === 0) {
                    length = xhr.getResponseHeader("Content-Length");
                }
                var current = xhr.responseText.length;
                event.total = length;
                event.current = current;
                event.progress = current / length;
                __this__.trigger("process", event);
            } else if (xhr.readyState === xhr.HEADERS_RECEIVED) {
                length = xhr.getResponseHeader("Content-Length");
            }
        };
        xhr.open("GET", event.url, true);
        xhr.send(null);
        __this__.trigger("start", event);
    };
    module.exports = Loader;
});
