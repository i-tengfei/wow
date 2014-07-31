define("ndi/material/0.1.0/material-debug", [ "ndi/render/0.58.0/render-debug", "ndi/loader/0.1.0/loader-debug", "ndi/events/0.1.0/events-debug", "ndi/math/0.1.0/math-debug", "ndi/map/0.1.0/map-debug" ], function(require, exports, module) {
    var RENDER = require("ndi/render/0.58.0/render-debug");
    var Loader = require("ndi/loader/0.1.0/loader-debug");
    var math = require("ndi/math/0.1.0/math-debug");
    var Map = require("ndi/map/0.1.0/map-debug");
    function mix(from) {
        for (attr in hash) {
            from[attr] = from[attr] === undefined ? hash[attr].default : from[attr];
        }
    }
    RENDER.Material.prototype.val = function() {
        var result = {};
        var __this__ = this;
        Object.keys(this).forEach(function(name) {
            if (hash.hasOwnProperty(name)) {
                var type = hash[name].setType, value;
                switch (type) {
                  case "value":
                    value = __this__[name];
                    break;

                  case "map":
                    var map = __this__[name];
                    if (map) {
                        value = map.sourceFile;
                    }
                    break;

                  case "const":
                    value = __this__.constName(name);
                    break;

                  case "color":
                  case "vec2":
                  case "vec3":
                    value = __this__[name].val();
                    break;

                  case "envMap":
                    break;
                }
                result[name] = value;
            }
        });
        result.id = result.id || result.name;
        return result;
    };
    RENDER.Material.prototype.constName = function(type) {
        var value = this[type];
        var con = hash[type].constant;
        for (c in con) {
            if (con[c] === value) {
                return c;
            }
        }
    };
    function Material(options, app, callback) {
        if (typeof this === "object" && !(this instanceof Material)) {
            return new Material(options, app, callback);
        }
        this.app = app;
        this.callback = callback;
        this.id = options.id;
        this.id || console.error("ID 不得为空！");
        var isyun = RegExp(app.get("yunid")).test(this.id);
        this.render = null;
        this.loaded = false;
        this.basic = null;
        this.lambert = null;
        this.phong = null;
        this.attributes = {};
        this.__maps__ = {};
        this.__init__();
        isyun ? this.yun() : this.val(options);
    }
    Material.prototype.__init__ = function() {
        this.basic = new RENDER.MeshBasicMaterial();
        this.lambert = new RENDER.MeshLambertMaterial();
        this.phong = new RENDER.MeshPhongMaterial();
    };
    Material.prototype.yun = function() {
        var loader = new Loader({
            url: this.app.get("yunHost") + "/material/" + this.id
        });
        var __this__ = this;
        loader.on("complete", function(event) {
            __this__.val(event.data);
        });
        loader.load();
    };
    Material.prototype.switchRender = function(type) {
        switch (type) {
          case "basic":
            this.render = this.basic;
            break;

          case "lambert":
            this.render = this.lambert;
            break;

          case "phong":
            this.render = this.phong;
            break;

          default:
            this.render = this.phong;
            break;
        }
    };
    Material.prototype.constName = function(type) {
        var value = this.attributes[type];
        var con = hash[type].constant;
        for (c in con) {
            if (con[c] === value) {
                return c;
            }
        }
    };
    Material.prototype.val = function(options) {
        var attrs = this.attributes;
        var __this__ = this;
        if (options !== undefined) {
            mix(options);
            this.set(options, true);
            this.createMaps();
        } else {
            var result = {};
            Object.keys(hash).forEach(function(name) {
                result[name] = __this__.get(name);
            });
            return result;
        }
    };
    Material.prototype.get = function(name) {
        return this.attributes[name];
    };
    Material.prototype.set = function(name, value, d) {
        if (typeof name === "object") {
            for (n in name) {
                this.set(n, name[n], value);
            }
        } else {
            if (!hash.hasOwnProperty(name)) {
                return this;
            }
            var result;
            var type = hash[name].setType;
            switch (type) {
              case "value":
              case "render":
                result = value;
                break;

              case "map":
                value && (this.__maps__[name] = value);
                break;

              case "const":
                result = hash[name].constant[value];
                break;

              case "color":
                result = math.num2color(value);
                break;

              case "envMap":
                break;

              case "vec2":
                result = math.arr2vec2(value);
                break;

              case "vec3":
                result = math.arr2vec3(value);
                break;
            }
            if (type === "render") {
                this.switchRender(result);
            } else if (type === "map") {
                d || this.createMaps();
            } else {
                this.basic[name] = result;
                this.lambert[name] = result;
                this.phong[name] = result;
            }
            this.attributes[name] = value;
        }
        return this;
    };
    Material.prototype.createMaps = function() {
        var app = this.app;
        var __this__ = this;
        var maps = this.__maps__;
        app.async.eachLimit(Object.keys(maps), 1, function(name, next) {
            var data = maps[name];
            if (typeof data === "string") {
                data = {
                    id: data
                };
            } else {
                data.id = data._id;
            }
            app.map(data, function(options, map) {
                var result = map.map.render;
                __this__.basic[name] = result;
                __this__.lambert[name] = result;
                __this__.phong[name] = result;
                __this__.basic.needsUpdate = true;
                __this__.lambert.needsUpdate = true;
                __this__.phong.needsUpdate = true;
                next(null, result);
            });
        }, function(err, data) {
            if (!__this__.loaded) {
                __this__.callback(__this__);
                __this__.loaded = true;
            }
        });
    };
    // 材质属性部分配置信息
    Material.config = [ {
        name: "name",
        cname: "名称",
        type: "string",
        "default": "",
        setType: "value"
    }, {
        name: "side",
        cname: "面",
        type: "select",
        "default": "front",
        setType: "const",
        options: [ {
            name: "正面",
            value: "front"
        }, {
            name: "反面",
            value: "back"
        }, {
            name: "双面",
            value: "double"
        } ],
        constant: {
            front: RENDER.FrontSide,
            back: RENDER.BackSide,
            "double": RENDER.DoubleSide
        }
    }, {
        name: "opacity",
        cname: "透明度",
        type: "number",
        "default": 1,
        setType: "value",
        min: 0,
        max: 1
    }, {
        name: "transparent",
        cname: "透明",
        type: "boolean",
        "default": false,
        setType: "value"
    }, {
        name: "blending",
        cname: "混合选项",
        type: "select",
        "default": "normal",
        setType: "const",
        options: [ {
            name: "无",
            value: "no"
        }, {
            name: "正常",
            value: "normal"
        }, {
            name: "叠加",
            value: "additive"
        }, {
            name: "差值",
            value: "subtractive"
        }, {
            name: "multiply",
            value: "multiply"
        }, {
            name: "custom",
            value: "custom"
        } ],
        constant: {
            no: RENDER.NoBlending,
            normal: RENDER.NormalBlending,
            additive: RENDER.AdditiveBlending,
            subtractive: RENDER.SubtractiveBlending,
            multiply: RENDER.MultiplyBlending,
            custom: RENDER.CustomBlending
        }
    }, {
        name: "blendSrc",
        cname: "混合Src",
        type: "select",
        "default": "srcAlpha",
        setType: "const",
        options: [ {
            name: "zero",
            value: "zero"
        }, {
            name: "one",
            value: "one"
        }, {
            name: "srcColor",
            value: "srcColor"
        }, {
            name: "oneMinusSrcColor",
            value: "oneMinusSrcColor"
        }, {
            name: "srcAlpha",
            value: "srcAlpha"
        }, {
            name: "oneMinusSrcAlpha",
            value: "oneMinusSrcAlpha"
        }, {
            name: "dstAlpha",
            value: "dstAlpha"
        }, {
            name: "oneMinusDstAlpha",
            value: "oneMinusDstAlpha"
        }, {
            name: "dstColor",
            value: "dstColor"
        }, {
            name: "oneMinusDstColor",
            value: "oneMinusDstColor"
        }, {
            name: "srcAlphaSaturate",
            value: "srcAlphaSaturate"
        } ],
        constant: {
            zero: RENDER.ZeroFactor,
            one: RENDER.OneFactor,
            srcColor: RENDER.SrcColorFactor,
            oneMinusSrcColor: RENDER.OneMinusSrcColorFactor,
            srcAlpha: RENDER.SrcAlphaFactor,
            oneMinusSrcAlpha: RENDER.OneMinusSrcAlphaFactor,
            dstAlpha: RENDER.DstAlphaFactor,
            oneMinusDstAlpha: RENDER.OneMinusDstAlphaFactor,
            dstColor: RENDER.DstColorFactor,
            oneMinusDstColor: RENDER.OneMinusDstColorFactor,
            srcAlphaSaturate: RENDER.SrcAlphaSaturateFactor
        }
    }, {
        name: "blendEquation",
        cname: "混合方程式",
        type: "select",
        "default": "add",
        setType: "const",
        options: [ {
            name: "add",
            value: "add"
        }, {
            name: "reverseSubtract",
            value: "reverseSubtract"
        }, {
            name: "subtract",
            value: "subtract"
        } ],
        constant: {
            add: RENDER.AddEquation,
            reverseSubtract: RENDER.ReverseSubtractEquation,
            subtract: RENDER.SubtractEquation
        }
    }, {
        name: "depthTest",
        cname: "深度测试",
        type: "boolean",
        "default": true,
        setType: "value",
        children: [ {
            name: "depthWrite",
            cname: "深度写入",
            type: "boolean",
            "default": true,
            setType: "value"
        } ]
    }, {
        name: "alphaTest",
        cname: "透明测试",
        type: "number",
        "default": 0,
        setType: "value",
        min: 0,
        max: 1
    }, {
        name: "polygonOffset",
        cname: "多边形偏移",
        type: "boolean",
        "default": false,
        setType: "value",
        children: [ {
            name: "polygonOffsetFactor",
            cname: "多边形偏移因素",
            type: "number",
            "default": 0,
            setType: "value"
        }, {
            name: "polygonOffsetUnits",
            cname: "多边形偏移单位",
            type: "number",
            "default": 0,
            setType: "value"
        } ]
    }, {
        name: "visible",
        cname: "可视",
        type: "boolean",
        "default": true,
        setType: "value"
    }, {
        name: "renderType",
        cname: "渲染类型",
        type: "select",
        "default": "phong",
        setType: "render",
        options: [ {
            name: "基础",
            value: "basic"
        }, {
            name: "普通",
            value: "lambert"
        }, {
            name: "质感",
            value: "phong"
        } ],
        children: [ {
            name: "color",
            cname: "颜色",
            type: "color",
            "default": 16777215,
            setType: "color"
        }, {
            name: "map",
            cname: "贴图",
            type: "map",
            "default": null,
            setType: "map"
        }, {
            name: "lightMap",
            cname: "灯光图",
            type: "map",
            "default": null,
            setType: "map"
        }, {
            name: "specularMap",
            cname: "高光图",
            type: "map",
            "default": null,
            setType: "map"
        }, {
            name: "envMap",
            cname: "环境贴图",
            type: "envMap",
            "default": null,
            setType: "envMap"
        }, {
            name: "combine",
            cname: "combine",
            type: "select",
            "default": "multiply",
            setType: "const",
            options: [ {
                name: "multiply",
                value: "multiply"
            }, {
                name: "mix",
                value: "mix"
            }, {
                name: "add",
                value: "add"
            } ],
            constant: {
                multiply: RENDER.MultiplyOperation,
                mix: RENDER.MixOperation,
                add: RENDER.AddOperation
            }
        }, {
            name: "reflectivity",
            cname: "反射",
            type: "number",
            "default": 1,
            setType: "value"
        }, {
            name: "refractionRatio",
            cname: "折光率",
            type: "number",
            "default": .98,
            setType: "value"
        }, {
            name: "fog",
            cname: "雾",
            type: "boolean",
            "default": true,
            setType: "value"
        }, {
            name: "shading",
            cname: "阴影",
            type: "select",
            "default": "smooth",
            setType: "const",
            options: [ {
                name: "no",
                value: "no"
            }, {
                name: "flat",
                value: "flat"
            }, {
                name: "smooth",
                value: "smooth"
            } ],
            constant: {
                no: RENDER.NoShading,
                flat: RENDER.FlatShading,
                smooth: RENDER.SmoothShading
            }
        }, {
            name: "wireframe",
            cname: "线框",
            type: "boolean",
            "default": false,
            setType: "value",
            children: [ {
                name: "wireframeLinewidth",
                cname: "线框宽度",
                type: "number",
                "default": 1,
                setType: "value",
                min: 0,
                max: 100
            }, {
                name: "wireframeLinecap",
                cname: "wireframeLinecap",
                type: "string",
                "default": "round",
                setType: "value"
            }, {
                name: "wireframeLinejoin",
                cname: "wireframeLinejoin",
                type: "string",
                "default": "round",
                setType: "value"
            } ]
        }, {
            name: "vertexColors",
            cname: "顶点颜色",
            type: "select",
            "default": "no",
            setType: "const",
            options: [ {
                name: "no",
                value: "no"
            }, {
                name: "face",
                value: "face"
            }, {
                name: "vertex",
                value: "vertex"
            } ],
            constant: {
                no: RENDER.NoColors,
                face: RENDER.FaceColors,
                vertex: RENDER.VertexColors
            }
        }, {
            name: "skinning",
            cname: "skinning",
            type: "boolean",
            "default": false,
            setType: "value"
        }, {
            name: "morphTargets",
            cname: "morphTargets",
            type: "boolean",
            "default": false,
            setType: "value"
        }, {
            name: "ambient",
            cname: "环境光",
            type: "color",
            "default": 16777215,
            setType: "color"
        }, {
            name: "emissive",
            cname: "反射光",
            type: "color",
            "default": 0,
            setType: "color"
        }, {
            name: "wrapAround",
            cname: "wrapAround",
            type: "boolean",
            "default": false,
            setType: "value",
            children: [ {
                name: "wrapRGB",
                cname: "wrapRGB",
                type: "array",
                "default": [ 1, 1, 1 ],
                setType: "vec3"
            } ]
        }, {
            name: "morphNormals",
            cname: "morphNormals",
            type: "boolean",
            "default": false,
            setType: "value"
        }, {
            name: "specular",
            cname: "高光",
            type: "color",
            "default": 1118481,
            setType: "color"
        }, {
            name: "shininess",
            cname: "光泽度",
            type: "number",
            "default": 30,
            setType: "value",
            min: 0,
            max: 100
        }, {
            name: "metal",
            cname: "金属质感",
            type: "boolean",
            "default": false,
            setType: "value"
        }, {
            name: "perPixel",
            cname: "perPixel",
            type: "boolean",
            "default": true,
            setType: "value"
        }, {
            name: "bumpMap",
            cname: "bumpMap",
            type: "map",
            "default": null,
            setType: "map",
            children: [ {
                name: "bumpScale",
                cname: "bumpScale",
                type: "number",
                "default": 1,
                setType: "value"
            } ]
        }, {
            name: "normalMap",
            cname: "法线图",
            type: "map",
            "default": null,
            setType: "map",
            children: [ {
                name: "normalScale",
                cname: "法线图尺寸",
                type: "array",
                "default": [ 1, 1 ],
                setType: "vec2"
            } ]
        } ]
    } ];
    var hash = Material.config.hash = {};
    (function child(arr) {
        arr.forEach(function(x) {
            hash[x.name] = x;
            if (x.children && x.children.length) {
                child(x.children);
            }
        });
    })(Material.config);
    // Material 独有
    var matAttrs = Material.config.matAttrs = {};
    matAttrs.mat = [ "side", "opacity", "transparent", "blending", "blendSrc", "blendDst", "blendEquation", "depthTest", "depthWrite", "polygonOffset", "polygonOffsetFactor", "polygonOffsetUnits", "alphaTest", "overdraw", "visible" ];
    matAttrs.basic = [ "color", "map", "lightMap", "specularMap", "envMap", "combine", "reflectivity", "refractionRatio", "fog", "shading", "wireframe", "wireframeLinewidth", "wireframeLinecap", "wireframeLinejoin", "vertexColors", "skinning", "morphTargets" ];
    matAttrs.lambert = [ "ambient", "emissive", "wrapAround", "wrapRGB", "morphNormals" ].concat(matAttrs.basic);
    matAttrs.phong = [ "specular", "shininess", "metal", "perPixel", "bumpMap", "bumpScale", "normalMap", "normalScale" ].concat(matAttrs.lambert);
    module.exports = Material;
});
