define("ndi/orbit-camera/0.1.0/orbit-camera-debug", [ "ndi/mouse-manager/0.1.0/mouse-manager-debug", "ndi/events/0.1.0/events-debug", "ndi/key-manager/0.1.0/key-manager-debug", "ndi/event-listener/0.1.0/event-listener-debug", "ndi/render/0.58.0/render-debug", "ndi/math/0.1.0/math-debug" ], function(require, exports, module) {
    var MouseManager = require("ndi/mouse-manager/0.1.0/mouse-manager-debug");
    var RENDER = require("ndi/render/0.58.0/render-debug");
    var math = require("ndi/math/0.1.0/math-debug");
    var PIXELS_PER_ROUND = 1800;
    function OrbitCamera(options, ndi) {
        RENDER.Camera.call(this);
        this.container = new RENDER.Object3D();
        this.container.add(this);
        var mouseManager = this.__mouseManager = new MouseManager(options.element);
        delete options.element;
        this.attributes = {};
        this.val(options);
        this.damper = new math.Damper({
            r: this.attributes.r,
            theta: this.attributes.theta,
            phi: this.attributes.phi,
            center: this.attributes.center
        }, this.attributes.damp);
        var __this__ = this;
        mouseManager.on(MouseManager.DRAG, function(event) {
            __this__.rotate(event.dx, event.dy);
        });
        mouseManager.on(MouseManager.WHEEL, function(delta) {
            __this__.zoom(delta);
        });
        mouseManager.on(MouseManager.RIGHT_DRAG, function(event) {
            __this__.pan(event.dx, event.dy);
        });
        ndi.run(this.run.bind(this, ndi.__render__.camera));
    }
    OrbitCamera.prototype = Object.create(RENDER.Camera.prototype);
    OrbitCamera.prototype.val = function(options) {
        var attrs = this.attributes;
        if (options !== undefined) {
            attrs.r = math.check(options.r, 10);
            attrs.theta = math.check(options.theta, 0);
            attrs.phi = math.check(options.phi, Math.PI);
            attrs.center = new RENDER.Vector3().val(options.center);
            attrs.damp = math.check(options.damp, .05);
            attrs.rotateSpeed = math.check(options.rotateSpeed, 1);
            attrs.zoomSpeed = math.check(options.zoomSpeed, 1);
            attrs.panSpeed = math.check(options.panSpeed, 1);
        } else {
            return {
                damp: attrs.damp,
                r: attrs.r,
                theta: attrs.theta,
                phi: attrs.phi,
                center: attrs.center.val()
            };
        }
    };
    OrbitCamera.prototype.run = function(camera) {
        var attrs = this.attributes;
        if (attrs.r < .001) return false;
        var minPhi = 1e-4, maxPhi = Math.PI, minTheta, maxTheta;
        attrs.phi = Math.max(minPhi, Math.min(maxPhi, attrs.phi));
        var out = this.damper.run(attrs);
        var val = math.sph2cart(out.r, out.theta, out.phi);
        this.position.set(val[0], val[1], val[2]);
        this.lookAt(new RENDER.Vector3());
        this.container.position.copy(out.center);
        this.container.updateMatrixWorld(true);
        camera.position.getPositionFromMatrix(this.matrixWorld);
        camera.rotation.setEulerFromRotationMatrix(this.matrixWorld);
    };
    OrbitCamera.prototype.rotate = function(x, y) {
        var attrs = this.attributes;
        attrs.theta -= 2 * Math.PI * x / PIXELS_PER_ROUND * attrs.rotateSpeed;
        attrs.phi -= 2 * Math.PI * y / PIXELS_PER_ROUND * attrs.rotateSpeed;
    };
    OrbitCamera.prototype.zoom = function(delta) {
        var attrs = this.attributes;
        var v = Math.pow(.95, attrs.zoomSpeed);
        if (delta < 0) {
            attrs.r /= v;
        } else if (delta > 0) {
            attrs.r *= v;
        }
    };
    OrbitCamera.prototype.pan = function(x, y) {
        var distance = new RENDER.Vector3();
        var normalMatrix = new RENDER.Matrix3();
        return function(x, y) {
            var attrs = this.attributes;
            distance.set(-x, y, 0);
            normalMatrix.getNormalMatrix(this.matrix);
            distance.applyMatrix3(normalMatrix);
            distance.multiplyScalar(attrs.r * .001 * attrs.panSpeed);
            attrs.center.add(distance);
        };
    }();
    module.exports = OrbitCamera;
});
