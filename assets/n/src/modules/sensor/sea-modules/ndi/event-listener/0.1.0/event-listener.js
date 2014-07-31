define("ndi/event-listener/0.1.0/event-listener",["ndi/events/0.1.0/events"],function(a,b,c){function d(a){a.id||(a.id="EventListener"+h);var b=a.id,c=g[b];return c||(c=g[b]=new e(a),h++),c}function e(a){this.element=a,this.__event={};var b=this;a.addEventListener("contextmenu",function(a){a.preventDefault(),b.__event.elementEvent=a,b.trigger(d.CONTEXT_MENU,b.__event)}),a.addEventListener("mousemove",function(a){var c=b.__event;c.elementEvent=a;var e=c.pageX=a.pageX,f=c.pageY=a.pageY;c.screenX=a.screenX,c.screenY=a.screenY,c.offsetX=a.offsetX,c.offsetY=a.offsetY,c.dx=e-c.ox,c.dy=f-c.oy,b.trigger(d.MOUSE_MOVE,c),c.ox=e,c.oy=f}),a.addEventListener("mousewheel",function(a){b.trigger(d.MOUSE_WHEEL,a.wheelDelta>0?1:-1)}),a.addEventListener("DOMMouseScroll",function(a){b.trigger(d.MOUSE_WHEEL,-a.detail>0?1:-1)}),a.addEventListener("mouseout",function(a){b.checkFather(a)&&(b.__event.elementEvent=a,b.trigger(d.MOUSE_OUT,b.__event))}),a.addEventListener("mousedown",function(a){b.__event.elementEvent=a,b.trigger(d.MOUSE_DOWN,b.__event)}),a.addEventListener("mouseup",function(a){b.__event.elementEvent=a,b.trigger(d.MOUSE_UP,b.__event)}),"createTouch"in document&&(a.addEventListener("touchstart",function(a){a.preventDefault();var c=b.__event;c.elementEvent=a,c.ox=a.touches[0].pageX,c.oy=a.touches[0].pageY,b.trigger(d.TOUCH_START,c)},!1),a.addEventListener("touchmove",function(a){a.preventDefault();var c=b.__event;c.elementEvent=a,a=a.touches[0];var e=c.pageX=a.pageX,f=c.pageY=a.pageY;c.screenX=a.screenX,c.screenY=a.screenY,c.offsetX=a.offsetX,c.offsetY=a.offsetY,c.dx=e-c.ox,c.dy=f-c.oy,b.trigger(d.TOUCH_MOVE,c),c.ox=e,c.oy=f},!1),a.addEventListener("touchend",function(a){a.preventDefault(),b.__event.elementEvent=a,b.trigger(d.TOUCH_END,b.__event)},!1))}var f=a("ndi/events/0.1.0/events"),g={},h=0;d.CONTEXT_MENU="contextMenu",d.MOUSE_WHEEL="mouseWheel",d.MOUSE_MOVE="mouseMove",d.MOUSE_DOWN="mouseDown",d.MOUSE_UP="mouseUp",d.MOUSE_OUT="mouseOut",d.KEY_DOWN="keyDown",d.KEY_UP="keyUp",d.TOUCH_START="touchStart",d.TOUCH_MOVE="touchMove",d.TOUCH_END="touchEnd",document.addEventListener("keydown",function(a){for(dom in g){var b=g[dom];b.__event.elementEvent=a,b.trigger(d.KEY_DOWN,b.__event)}}),document.addEventListener("keyup",function(a){for(dom in g){var b=g[dom];b.__event.elementEvent=a,b.trigger(d.KEY_UP,b.__event)}}),f.mixTo(e),e.prototype.getEvent=function(){return this.__event},e.prototype.checkFather=function(a){var b=a.relatedTarget,c=this.element;try{for(;b&&b!==c;)b=b.parentNode;return b!==c}catch(a){}},c.exports=d});
