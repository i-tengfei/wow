define("ndi/math/0.1.0/math-debug", [ "ndi/render/0.58.0/render-debug" ], function(require, exports, module) {
    var RENDER = require("ndi/render/0.58.0/render-debug");
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
    math.num2color = function(val) {
        return new RENDER.Color(val);
    };
    math.arr2vec2 = function(val) {
        return new RENDER.Vector2().val(val);
    };
    math.arr2vec3 = function(val) {
        return new RENDER.Vector3().val(val);
    };
    module.exports = math;
});
