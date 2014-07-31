define("ndi/ndi/0.1.0/ndi-debug", [ "ndi/render/0.58.0/render-debug", "ndi/model/0.1.0/model-debug", "ndi/orbit-camera/0.1.0/orbit-camera-debug", "ndi/mouse-manager/0.1.0/mouse-manager-debug", "ndi/events/0.1.0/events-debug", "ndi/key-manager/0.1.0/key-manager-debug", "ndi/event-listener/0.1.0/event-listener-debug", "ndi/math/0.1.0/math-debug", "ndi/material/0.1.0/material-debug", "ndi/map/0.1.0/map-debug", "ndi/async/0.2.5/async-debug", "ndi/tween/0.10.0/tween-debug", "ndi/render-extend/0.1.0/render-extend-debug" ], function(require, exports, module) {
    var RENDER = require("ndi/render/0.58.0/render-debug");
    var Model = require("ndi/model/0.1.0/model-debug");
    var OrbitCamera = require("ndi/orbit-camera/0.1.0/orbit-camera-debug");
    var math = require("ndi/math/0.1.0/math-debug");
    var Events = require("ndi/events/0.1.0/events-debug");
    var Material = require("ndi/material/0.1.0/material-debug");
    var Map = require("ndi/map/0.1.0/map-debug");
    var async = require("ndi/async/0.2.5/async-debug");
    var TWEEN = require("ndi/tween/0.10.0/tween-debug");
    var MouseManager = require("ndi/mouse-manager/0.1.0/mouse-manager-debug");
    require("ndi/render-extend/0.1.0/render-extend-debug");
    function NDI(options) {
        if (typeof this === "object" && !(this instanceof NDI)) {
            return new NDI(options);
        }
        this.__render__ = {
            clock: new RENDER.Clock(),
            scene: new RENDER.Scene()
        };
        this.__hash__ = {};
        this.attributes = {};
        this.canvas = null;
        this.cameraProxy = null;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.browser = NDI.browser;
        this.async = async;
        this.val(options || {});
        this.__init__();
    }
    NDI.BEFORE_RENDER = "beforeRender";
    NDI.RESIZE = "resize";
    NDI.READY = "ready";
    NDI.OVER = "over";
    NDI.async = async;
    Events.mixTo(NDI);
    NDI.prototype.events = {};
    NDI.prototype.__init__ = function() {
        var attrs = this.attributes;
        var renderer = this.__render__.renderer = new RENDER.WebGLRenderer({
            antialias: attrs.antialias
        });
        var camera = this.__render__.camera = new RENDER.PerspectiveCamera(45, this.width / this.height, .1, 1e5);
        this.canvas = renderer.domElement;
        document.body.appendChild(attrs.container);
        attrs.container.appendChild(this.canvas);
        attrs.autoSize && window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        attrs.autoStart && this.start();
        if (attrs.userSelect) {
            var os = attrs.operator.style;
            os.webkitUserSelect = "none";
            os.mozUserSelect = "none";
            os.msUserSelect = "none";
            os.userSelect = "none";
        }
    };
    NDI.prototype.val = function(options) {
        var attrs = this.attributes;
        if (options !== undefined) {
            attrs.autoRun = math.check(options.autoRun, true);
            attrs.autoSize = math.check(options.autoSize, true);
            attrs.autoStart = math.check(options.autoStart, true);
            attrs.antialias = math.check(options.antialias, true);
            attrs.userSelect = math.check(options.userSelect, true);
            attrs.fullWindow = math.check(options.fullWindow, true);
            attrs.controlType = options.controlType || "orbit";
            // TODO: 支持其他控制类型
            attrs.rendererType = options.rendererType || "webgl";
            // TODO: 支持其他渲染类型
            attrs.cameraType = options.cameraType || "perspective";
            // TODO: 支持其他摄像机类型
            attrs.container = options.container ? document.getElementById(options.container) : document.createElement("div");
            attrs.operator = options.operator ? document.getElementById(options.operator) : attrs.container;
            attrs.yunHost = options.yunHost || "/api";
            attrs.yunid = options.yunid || "^[a-z0-9]{24}$";
        } else {
            return {
                autoRun: attrs.autoRun,
                autoSize: attrs.autoSize,
                autoStart: attrs.autoStart,
                antialias: attrs.antialias,
                userSelect: attrs.userSelect,
                fullWindow: attrs.fullWindow,
                rendererType: "webgl",
                // TODO: 支持其他渲染类型
                rendererType: "perspective",
                // TODO: 支持其他摄像机类型
                container: attrs.container.id,
                operator: attrs.operator.id,
                yunHost: attrs.yunHost,
                yunid: attrs.yunid
            };
        }
    };
    NDI.prototype.setHash = function(obj) {
        this.__hash__[obj.id] = obj;
        return this;
    };
    NDI.prototype.getHash = function(id) {
        return this.__hash__[id];
    };
    NDI.prototype.run = function(callback) {
        this.on(NDI.BEFORE_RENDER, callback);
        return this;
    };
    NDI.prototype.stop = function(callback) {
        this.off(NDI.BEFORE_RENDER, callback);
        return this;
    };
    NDI.prototype.resize = function(callback) {
        if (callback && typeof callback === "function") {
            this.on(NDI.RESIZE, callback);
        } else {
            var w, h;
            if (this.attributes.fullWindow) {
                w = window.innerWidth;
                h = window.innerHeight;
            } else {
                w = this.prototype.container.offsetWidth;
                h = this.prototype.container.offsetHeight;
            }
            this.__render__.renderer.setSize(w, h);
            this.__render__.camera.aspect = w / h;
            this.__render__.camera.updateProjectionMatrix();
            this.width = w, this.height = h;
            this.trigger(NDI.RESIZE, w, h);
        }
        return this;
    };
    NDI.prototype.start = function() {
        this.render();
        return this;
    };
    NDI.prototype.get = function(name) {
        return this.attributes[name];
    };
    NDI.prototype.render = function() {
        var render = this.__render__, camera = render.camera;
        this.attributes.autoRun && requestAnimationFrame(this.render.bind(this));
        var delta = render.clock.getDelta();
        this.trigger(NDI.BEFORE_RENDER, delta);
        TWEEN.update();
        if (this.cameraProxy) {
            camera.position.val(this.cameraProxy.positionWorld);
            camera.rotation.val(this.cameraProxy.rotationWorld);
        }
        render.renderer.render(render.scene, camera);
        return this;
    };
    NDI.prototype.add = function(o3d) {
        if (o3d instanceof RENDER.Object3D) {
            this.__render__.scene.add(o3d);
        } else {
            if (!!o3d.id) {
                this.__hash__[o3d.id] = o3d;
                this.__render__.scene.add(o3d.render);
            } else {
                this.add(o3d.render);
            }
        }
        return this;
    };
    NDI.prototype.enableMouse = function() {
        this.mouseManager = this.mouseManager || new MouseManager(this.get("operator"));
        return this;
    };
    NDI.createAction = function(name, func) {
        if (NDI.prototype[name]) {
            console.error("该动作名称已存在！");
        } else {
            NDI.prototype[name] = function(options, data, callback) {
                var ndata = {};
                if (typeof data === "function") {
                    callback = data;
                    data = undefined;
                }
                // 过滤
                var filter = options.filter || [];
                if (data && filter === "all") {
                    ndata = undefined;
                } else {
                    for (d in data) {
                        if (filter.indexOf(d) === -1) {
                            ndata[d] = data[d];
                        }
                    }
                }
                // 继承
                var inherit = {};
                if (ndata && options.inherit === "all") {
                    for (d in ndata) {
                        inherit[d] = d;
                    }
                } else if (Array.isArray(options.inherit)) {
                    options.inherit.forEach(function(x) {
                        inherit[x] = x;
                    });
                } else {
                    inherit = options.inherit;
                }
                func.call(this, options, ndata, function(nextData) {
                    nextData = nextData || {};
                    for (d in inherit) {
                        nextData[inherit[d]] = ndata[d];
                    }
                    callback && callback(null, nextData);
                });
                return this;
            };
        }
    };
    // 命令行 支持以命令行形式执行
    NDI.createAction("cmd", function(options, data, callback) {
        var type = options.type || "waterfall";
        var __this__ = this;
        if (!Array.isArray(options.commands)) {
            if (typeof options.commands === "object" && options.commands.action) {
                options.commands = [ options.commands ];
            } else {
                console.error("commands 不正确！");
            }
        }
        var commands = options.commands.map(function(x) {
            return function(args, attr) {
                var insert = args[0].insert;
                return function() {
                    for (var i = 0, il = arguments.length; i < il; i++) {
                        // 上一个 data 插入 下一个 options
                        if (insert && i === 0) {
                            for (var ii = 0, iil = insert.length; ii < iil; ii++) {
                                var at = insert[ii];
                                args[0][at] = arguments[0][at];
                            }
                        }
                        args.push(arguments[i]);
                    }
                    __this__[attr].apply(__this__, args);
                };
            }([ x.options || {} ], x.action);
        });
        data && type === "waterfall" && commands.unshift(function(next) {
            next(null, data);
        });
        async[type](commands, function() {
            callback && callback();
        });
    });
    // 分支执行
    NDI.createAction("branch", function(options, data, callback) {
        var __this__ = this;
        options.commands.forEach(function(x) {
            __this__.cmd(x, data);
        });
        callback && callback();
    });
    // 延迟
    NDI.createAction("delay", function(options, data, callback) {
        var __this__ = this;
        var time = options.time || 2;
        var start = Date.now();
        function run(delta) {
            var current = Math.min((Date.now() - start) * .001, time), progress = Math.min(current / time, 1), number = Math.floor(current);
            __this__.cmd(options.progress, {
                start: start,
                end: start + time * 1e3,
                progress: progress,
                current: current,
                number: number,
                total: time,
                rootData: data
            });
            progress === 1 && __this__.stop(run);
        }
        options.progress && this.run(run);
        setTimeout(callback, time * 1e3);
    });
    // 添加 Mesh
    NDI.createAction("mesh", function(options, data, callback) {
        var __this__ = this;
        options.renderType = "mesh";
        Model(options, this, function() {
            __this__.add(this);
            callback && callback({
                model: this
            });
        });
    });
    // 新建材质
    NDI.createAction("material", function(options, data, callback) {
        var material = this.getHash(options.id);
        var __this__ = this;
        if (material) {
            callback && callback({
                material: material
            });
        } else {
            Material(options, this, function() {
                __this__.setHash(this);
                callback && callback({
                    material: this
                });
            });
        }
    });
    // 新建贴图
    NDI.createAction("map", function(options, data, callback) {
        var map = this.getHash(options.id);
        var __this__ = this;
        if (map) {
            callback && callback({
                map: map
            });
        } else {
            Map(options, this, function() {
                __this__.setHash(this);
                callback && callback({
                    map: this
                });
            });
        }
    });
    // 设置相机
    NDI.createAction("camera", function(options, data, callback) {
        this.cameraProxy = this.__hash__[options.id] = this.__hash__[options.id] || new OrbitCamera(options, this);
        callback && callback(this.cameraProxy);
    });
    // 添加灯光
    NDI.createAction("light", function(options, data, callback) {
        var light;
        switch (options.type) {
          case "ambient":
            light = new RENDER.AmbientLight(options.color || 16777215, options.intensity || 1);
            break;

          case "directional":
            var light = new RENDER.DirectionalLight(options.color || 16777215, options.intensity || 1);
            light.position.val(options.position || [ 0, 0, 0 ]);
            break;
        }
        this.add(light);
        this.__hash__[options.id] = light;
        callback && callback(light);
    });
    // 重置参数
    NDI.createAction("set", function(options, data, callback) {
        var id = options.id, values = options.values;
        var obj;
        if (id === "camera") {
            obj = this.cameraProxy;
        } else {
            obj = this.__hash__[options.id];
        }
        for (v in values) {
            obj.set(v, values[v]);
        }
        callback && callback();
    });
    // 动画
    NDI.createAction("animate", function(options, data, callback) {
        var id = options.id, values = options.values;
        var obj;
        if (id === "camera") {
            obj = this.cameraProxy;
        } else {
            obj = this.__hash__[options.id];
        }
        var ovs = obj.val();
        var tween = new TWEEN.Tween({
            animate: 0
        }).to({
            animate: 1
        }, (options.time || 1) * 1e3).easing(TWEEN.Easing[options.easing || "Linear"][options.type || "None"]).onUpdate(update).onComplete(function() {
            callback && callback();
        }).start();
        function update() {
            var __this__ = this;
            for (v in values) {
                var ov = ovs[v], nv = values[v];
                if (Array.isArray(nv)) {
                    nv = nv.map(function(x, i) {
                        return ov[i] + (x - ov[i]) * __this__.animate;
                    });
                } else {
                    nv = ov + (nv - ov) * __this__.animate;
                }
                obj.set(v, nv);
            }
        }
    });
    // 删除
    NDI.createAction("remove", function(options, data, callback) {
        var model = this.getHash(options.id);
        if (model) {
            var rm = model.render;
            rm.parent.remove(rm);
            delete this.__hash__[options.id];
        }
        callback && callback();
    });
    NDI.ready = function() {
        var event = new Events();
        return function(callback) {
            if (typeof callback === "function") {
                event.on("ready", callback);
            } else {
                event.trigger("ready");
            }
        };
    }();
    (function() {
        // A fallback to window.onload, that will always work
        function addLoadEvent(func) {
            var oldonload = window.onload;
            if (typeof window.onload != "function") {
                window.onload = func;
            } else {
                window.onload = function() {
                    if (oldonload) {
                        oldonload();
                    }
                    func();
                };
            }
        }
        function domReady() {
            if (!isReady) {
                isReady = true;
                NDI.ready();
            }
        }
        var userAgent = navigator.userAgent.toLowerCase();
        var browser = NDI.browser = {
            version: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
            safari: /webkit/.test(userAgent),
            opera: /opera/.test(userAgent),
            msie: /msie/.test(userAgent) && !/opera/.test(userAgent),
            mozilla: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent)
        };
        var isReady = false, readyBound = false;
        if (readyBound) {
            return;
        }
        readyBound = true;
        // Mozilla, Opera (see further below for it) and webkit nightlies currently support this event
        if (document.addEventListener && !browser.opera) {
            // Use the handy event callback
            document.addEventListener("DOMContentLoaded", domReady, false);
        }
        // If IE is used and is not in a frame
        // Continually check to see if the document is ready
        if (browser.msie && window == top) (function() {
            if (isReady) return;
            try {
                // If IE is used, use the trick by Diego Perini
                // http://javascript.nwbox.com/IEContentLoaded/
                document.documentElement.doScroll("left");
            } catch (error) {
                setTimeout(arguments.callee, 0);
                return;
            }
            // and execute any waiting functions
            domReady();
        })();
        if (browser.opera) {
            document.addEventListener("DOMContentLoaded", function() {
                if (isReady) return;
                for (var i = 0; i < document.styleSheets.length; i++) if (document.styleSheets[i].disabled) {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                // and execute any waiting functions
                domReady();
            }, false);
        }
        if (browser.safari) {
            var numStyles;
            (function() {
                if (isReady) return;
                if (document.readyState != "loaded" && document.readyState != "complete") {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                if (numStyles === undefined) {
                    var links = document.getElementsByTagName("link");
                    for (var i = 0; i < links.length; i++) {
                        if (links[i].getAttribute("rel") == "stylesheet") {
                            numStyles++;
                        }
                    }
                    var styles = document.getElementsByTagName("style");
                    numStyles += styles.length;
                }
                if (document.styleSheets.length != numStyles) {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                // and execute any waiting functions
                domReady();
            })();
        }
        addLoadEvent(domReady);
    })();
    module.exports = NDI;
});
