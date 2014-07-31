define("ndi/mouse-manager/0.1.0/mouse-manager-debug", [ "ndi/events/0.1.0/events-debug", "ndi/key-manager/0.1.0/key-manager-debug", "ndi/event-listener/0.1.0/event-listener-debug" ], function(require, exports, module) {
    var Events = require("ndi/events/0.1.0/events-debug");
    var KeyManager = require("ndi/key-manager/0.1.0/key-manager-debug");
    var EventListener = require("ndi/event-listener/0.1.0/event-listener-debug");
    function MouseManager(element) {
        var keyManager = new KeyManager(element);
        keyManager.bindKey(0, keyManager.LEFT);
        keyManager.bindKey(1, keyManager.MIDDLE);
        keyManager.bindKey(2, keyManager.RIGHT);
        var domEvents = keyManager.domEvents;
        var documentKeyManager = new KeyManager(document);
        documentKeyManager.bindKey(0, keyManager.LEFT);
        documentKeyManager.bindKey(1, keyManager.MIDDLE);
        documentKeyManager.bindKey(2, keyManager.RIGHT);
        var documentEvents = documentKeyManager.domEvents;
        this.leftDown = false;
        this.rightDown = false;
        this.bounds = false;
        var __this__ = this;
        keyManager.on(keyManager.KEY_DOWN, function(name, event) {
            if (keyManager.isContainedOne(keyManager.LEFT)) {
                __this__.leftDown = true;
                __this__.trigger(__this__.LEFT_DOWN, event);
            }
            if (keyManager.isContainedOne(keyManager.MIDDLE)) {
                __this__.trigger(__this__.MIDDLE_DOWN, event);
            }
            if (keyManager.isContainedOne(keyManager.RIGHT)) {
                __this__.rightDown = true;
                __this__.trigger(__this__.RIGHT_DOWN, event);
            }
        });
        keyManager.on(keyManager.KEY_UP, function(name, event) {
            if (name === keyManager.LEFT) {
                __this__.trigger(__this__.LEFT_UP, event);
            }
            if (name === keyManager.RIGHT) {
                __this__.trigger(__this__.RIGHT_UP, event);
            }
        });
        documentEvents.on(EventListener.MOUSE_MOVE, move);
        documentEvents.on(EventListener.TOUCH_MOVE, move);
        documentKeyManager.on(keyManager.KEY_UP, function(name, event) {
            if (name === keyManager.LEFT) {
                __this__.leftDown = false;
            }
            if (name === keyManager.RIGHT) {
                __this__.rightDown = false;
            }
        });
        domEvents.on(EventListener.TOUCH_START, function(event) {
            __this__.leftDown = true;
        });
        documentEvents.on(EventListener.TOUCH_END, function(event) {
            __this__.leftDown = false;
        });
        domEvents.on(EventListener.MOUSE_WHEEL, function(delta, event) {
            __this__.trigger(__this__.WHEEL, delta, event);
            event.preventDefault();
        });
        function move(event) {
            __this__.trigger(__this__.MOVE, event);
            if (keyManager.isContainedOne(keyManager.LEFT)) {
                __this__.trigger(__this__.DRAG, event);
            } else if (!__this__.bounds && __this__.leftDown) {
                __this__.trigger(__this__.DRAG, event);
            }
            if (keyManager.isContainedOne(keyManager.RIGHT)) {
                __this__.trigger(__this__.RIGHT_DRAG, event);
            } else if (!__this__.bounds && __this__.rightDown) {
                __this__.trigger(__this__.RIGHT_DRAG, event);
            }
        }
    }
    Events.mixTo(MouseManager);
    MouseManager.prototype.LEFT_DOWN = "mouseLeftDown";
    MouseManager.prototype.MIDDLE_DOWN = "mouseMiddleDown";
    MouseManager.prototype.RIGHT_DOWN = "mouseRightDown";
    MouseManager.prototype.LEFT_UP = "mouseLeftUp";
    MouseManager.prototype.RIGHT_UP = "mouseRightUp";
    MouseManager.prototype.CLICK = "mouseClick";
    MouseManager.prototype.DRAG = "mouseDrag";
    MouseManager.prototype.RIGHT_DRAG = "mouseRightDrag";
    MouseManager.prototype.WHEEL = "mouseWheel";
    MouseManager.prototype.MOVE = "mouseMove";
    module.exports = MouseManager;
});
