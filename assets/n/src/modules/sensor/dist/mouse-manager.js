define("ndi/mouse-manager/0.1.0/mouse-manager",["ndi/events/0.1.0/events","ndi/key-manager/0.1.0/key-manager","ndi/event-listener/0.1.0/event-listener"],function(a,b,c){function d(a){function b(a){i.trigger(i.MOVE,a),c.isContainedOne(c.LEFT)?i.trigger(i.DRAG,a):!i.bounds&&i.leftDown&&i.trigger(i.DRAG,a),c.isContainedOne(c.RIGHT)?i.trigger(i.RIGHT_DRAG,a):!i.bounds&&i.rightDown&&i.trigger(i.RIGHT_DRAG,a)}var c=new f(a);c.bindKey(0,c.LEFT),c.bindKey(1,c.MIDDLE),c.bindKey(2,c.RIGHT);var d=c.domEvents,e=new f(document);e.bindKey(0,c.LEFT),e.bindKey(1,c.MIDDLE),e.bindKey(2,c.RIGHT);var h=e.domEvents;this.leftDown=!1,this.rightDown=!1,this.bounds=!1;var i=this;c.on(c.KEY_DOWN,function(a,b){c.isContainedOne(c.LEFT)&&(i.leftDown=!0,i.trigger(i.LEFT_DOWN,b)),c.isContainedOne(c.MIDDLE)&&i.trigger(i.MIDDLE_DOWN,b),c.isContainedOne(c.RIGHT)&&(i.rightDown=!0,i.trigger(i.RIGHT_DOWN,b))}),c.on(c.KEY_UP,function(a,b){a===c.LEFT&&i.trigger(i.LEFT_UP,b),a===c.RIGHT&&i.trigger(i.RIGHT_UP,b)}),h.on(g.MOUSE_MOVE,b),h.on(g.TOUCH_MOVE,b),e.on(c.KEY_UP,function(a){a===c.LEFT&&(i.leftDown=!1),a===c.RIGHT&&(i.rightDown=!1)}),d.on(g.TOUCH_START,function(){i.leftDown=!0}),h.on(g.TOUCH_END,function(){i.leftDown=!1}),d.on(g.MOUSE_WHEEL,function(a,b){i.trigger(i.WHEEL,a,b),b.preventDefault()})}var e=a("ndi/events/0.1.0/events"),f=a("ndi/key-manager/0.1.0/key-manager"),g=a("ndi/event-listener/0.1.0/event-listener");e.mixTo(d),d.prototype.LEFT_DOWN="mouseLeftDown",d.prototype.MIDDLE_DOWN="mouseMiddleDown",d.prototype.RIGHT_DOWN="mouseRightDown",d.prototype.LEFT_UP="mouseLeftUp",d.prototype.RIGHT_UP="mouseRightUp",d.prototype.CLICK="mouseClick",d.prototype.DRAG="mouseDrag",d.prototype.RIGHT_DRAG="mouseRightDrag",d.prototype.WHEEL="mouseWheel",d.prototype.MOVE="mouseMove",c.exports=d});
