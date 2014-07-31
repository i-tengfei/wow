define("ndi/key-manager/0.1.0/key-manager-debug", [ "ndi/events/0.1.0/events-debug", "ndi/event-listener/0.1.0/event-listener-debug" ], function(require, exports, module) {
    var Events = require("ndi/events/0.1.0/events-debug");
    var EventListener = require("ndi/event-listener/0.1.0/event-listener-debug");
    // --------------- Key --------------- //
    function Key(status, kCode, kName, prevent) {
        this.status = status;
        this.keyCode = kCode;
        this.keyName = kName;
        this.prevent = prevent || false;
    }
    Key.prototype.isPressed = function(keyStatus) {
        return (keyStatus & this.status) === this.status;
    };
    Key.prototype.press = function(keyStatus) {
        keyStatus |= this.status;
        return keyStatus;
    };
    Key.prototype.lift = function(keyStatus) {
        keyStatus &= ~this.status;
        return keyStatus;
    };
    // --------------- KeyManager --------------- //
    function KeyManager(element) {
        this._keyStatus = 0;
        this.__keyNum = 0;
        this.__keys = {};
        var de = this.domEvents = EventListener(element);
        var _this = this;
        de.on(EventListener.MOUSE_DOWN, function(event) {
            var event = event.elementEvent;
            var key = _this.__keys[event.button];
            key && key.prevent && event.preventDefault();
            _this.down(event.button);
        });
        de.on(EventListener.MOUSE_UP, function(event) {
            var event = event.elementEvent;
            var key = _this.__keys[event.button];
            key && key.prevent && event.preventDefault();
            _this.up(event.button);
        });
        de.on(EventListener.KEY_DOWN, function(event) {
            var event = event.elementEvent;
            var key = _this.__keys[event.keyCode];
            key && key.prevent && event.preventDefault();
            _this.down(event.keyCode);
        });
        de.on(EventListener.KEY_UP, function(event) {
            var event = event.elementEvent;
            var key = _this.__keys[event.keyCode];
            key && key.prevent && event.preventDefault();
            _this.up(event.keyCode);
        });
        de.on(EventListener.MOUSE_OUT, function(event) {
            var event = event.elementEvent;
            for (var i = 0; i < 3; i++) {
                var key = _this.__keys[i];
                key && (_this._keyStatus = key.lift(this._keyStatus));
            }
        });
    }
    Events.mixTo(KeyManager);
    KeyManager.KEY_DOWN = "keyDown";
    KeyManager.KEY_UP = "keyUp";
    KeyManager.LEFT = "mouseLeft";
    KeyManager.MIDDLE = "mouseMiddle";
    KeyManager.RIGHT = "mouseRight";
    KeyManager.prototype.bindKey = function(kCode, kName, prevent) {
        var kId = this.__keyNum;
        if (typeof kCode !== "number") {
            console.error("KeyManager.bindKey( " + kId + ", " + kCode + ", " + (kName ? kName : "") + " ) failed: the type of the first variable must be SFInt32");
            return this;
        }
        if (this[kCode]) {
            console.warn("KeyManager.bindKey(" + kId + ", " + kCode + ", " + (kName ? kName : "") + ' ): the KeyCode "' + KeyCode + '" has been used!');
        }
        this.__keys[kName] = this.__keys[kCode] = new Key(1 << kId, kCode, kName ? kName : "", prevent);
        this.__keyNum++;
        return kCode;
    };
    // TODO: add unbind
    KeyManager.prototype.unbindKey = function(kCode) {};
    KeyManager.prototype.down = function(kCode) {
        var key = this.__keys[kCode];
        if (key) {
            this._keyStatus = key.press(this._keyStatus);
            this.trigger(KeyManager.KEY_DOWN, key.keyName, this.domEvents.getEvent());
        }
    };
    KeyManager.prototype.up = function(kCode) {
        var key = this.__keys[kCode];
        if (key) {
            this._keyStatus = key.lift(this._keyStatus);
            this.trigger(KeyManager.KEY_UP, key.keyName, this.domEvents.getEvent());
        }
    };
    KeyManager.prototype.getStatus = function() {
        return this._keyStatus;
    };
    KeyManager.prototype.isContainedOne = function() {
        for (var i = 0; i < arguments.length; i++) {
            var key = this.__keys[arguments[i]];
            if (key && key.isPressed(this._keyStatus)) {
                return true;
            }
        }
        return false;
    };
    KeyManager.prototype.isContainedAll = function() {
        for (var i = 0; i < arguments.length; i++) {
            var key = this._keys[arguments[i]];
            if (!key || !key.isPressed(this._keyStatus)) {
                return false;
            }
        }
        return true;
    };
    KeyManager.prototype.isContainedWith = function() {
        var nowStatus = 0;
        for (var i = 0; i < arguments.length; i++) {
            nowStatus |= this._keys[arguments[i]].status;
        }
        if (this.isContainedAll.apply(this, arguments) && nowStatus === this.getStatus()) {} else {
            return false;
        }
        return true;
    };
    module.exports = KeyManager;
});
