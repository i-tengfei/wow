define("ndi/loader/0.1.0/loader",["ndi/events/0.1.0/events"],function(a,b,c){function d(a){var b=this.event={};b.url=a.url,b.xhr=new XMLHttpRequest,b.total=0,b.current=0,b.progress=0,this.load()}var e=a("ndi/events/0.1.0/events");e.mixTo(d),d.prototype.load=function(){var a=this,b=this.event,c=b.xhr,d=0;c.onreadystatechange=function(){if(c.readyState===c.DONE)200===c.status||0===c.status?c.responseText?(b.data=JSON.parse(c.responseText),a.trigger("complete",b)):console.warn("["+b.url+"] seems to be unreachable or file there is empty"):console.error("Couldn't load ["+b.url+"] ["+c.status+"]");else if(c.readyState===c.LOADING){0===d&&(d=c.getResponseHeader("Content-Length"));var e=c.responseText.length;b.total=d,b.current=e,b.progress=e/d,a.trigger("process",b)}else c.readyState===c.HEADERS_RECEIVED&&(d=c.getResponseHeader("Content-Length"))},c.open("GET",b.url,!0),c.send(null),a.trigger("start",b)},c.exports=d});
