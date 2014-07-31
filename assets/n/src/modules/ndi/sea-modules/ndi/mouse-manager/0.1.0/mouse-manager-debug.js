define("ndi/mouse-manager/0.1.0/mouse-manager-debug", [ "ndi/events/0.1.0/events-debug", "ndi/key-manager/0.1.0/key-manager-debug", "ndi/event-listener/0.1.0/event-listener-debug" ], function(require, exports, module) {
    var Events = require("ndi/events/0.1.0/events-debug");
    var KeyManager = require("ndi/key-manager/0.1.0/key-manager-debug");
    var EventListener = require("ndi/event-listener/0.1.0/event-listener-debug");
    function MouseManager(element) {
        var keyManager = new KeyManager(element);
        keyManager.bindKey(0, KeyManager.LEFT);
        keyManager.bindKey(1, KeyManager.MIDDLE);
        keyManager.bindKey(2, KeyManager.RIGHT);
        var domEvents = keyManager.domEvents;
        var documentKeyManager = new KeyManager(document);
        documentKeyManager.bindKey(0, KeyManager.LEFT);
        documentKeyManager.bindKey(1, KeyManager.MIDDLE);
        documentKeyManager.bindKey(2, KeyManager.RIGHT);
        var documentEvents = documentKeyManager.domEvents;
        this.leftDown = false;
        this.rightDown = false;
        this.bounds = false;
        var __this__ = this;
        keyManager.on(KeyManager.KEY_DOWN, function(name, event) {
            if (keyManager.isContainedOne(KeyManager.LEFT)) {
                __this__.leftDown = true;
                __this__.trigger(MouseManager.LEFT_DOWN, event);
            }
            if (keyManager.isContainedOne(KeyManager.MIDDLE)) {
                __this__.trigger(MouseManager.MIDDLE_DOWN, event);
            }
            if (keyManager.isContainedOne(KeyManager.RIGHT)) {
                __this__.rightDown = true;
                __this__.trigger(MouseManager.RIGHT_DOWN, event);
            }
        });
        keyManager.on(KeyManager.KEY_UP, function(name, event) {
            if (name === KeyManager.LEFT) {
                __this__.trigger(MouseManager.LEFT_UP, event);
            }
            if (name === KeyManager.RIGHT) {
                __this__.trigger(MouseManager.RIGHT_UP, event);
            }
        });
        documentEvents.on(EventListener.MOUSE_MOVE, move);
        documentEvents.on(EventListener.TOUCH_MOVE, move);
        documentKeyManager.on(KeyManager.KEY_UP, function(name, event) {
            if (name === KeyManager.LEFT) {
                __this__.leftDown = false;
            }
            if (name === KeyManager.RIGHT) {
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
            __this__.trigger(MouseManager.WHEEL, delta, event);
        });
        function move(event) {
            __this__.trigger(MouseManager.MOVE, event);
            if (keyManager.isContainedOne(KeyManager.LEFT)) {
                __this__.trigger(MouseManager.DRAG, event);
            } else if (!__this__.bounds && __this__.leftDown) {
                __this__.trigger(MouseManager.DRAG, event);
            }
            if (keyManager.isContainedOne(KeyManager.RIGHT)) {
                __this__.trigger(MouseManager.RIGHT_DRAG, event);
            } else if (!__this__.bounds && __this__.rightDown) {
                __this__.trigger(MouseManager.RIGHT_DRAG, event);
            }
        }
    }
    Events.mixTo(MouseManager);
    MouseManager.LEFT_DOWN = "mouseLeftDown";
    MouseManager.MIDDLE_DOWN = "mouseMiddleDown";
    MouseManager.RIGHT_DOWN = "mouseRightDown";
    MouseManager.LEFT_UP = "mouseLeftUp";
    MouseManager.RIGHT_UP = "mouseRightUp";
    MouseManager.CLICK = "mouseClick";
    MouseManager.DRAG = "mouseDrag";
    MouseManager.RIGHT_DRAG = "mouseRightDrag";
    MouseManager.WHEEL = "mouseWheel";
    MouseManager.MOVE = "mouseMove";
    module.exports = MouseManager;
});
