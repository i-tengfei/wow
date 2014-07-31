define("ndi/math/0.1.0/math-debug", [ "ndi/render/0.58.0/render-debug" ], function(require, exports, module) {
    var RENDER = require("ndi/render/0.58.0/render-debug");
    // 扩展渲染库的数学方法
    RENDER.Vector3.prototype.val = function(x, y, z) {
        if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        } else if (Array.isArray(x) && x.length === 3 && y === undefined) {
            return this.val(x[0], x[1], x[2]);
        } else if (x instanceof RENDER.Vector3 && y === undefined) {
            return this.val(x.x, x.y, x.z);
        } else if (x === undefined) {
            return [ this.x, this.y, this.z ];
        }
    };
    RENDER.Vector3.prototype.mul = function(x, y, z) {
        if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
            this.x *= x;
            this.y *= y;
            this.z *= z;
            return this;
        } else if (x instanceof RENDER.Vector3 && y instanceof RENDER.Vector3 && z === undefined) {
            return this.val(x).mul(y);
        } else if (x instanceof RENDER.Vector3 && y === undefined) {
            return this.mul(x.x, x.y, x.z);
        } else if (typeof x === "number" && y === undefined) {
            return this.mul(x, x, x);
        }
    };
    Number.prototype.add = function(x) {
        return this + x;
    };
    Number.prototype.sub = function(x) {
        return this - x;
    };
    Number.prototype.mul = function(x) {
        return this * x;
    };
    Number.prototype.clone = function() {
        return this.valueOf();
    };
    var math = {};
    math.check = function(v, d) {
        (v === undefined || v === null) && (v = d);
        return v;
    };
    math.sph2cart = function(r, theta, phi) {
        return [ r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.cos(theta) ];
    };
    math.cart2sph = function(x, y, z) {
        return [ Math.sqrt(x * x + y * y + z * z), Math.atan2(x, z), Math.atan2(Math.sqrt(x * x + z * z), y) ];
    };
    math.Damper = function(obj, damp) {
        this.damp = damp || .05;
        var attrs = this.attrs = [];
        for (attr in obj) {
            this[attr] = obj[attr].clone();
            attrs.push(attr);
        }
    };
    math.Damper.prototype.run = function(obj) {
        for (var i = 0, il = this.attrs.length; i < il; i++) {
            var attr = this.attrs[i];
            var clone = obj[attr].clone();
            this[attr] = this[attr].add(obj[attr].clone().sub(this[attr]).mul(this.damp));
        }
        return this;
    };
    module.exports = math;
});
